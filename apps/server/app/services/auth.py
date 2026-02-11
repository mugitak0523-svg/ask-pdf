from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, Header, HTTPException, Request, status
from jose import JWTError, jwk, jwt


@dataclass(frozen=True)
class AuthUser:
    user_id: str
    email: str | None = None
    is_guest: bool = False


def _normalize_guest_token(token: str) -> str | None:
    try:
        return str(UUID(token))
    except (TypeError, ValueError):
        return None


def _get_auth_config_from_app(app) -> tuple[str, str]:
    settings = app.state.settings
    return settings.supabase_jwt_secret, settings.supabase_jwt_aud


def _get_jwks_from_app(app) -> list[dict]:
    jwks = getattr(app.state, "supabase_jwks", None)
    return jwks or []


def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    x_guest_token: str | None = Header(default=None, alias="X-Guest-Token"),
) -> AuthUser:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "", 1).strip()
        try:
            return get_user_from_token(request, token)
        except HTTPException:
            guest_id = _normalize_guest_token(token)
            if guest_id:
                return AuthUser(user_id=guest_id, is_guest=True)
            raise

    if x_guest_token:
        guest_id = _normalize_guest_token(x_guest_token)
        if guest_id:
            return AuthUser(user_id=guest_id, is_guest=True)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")


def get_user_from_token(request: Request, token: str) -> AuthUser:
    secret, audience = _get_auth_config_from_app(request.app)
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        if alg == "HS256":
            payload = jwt.decode(token, secret, algorithms=["HS256"], audience=audience)
        else:
            jwks = _get_jwks_from_app(request.app)
            kid = header.get("kid")
            key_data = next((key for key in jwks if key.get("kid") == kid), None)
            if not key_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )
            key = jwk.construct(key_data)
            payload = jwt.decode(
                token,
                key.to_pem().decode("utf-8"),
                algorithms=[alg],
                audience=audience,
            )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return AuthUser(user_id=user_id, email=payload.get("email"))


def get_user_from_token_app(app, token: str) -> AuthUser:
    secret, audience = _get_auth_config_from_app(app)
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        if alg == "HS256":
            payload = jwt.decode(token, secret, algorithms=["HS256"], audience=audience)
        else:
            jwks = _get_jwks_from_app(app)
            kid = header.get("kid")
            key_data = next((key for key in jwks if key.get("kid") == kid), None)
            if not key_data:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token",
                )
            key = jwk.construct(key_data)
            payload = jwt.decode(
                token,
                key.to_pem().decode("utf-8"),
                algorithms=[alg],
                audience=audience,
            )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return AuthUser(user_id=user_id, email=payload.get("email"))


def get_user_from_token_or_guest_app(app, token: str, token_type: str | None) -> AuthUser:
    if token_type == "guest" or token_type is None:
        guest_id = _normalize_guest_token(token)
        if guest_id:
            return AuthUser(user_id=guest_id, is_guest=True)
        if token_type == "guest":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return get_user_from_token_app(app, token)


AuthDependency = Depends(get_current_user)
