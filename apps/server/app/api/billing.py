from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
import logging

import anyio
import stripe
from fastapi import APIRouter, HTTPException, Request, status

from app.db import repository
from app.services.auth import AuthDependency, AuthUser

router = APIRouter()
logger = logging.getLogger("uvicorn.error")


def _get_stripe_config(request: Request) -> dict[str, str]:
    settings = request.app.state.settings
    return {
        "secret_key": settings.stripe_secret_key,
        "webhook_secret": settings.stripe_webhook_secret,
        "price_plus": settings.stripe_plus_price_id,
        "app_base_url": settings.app_base_url,
    }


def _init_stripe(secret_key: str) -> None:
    stripe.api_key = secret_key


def _plan_from_price(price_id: str | None, price_plus: str) -> str | None:
    if not price_id:
        return None
    if price_id == price_plus:
        return "plus"
    return None


def _plan_from_metadata(metadata: dict[str, Any] | None) -> str | None:
    if not metadata:
        return None
    plan = str(metadata.get("plan") or "")
    if plan == "pro":
        return "plus"
    return plan if plan in {"plus"} else None


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


async def _list_invoices(secret_key: str, customer_id: str) -> list[dict[str, Any]]:
    _init_stripe(secret_key)

    def _run() -> stripe.ListObject:
        return stripe.Invoice.list(customer=customer_id, limit=5)

    invoices = await anyio.to_thread.run_sync(_run)
    results: list[dict[str, Any]] = []
    for invoice in invoices.get("data", []):
        line_items = []
        for line in invoice.get("lines", {}).get("data", []) or []:
            period = line.get("period") or {}
            line_items.append(
                {
                    "id": line.get("id"),
                    "description": line.get("description"),
                    "amount": line.get("amount"),
                    "currency": line.get("currency") or invoice.get("currency"),
                    "proration": line.get("proration"),
                    "periodStart": period.get("start"),
                    "periodEnd": period.get("end"),
                }
            )
        results.append(
            {
                "id": invoice.get("id"),
                "status": invoice.get("status"),
                "amountPaid": invoice.get("amount_paid"),
                "currency": invoice.get("currency"),
                "created": invoice.get("created"),
                "hostedInvoiceUrl": invoice.get("hosted_invoice_url"),
                "lines": line_items,
                "periodEnd": invoice.get("period_end"),
            }
        )
    return results


async def _get_upcoming_invoice(
    secret_key: str,
    customer_id: str,
    subscription_id: str | None,
) -> dict[str, Any] | None:
    _init_stripe(secret_key)

    if not subscription_id:
        return None

    def _run() -> stripe.Invoice:
        return stripe.Invoice.create_preview(
            customer=customer_id,
            subscription=subscription_id,
            preview_mode="recurring",
        )

    try:
        invoice = await anyio.to_thread.run_sync(_run)
    except Exception:
        return None
    return {
        "amountDue": invoice.get("amount_due"),
        "currency": invoice.get("currency"),
        "nextPaymentAt": (
            invoice.get("next_payment_attempt")
            or invoice.get("due_date")
            or invoice.get("period_end")
        ),
    }

