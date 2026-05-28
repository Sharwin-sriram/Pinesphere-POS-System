from rest_framework.response import Response
from rest_framework import status


def success_response(data=None, meta=None, status_code=status.HTTP_200_OK):
    return Response({"success": True, "data": data or {}, "meta": meta or {}}, status=status_code)


def error_response(code: str, message: str, details=None, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({"success": False, "error": {"code": code, "message": message, "details": details or []}}, status=status_code)
