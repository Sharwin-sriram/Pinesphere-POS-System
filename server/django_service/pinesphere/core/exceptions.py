from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


class ServiceError(Exception):
    def __init__(self, code: str, message: str, details=None, status_code=400):
        self.code = code
        self.message = message
        self.details = details or []
        self.status_code = status_code
        super().__init__(message)


def custom_exception_handler(exc, context):
    """Wrap DRF exceptions and custom ServiceError into the required envelope."""
    # Let DRF first handle standard exceptions
    response = drf_exception_handler(exc, context)

    if response is not None:
        message = None
        details = []
        code = "error"

        # If DRF produced a dict body, extract useful info
        if isinstance(response.data, dict):
            # DRF validation errors are field->list mapping
            message = response.data.get("detail") or "Validation failed"
            # collect field errors
            details = []
            for k, v in response.data.items():
                details.append({"field": k, "messages": v})

        envelope = {
            "success": False,
            "error": {"code": code, "message": str(message), "details": details},
        }
        return Response(envelope, status=response.status_code)

    # Handle our ServiceError
    if isinstance(exc, ServiceError):
        envelope = {
            "success": False,
            "error": {"code": exc.code, "message": exc.message, "details": exc.details},
        }
        return Response(envelope, status=exc.status_code)

    # Fallback - unhandled exception
    envelope = {
        "success": False,
        "error": {"code": "server_error", "message": "Internal server error", "details": []},
    }
    return Response(envelope, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
