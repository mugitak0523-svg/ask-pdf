from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import anyio
import stripe
from fastapi import APIRouter, HTTPException, Request, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser

router = APIRouter()


def _get_stripe_config(request: Request) -> dict[str, str]:
    settings = request.app.state.settings
    return {
        "secret_key": settings.stripe_secret_key,
        "webhook_secret": settings.stripe_webhook_secret,
        "price_plus": settings.stripe_plus_price_id,
        "price_pro": settings.stripe_pro_price_id,
        "app_base_url": settings.app_base_url,
    }


def _init_stripe(secret_key: str) -> None:
    stripe.api_key = secret_key


def _plan_from_price(price_id: str | None, price_plus: str, price_pro: str) -> str | None:
    if not price_id:
        return None
    if price_id == price_plus:
        return "plus"
    if price_id == price_pro:
        return "pro"
    return None


def _plan_from_metadata(metadata: dict[str, Any] | None) -> str | None:
    if not metadata:
        return None
    plan = str(metadata.get("plan") or "")
    return plan if plan in {"plus", "pro"} else None


async def _create_customer(
    *,
    secret_key: str,
    user_id: str,
    email: str | None,
) -> stripe.Customer:
    _init_stripe(secret_key)

    def _run() -> stripe.Customer:
        return stripe.Customer.create(
            email=email,
            metadata={"user_id": user_id},
        )

    return await anyio.to_thread.run_sync(_run)


async def _create_checkout_session(
    *,
    secret_key: str,
    app_base_url: str,
    price_id: str,
    customer_id: str,
    user_id: str,
    plan: str,
) -> stripe.checkout.Session:
    _init_stripe(secret_key)

    def _run() -> stripe.checkout.Session:
        return stripe.checkout.Session.create(
            mode="subscription",
            customer=customer_id,
            client_reference_id=user_id,
            metadata={"user_id": user_id, "plan": plan},
            line_items=[{"price": price_id, "quantity": 1}],
            subscription_data={"metadata": {"user_id": user_id, "plan": plan}},
            success_url=f"{app_base_url}/?checkout=success",
            cancel_url=f"{app_base_url}/?checkout=cancel",
        )

    return await anyio.to_thread.run_sync(_run)


async def _create_portal_session(
    *,
    secret_key: str,
    app_base_url: str,
    customer_id: str,
) -> stripe.billing_portal.Session:
    _init_stripe(secret_key)

    def _run() -> stripe.billing_portal.Session:
        return stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=f"{app_base_url}/",
        )

    return await anyio.to_thread.run_sync(_run)


async def _retrieve_subscription(secret_key: str, subscription_id: str) -> stripe.Subscription:
    _init_stripe(secret_key)

    def _run() -> stripe.Subscription:
        return stripe.Subscription.retrieve(subscription_id)

    return await anyio.to_thread.run_sync(_run)


async def _update_subscription_price(
    *,
    secret_key: str,
    subscription_id: str,
    price_id: str,
    plan: str,
) -> stripe.Subscription:
    subscription = await _retrieve_subscription(secret_key, subscription_id)
    items = subscription.get("items", {}).get("data", [])
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription items")
    item_id = items[0].get("id")
    if not item_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription item id")

    _init_stripe(secret_key)

    def _run() -> stripe.Subscription:
        return stripe.Subscription.modify(
            subscription_id,
            items=[{"id": item_id, "price": price_id}],
            proration_behavior="create_prorations",
            metadata={"plan": plan},
        )

    return await anyio.to_thread.run_sync(_run)

async def _create_schedule_for_downgrade(
    *,
    secret_key: str,
    subscription: stripe.Subscription,
    target_price_id: str,
) -> stripe.SubscriptionSchedule:
    _init_stripe(secret_key)
    items = subscription.get("items", {}).get("data", [])
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription items")
    current_price_id = items[0].get("price", {}).get("id")
    current_start = subscription.get("current_period_start")
    current_end = subscription.get("current_period_end")

    def _run() -> stripe.SubscriptionSchedule:
        return stripe.SubscriptionSchedule.create(
            customer=subscription.get("customer"),
            end_behavior="release",
            phases=[
                {
                    "items": [{"price": current_price_id, "quantity": 1}],
                    "start_date": current_start,
                    "end_date": current_end,
                    "proration_behavior": "none",
                },
                {
                    "items": [{"price": target_price_id, "quantity": 1}],
                    "start_date": current_end,
                    "proration_behavior": "none",
                },
            ],
        )

    return await anyio.to_thread.run_sync(_run)


