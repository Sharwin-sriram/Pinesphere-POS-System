"""Custom storage backends used by the authentication service."""

from __future__ import annotations

import hashlib
import json
import mimetypes
import os
import time
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage


class CloudinaryMediaStorage(Storage):
    """Store uploaded media in Cloudinary while preserving the ImageField API."""

    cloudinary_prefix = "cloudinary/"

    def _is_cloudinary_name(self, name: str) -> bool:
        return name.startswith(self.cloudinary_prefix)

    def _cloudinary_name(self, name: str) -> str:
        if self._is_cloudinary_name(name):
            return name[len(self.cloudinary_prefix) :]
        return name.lstrip("/")

    def _cloudinary_delivery_url(self) -> str:
        return f"https://res.cloudinary.com/{settings.CLOUDINARY_CLOUD_NAME}/image/upload"

    def _cloudinary_upload_url(self) -> str:
        return f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/image/upload"

    def _cloudinary_destroy_url(self) -> str:
        return f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/image/destroy"

    def _sign_payload(self, params: dict[str, object]) -> str:
        excluded_keys = {"api_key", "signature", "file", "resource_type", "cloud_name"}
        payload = "&".join(
            f"{key}={params[key]}" for key in sorted(params) if key not in excluded_keys
        )
        digest = hashlib.sha1(f"{payload}{settings.CLOUDINARY_API_SECRET}".encode("utf-8"))
        return digest.hexdigest()

    def _build_multipart_body(
        self,
        fields: dict[str, object],
        file_name: str,
        file_bytes: bytes,
        content_type: str,
    ) -> tuple[bytes, str]:
        boundary = f"----CloudinaryBoundary{time.time_ns()}"
        lines: list[bytes] = []

        for key, value in fields.items():
            lines.append(f"--{boundary}\r\n".encode("utf-8"))
            lines.append(
                f'Content-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n'.encode("utf-8")
            )

        lines.append(f"--{boundary}\r\n".encode("utf-8"))
        lines.append(
            (
                f'Content-Disposition: form-data; name="file"; filename="{file_name}"\r\n'
                f"Content-Type: {content_type}\r\n\r\n"
            ).encode("utf-8")
        )
        lines.append(file_bytes)
        lines.append(b"\r\n")
        lines.append(f"--{boundary}--\r\n".encode("utf-8"))

        return b"".join(lines), boundary

    def _request_json(
        self,
        url: str,
        fields: dict[str, object],
        file_name: str | None = None,
        file_bytes: bytes | None = None,
        content_type: str = "application/octet-stream",
    ) -> dict:
        request_fields = {key: str(value) for key, value in fields.items()}

        if file_name is not None and file_bytes is not None:
            body, boundary = self._build_multipart_body(request_fields, file_name, file_bytes, content_type)
            headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
        else:
            body = "&".join(f"{key}={quote(str(value))}" for key, value in request_fields.items()).encode("utf-8")
            headers = {"Content-Type": "application/x-www-form-urlencoded"}

        request = Request(url, data=body, headers=headers)
        with urlopen(request, timeout=30) as response:
            payload = response.read().decode("utf-8")
        return json.loads(payload)

    def _upload_to_cloudinary(self, name: str, content) -> str:
        original_name = os.path.basename(name or getattr(content, "name", "upload"))
        cloudinary_name = self._cloudinary_name(name or original_name)
        public_id = cloudinary_name.rsplit(".", 1)[0]

        try:
            current_position = content.tell()
            content.seek(0)
        except Exception:
            current_position = None

        file_bytes = content.read()
        content_type = getattr(content, "content_type", None) or mimetypes.guess_type(original_name)[0] or "application/octet-stream"

        upload_fields = {
            "timestamp": int(time.time()),
            "public_id": public_id,
            "overwrite": "true",
            "invalidate": "true",
        }
        upload_fields["signature"] = self._sign_payload(upload_fields)
        upload_fields["api_key"] = settings.CLOUDINARY_API_KEY

        response = self._request_json(
            self._cloudinary_upload_url(),
            upload_fields,
            file_name=original_name,
            file_bytes=file_bytes,
            content_type=content_type,
        )

        if current_position is not None:
            try:
                content.seek(current_position)
            except Exception:
                pass

        secure_url = response.get("secure_url")
        if not secure_url:
            raise OSError("Cloudinary upload did not return a secure URL")
        return secure_url

    def _delete_from_cloudinary(self, name: str) -> None:
        cloudinary_name = self._cloudinary_name(name)
        destroy_fields = {
            "timestamp": int(time.time()),
            "public_id": cloudinary_name.rsplit(".", 1)[0],
            "invalidate": "true",
        }
        destroy_fields["signature"] = self._sign_payload(destroy_fields)
        destroy_fields["api_key"] = settings.CLOUDINARY_API_KEY
        self._request_json(self._cloudinary_destroy_url(), destroy_fields)

    def _save(self, name, content):
        if not settings.USE_CLOUDINARY:
            return FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)._save(name, content)

        self._upload_to_cloudinary(name, content)
        return self._storage_name(name)

    def _storage_name(self, name: str) -> str:
        normalized = self._cloudinary_name(name).lstrip("/")
        return f"{self.cloudinary_prefix}{normalized}"

    def delete(self, name):
        if not name:
            return
        if self._is_cloudinary_name(name):
            self._delete_from_cloudinary(name)
            return
        local_path = Path(settings.MEDIA_ROOT) / name
        if local_path.exists():
            local_path.unlink()

    def exists(self, name):
        return False

    def url(self, name):
        if self._is_cloudinary_name(name):
            asset_name = self._cloudinary_name(name)
            return f"{self._cloudinary_delivery_url()}/{quote(asset_name, safe='/_.-')}"
        return f"{settings.MEDIA_URL.rstrip('/')}/{name.lstrip('/')}"

    def path(self, name):
        if self._is_cloudinary_name(name):
            raise NotImplementedError("Cloudinary assets do not have a local filesystem path")
        return str(Path(settings.MEDIA_ROOT) / name)