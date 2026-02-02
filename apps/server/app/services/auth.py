from __future__ import annotations

from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException, Request, status
from jose import JWTError, jwk, jwt


@dataclass(frozen=True)
class AuthUser:
    user_id: str
    email: str | None = None


def _get_auth_config_from_app(app) -> tuple[str, str]:
    settings = app.state.settings
    return settings.supabase_jwt_secret, settings.supabase_jwt_aud


def _get_jwks_from_app(app) -> list[dict]:
    jwks = getattr(app.state, "supabase_jwks", None)
    return jwks or []


def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
) -> AuthUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = authorization.replace("Bearer ", "", 1).strip()
    return get_user_from_token(request, token)


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


AuthDependency = Depends(get_current_user)
