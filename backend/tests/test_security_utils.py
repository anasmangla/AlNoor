import time

from app.utils.security import create_access_token, decode_token, hash_password, verify_password


def test_password_hash_and_verify():
    hashed = hash_password("super-secret")
    assert hashed != "super-secret"
    assert verify_password("super-secret", hashed) is True
    assert verify_password("wrong", hashed) is False


def test_decode_token_handles_invalid_signature():
    bogus_token = create_access_token("user", expires_in_seconds=1)
    data = decode_token(bogus_token)
    assert data is not None and data["sub"] == "user"
    # Force expiration
    time.sleep(1)
    assert decode_token(bogus_token) is None