@router.post("/billing/checkout")
async def create_checkout(
    request: Request,
    payload: dict[str, Any],
    user: AuthUser = AuthDependency,
) -> dict[str, str]:
    plan = str(payload.get("plan") or "")
    if plan not in {"plus"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    config = _get_stripe_config(request)
    price_id = config["price_plus"]

    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    customer_id = billing.get("stripe_customer_id") if billing else None
    subscription_id = billing.get("stripe_subscription_id") if billing else None

    if subscription_id:
        subscription = await _retrieve_subscription(config["secret_key"], subscription_id)
        status_value = subscription.get("status")
        if status_value not in {"canceled", "incomplete_expired"}:
            await _update_subscription_price(
                secret_key=config["secret_key"],
                subscription_id=subscription_id,
                price_id=price_id,
                plan=plan,
            )
            return {"status": "ok"}
        subscription_id = None

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

    try:
        session = await _create_checkout_session(
            secret_key=config["secret_key"],
            app_base_url=config["app_base_url"],
            price_id=price_id,
            customer_id=customer_id,
            user_id=user.user_id,
            plan=plan,
        )
    except stripe.error.InvalidRequestError as exc:
        message = str(exc)
        if customer_id and "No such customer" in message:
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
        else:
            raise
    return {"url": session.url}


@router.get("/billing/me")
async def get_billing_summary(
    request: Request,
    user: AuthUser = AuthDependency,
) -> dict[str, Any]:
    config = _get_stripe_config(request)
    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    if not billing:
        return {"plan": "free", "status": None, "currentPeriodEnd": None, "nextPlan": None}

    customer_id = billing.get("stripe_customer_id")
    subscription_id = billing.get("stripe_subscription_id")
    next_plan = None
    next_plan_at = None
    cancel_at_period_end = None

    invoices: list[dict[str, Any]] = []
    upcoming: dict[str, Any] | None = None
    subscription_fallback: stripe.Subscription | None = None
    if customer_id:
        invoices = await _list_invoices(config["secret_key"], customer_id)
        upcoming = await _get_upcoming_invoice(
            config["secret_key"],
            customer_id,
            subscription_id,
        )
        if not subscription_id:
            try:
                _init_stripe(config["secret_key"])
                subs = await anyio.to_thread.run_sync(
                    lambda: stripe.Subscription.list(customer=customer_id, status="all", limit=1)
                )
                data = subs.get("data", []) if subs else []
                if data:
                    subscription_fallback = data[0]
                    subscription_id = subscription_fallback.get("id")
            except Exception:
                subscription_fallback = None

    plan_value = billing.get("plan")
    if plan_value == "pro":
        plan_value = "plus"
    current_period_end = billing.get("current_period_end")
    if subscription_id:
        try:
            subscription = (
                subscription_fallback
                if subscription_fallback and subscription_fallback.get("id") == subscription_id
                else await _retrieve_subscription(config["secret_key"], subscription_id)
            )
            period_end = subscription.get("current_period_end")
            if not period_end:
                items = subscription.get("items", {}).get("data", [])
                if items:
                    period_end = items[0].get("current_period_end")
            if not current_period_end and isinstance(period_end, (int, float)):
                current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)
                await repository.upsert_user_billing(
                    request.app.state.db_pool,
                    user.user_id,
                    current_period_end=current_period_end,
                )
            cancel_at_period_end = subscription.get("cancel_at_period_end")
            if subscription_id and billing and billing.get("stripe_subscription_id") != subscription_id:
                await repository.upsert_user_billing(
                    request.app.state.db_pool,
                    user.user_id,
                    stripe_subscription_id=subscription_id,
                )
        except Exception:
            current_period_end = None
            cancel_at_period_end = None
    if not current_period_end and invoices:
        latest = invoices[0]
        period_end = latest.get("periodEnd")
        if not period_end and latest.get("lines"):
            period_end = latest["lines"][0].get("periodEnd")
        if isinstance(period_end, (int, float)):
            current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)

    return {
        "plan": plan_value,
        "status": billing.get("stripe_status"),
        "currentPeriodEnd": current_period_end.isoformat() if current_period_end else None,
        "cancelAtPeriodEnd": cancel_at_period_end,
        "nextPlan": next_plan,
        "nextPlanAt": next_plan_at,
        "upcomingInvoice": upcoming,
        "invoices": invoices,
    }


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
    if target_plan not in {"free"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid plan")

    config = _get_stripe_config(request)
    pool = request.app.state.db_pool
    billing = await repository.get_user_billing(pool, user.user_id)
    subscription_id = billing.get("stripe_subscription_id") if billing else None
    if not subscription_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No subscription")

    if target_plan == "free":
        subscription = await _retrieve_subscription(config["secret_key"], subscription_id)
        schedule_id = subscription.get("schedule")
        _init_stripe(config["secret_key"])

        if schedule_id:
            def _run_cancel_schedule() -> stripe.SubscriptionSchedule:
                schedule = stripe.SubscriptionSchedule.retrieve(schedule_id)
                phases = schedule.get("phases", []) or []
                current_phase = phases[0] if phases else None
                if current_phase and current_phase.get("end_date"):
                    return stripe.SubscriptionSchedule.modify(
                        schedule_id,
                        end_behavior="cancel",
                    )
                current_end = subscription.get("current_period_end")
                return stripe.SubscriptionSchedule.modify(
                    schedule_id,
                    end_behavior="cancel",
                    phases=[
                        {
                            "items": current_phase.get("items") if current_phase else [],
                            "start_date": current_phase.get("start_date") if current_phase else None,
                            "end_date": current_end,
                            "proration_behavior": "none",
                        }
                    ],
                )

            await anyio.to_thread.run_sync(_run_cancel_schedule)
            return {"status": "ok"}

        def _run_cancel() -> stripe.Subscription:
            return stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)

        await anyio.to_thread.run_sync(_run_cancel)
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
    logger.info(
        "stripe_webhook event=%s object=%s",
        event_type,
        data_object.get("object"),
    )

    if event_type == "checkout.session.completed":
        customer_id = data_object.get("customer")
        subscription_id = data_object.get("subscription")
        user_id = data_object.get("client_reference_id") or data_object.get("metadata", {}).get("user_id")
        plan = _plan_from_metadata(data_object.get("metadata"))
        logger.info(
            "checkout.session.completed customer=%s subscription=%s user=%s plan=%s",
            customer_id,
            subscription_id,
            user_id,
            plan,
        )
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
        plan = _plan_from_price(price_id, config["price_plus"])
        if not plan:
            plan = _plan_from_metadata(subscription.get("metadata"))
        # Only downgrade to free when the subscription is definitively ended or void.
        # Do not flip to free for transient states like incomplete/past_due.
        if status_value in {"canceled", "incomplete_expired", "unpaid"}:
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
            logger.info(
                "subscription event=%s sub=%s user=%s customer=%s status=%s price=%s plan=%s",
                event_type,
                subscription.get("id"),
                user_id,
                customer_id,
                status_value,
                price_id,
                plan,
            )
            current_billing = await repository.get_user_billing(
                request.app.state.db_pool,
                user_id,
            )
            current_sub_id = (
                current_billing.get("stripe_subscription_id") if current_billing else None
            )
            incoming_sub_id = subscription.get("id")
            if current_sub_id and incoming_sub_id and current_sub_id != incoming_sub_id:
                # Ignore updates for non-current subscriptions to avoid clobbering plan.
                return {"status": "ignored"}
            if event_type == "customer.subscription.deleted" and current_sub_id and incoming_sub_id != current_sub_id:
                return {"status": "ignored"}
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