@router.post("/billing/checkout")
async def create_checkout(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    plan = str(payload.get("plan") or "")
    if plan not in {"plus", "pro"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    config = _get_stripe_config(request)
    price_id = config["price_plus"] if plan == "plus" else config["price_pro"]

    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    customer_id = billing.get("stripe_customer_id") if billing else None
    subscription_id = billing.get("stripe_subscription_id") if billing else None

    if subscription_id:
        await _update_subscription_price(
            secret_key=config["secret_key"],
            subscription_id=subscription_id,
            price_id=price_id,
            plan=plan,
        )
        return {"status": "ok"}

    if not customer_id:
        customer = await _create_customer(
            secret_key=config["secret_key"],
            user_id=user.user_id,
            email=user.email,
        )
        customer_id = customer.id
        await repository.upsert_user_billing(
            pool,
            user.user_id,
            stripe_customer_id=customer_id,
        )

    session = await _create_checkout_session(
        secret_key=config["secret_key"],
        app_base_url=config["app_base_url"],
        price_id=price_id,
        customer_id=customer_id,
        user_id=user.user_id,
        plan=plan,
    )
    return {"url": session.url}


@router.post("/billing/portal")
async def create_portal(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    config = _get_stripe_config(request)
    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    customer_id = billing.get("stripe_customer_id") if billing else None

    if not customer_id:
        customer = await _create_customer(
            secret_key=config["secret_key"],
            user_id=user.user_id,
            email=user.email,
        )
        customer_id = customer.id
        await repository.upsert_user_billing(
            pool,
            user.user_id,
            stripe_customer_id=customer_id,
        )

    portal = await _create_portal_session(
        secret_key=config["secret_key"],
        app_base_url=config["app_base_url"],
        customer_id=customer_id,
    )
    return {"url": portal.url}


@router.post("/billing/cancel")
async def cancel_subscription(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    config = _get_stripe_config(request)
    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    subscription_id = billing.get("stripe_subscription_id") if billing else None
    if not subscription_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription")

    _init_stripe(config["secret_key"])

    def _run() -> stripe.Subscription:
        return stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)

    await anyio.to_thread.run_sync(_run)
    return {"status": "ok"}


@router.post("/billing/downgrade")
async def schedule_downgrade(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    target_plan = str(payload.get("plan") or "")
    if target_plan not in {"free", "plus"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    config = _get_stripe_config(request)
    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    subscription_id = billing.get("stripe_subscription_id") if billing else None
    if not subscription_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription")

    if target_plan == "free":
        _init_stripe(config["secret_key"])

        def _run_cancel() -> stripe.Subscription:
            return stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)

        await anyio.to_thread.run_sync(_run_cancel)
        return {"status": "ok"}

    if target_plan == "plus":
        subscription = await _retrieve_subscription(config["secret_key"], subscription_id)
        schedule = await _create_schedule_for_downgrade(
            secret_key=config["secret_key"],
            subscription=subscription,
            target_price_id=config["price_plus"],
        )
        await repository.upsert_user_billing(
            pool,
            user.user_id,
            stripe_schedule_id=schedule.get("id"),
        )
        return {"status": "ok"}

    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")


@router.post("/billing/webhook")
async def stripe_webhook(request: Request) -> dict[str, str]:
    config = _get_stripe_config(request)
    _init_stripe(config["secret_key"])
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature")
    if not signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=config["webhook_secret"],
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature") from exc

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")
        user_id = data_object.get("client_reference_id") or data_object.get("metadata", {}).get("user_id")
        plan = _plan_from_metadata(data_object.get("metadata"))
        if customer_id and user_id:
            await repository.upsert_user_billing(
                request.app.state.db_pool,
                user_id,
                plan=plan,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription_id,
            )
        return {"status": "ok"}

    if event_type in {
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    }:
        subscription = data_object
        customer_id = subscription.get("customer")
        status_value = subscription.get("status")
        items = subscription.get("items", {}).get("data", [])
        price_id = items[0].get("price", {}).get("id") if items else None
        plan = _plan_from_price(price_id, config["price_plus"], config["price_pro"])
        if not plan:
            plan = _plan_from_metadata(subscription.get("metadata"))
        if status_value not in {"active", "trialing"}:
            plan = "free"

        user_id = None
        if customer_id:
            user_id = await repository.get_user_id_by_stripe_customer_id(
                request.app.state.db_pool,
                customer_id,
            )
        if not user_id:
            user_id = subscription.get("metadata", {}).get("user_id")

        if user_id:
            period_end = subscription.get("current_period_end")
            period_end_dt = (
                datetime.fromtimestamp(period_end, tz=timezone.utc)
                if isinstance(period_end, (int, float))
                else None
            )
            await repository.upsert_user_billing(
                request.app.state.db_pool,
                user_id,
                plan=plan,
                stripe_customer_id=customer_id,
                stripe_subscription_id=subscription.get("id"),
                stripe_price_id=price_id,
                stripe_status=status_value,
                current_period_end=period_end_dt,
            )
        return {"status": "ok"}

    return {"status": "ignored"}
