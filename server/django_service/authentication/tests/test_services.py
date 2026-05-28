import pytest


@pytest.mark.django_db
class TestAuthService:
    def test_generate_otp_smoke(self):
        from authentication.services.otp_service import generate_otp

        otp = generate_otp()
        assert isinstance(otp, str)
        assert len(otp) == 6

    @pytest.mark.django_db
    def test_lock_account_after_failures_stub(self):
        """
        Stub: implement once Redis is available in CI/local env.
        Should increment failures and lock after max attempts.
        """

        from django.contrib.auth import get_user_model
        from authentication.services.auth_service import AuthService

        User = get_user_model()
        user = User.objects.create_user(
            mobile="9999999999",
            password="StrongPassw0rd!",
            email="lock@test.com",
            first_name="Test",
            last_name="User",
            role=User.RoleChoices.CUSTOMER,
            restaurant_id=None,
            branch_id=None,
            is_active=True,
            is_staff=False,
        )

        # NOTE: This will require Redis configured via settings.REDIS_URL.
        # The assertion is intentionally minimal to keep as a stub.
        assert user.id
        assert hasattr(AuthService, "lock_account_after_failures")

    @pytest.mark.django_db
    def test_register_device_stub(self):
        """
        Stub: should create/refresh UserSession for given fingerprint.
        """

        from django.contrib.auth import get_user_model
        from authentication.services.auth_service import AuthService
        from authentication.models import UserSession

        User = get_user_model()
        user = User.objects.create_user(
            mobile="8888888888",
            password="StrongPassw0rd!",
            email="device@test.com",
            first_name="Test",
            last_name="User",
            role=User.RoleChoices.CUSTOMER,
            restaurant_id=None,
            branch_id=None,
            is_active=True,
            is_staff=False,
        )

        session = AuthService.register_device(
            user=user,
            device_fingerprint="fp-123",
            device_type=UserSession.DeviceType.WEB,
            ip_address="127.0.0.1",
        )
        assert session.user_id == user.id
        assert session.device_id == "fp-123"

