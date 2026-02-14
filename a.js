{
    "id": "sub_1Szb5hGVc7V7LqXlvcdrru9z",
    "object": "subscription",
    "application": null,
    "application_fee_percent": null,
    "automatic_tax": {
      "disabled_reason": null,
      "enabled": false,
      "liability": null
    },
    "billing_cycle_anchor": 1770807375,
    "billing_cycle_anchor_config": null,
    "billing_mode": {
      "flexible": {
        "proration_discounts": "included"
      },
      "type": "flexible",
      "updated_at": 1770807349
    },
    "billing_thresholds": null,
    "cancel_at": null,
    "cancel_at_period_end": false,
    "canceled_at": 1770819035,
    "cancellation_details": {
      "comment": null,
      "feedback": null,
      "reason": "cancellation_requested"
    },
    "collection_method": "charge_automatically",
    "created": 1770807375,
    "currency": "jpy",
    "customer": "cus_TxUx2ReIEA6u9m",
    "customer_account": null,
    "days_until_due": null,
    "default_payment_method": "pm_1Szb5eGVc7V7LqXldhudDwnf",
    "default_source": null,
    "default_tax_rates": [],
    "description": null,
    "discounts": [],
    "ended_at": 1770819035,
    "invoice_settings": {
      "account_tax_ids": null,
      "issuer": {
        "type": "self"
      }
    },
    "items": {
      "object": "list",
      "data": [
        {
          "id": "si_TxW739bOkdhNTt",
          "object": "subscription_item",
          "billing_thresholds": null,
          "created": 1770807375,
          "current_period_end": 1773226575,
          "current_period_start": 1770807375,
          "discounts": [],
          "metadata": {},
          "plan": {
            "id": "price_1SzXZpGVc7V7LqXl8XDZqXUN",
            "object": "plan",
            "active": true,
            "amount": 2980,
            "amount_decimal": "2980",
            "billing_scheme": "per_unit",
            "created": 1770793869,
            "currency": "jpy",
            "interval": "month",
            "interval_count": 1,
            "livemode": false,
            "metadata": {},
            "meter": null,
            "nickname": null,
            "product": "prod_TxSUxbD05dpvOL",
            "tiers_mode": null,
            "transform_usage": null,
            "trial_period_days": null,
            "usage_type": "licensed"
          },
          "price": {
            "id": "price_1SzXZpGVc7V7LqXl8XDZqXUN",
            "object": "price",
            "active": true,
            "billing_scheme": "per_unit",
            "created": 1770793869,
            "currency": "jpy",
            "custom_unit_amount": null,
            "livemode": false,
            "lookup_key": null,
            "metadata": {},
            "nickname": null,
            "product": "prod_TxSUxbD05dpvOL",
            "recurring": {
              "interval": "month",
              "interval_count": 1,
              "meter": null,
              "trial_period_days": null,
              "usage_type": "licensed"
            },
            "tax_behavior": "unspecified",
            "tiers_mode": null,
            "transform_quantity": null,
            "type": "recurring",
            "unit_amount": 2980,
            "unit_amount_decimal": "2980"
          },
          "quantity": 1,
          "subscription": "sub_1Szb5hGVc7V7LqXlvcdrru9z",
          "tax_rates": []
        }
      ],
      "has_more": false,
      "total_count": 1,
      "url": "/v1/subscription_items?subscription=sub_1Szb5hGVc7V7LqXlvcdrru9z"
    },
    "latest_invoice": "in_1Szb5fGVc7V7LqXl60GKzFEi",
    "livemode": false,
    "metadata": {
      "plan": "pro",
      "user_id": "bc2122a7-bf93-46bc-90fb-d5ddd875e528"
    },
    "next_pending_invoice_item_invoice": null,
    "on_behalf_of": null,
    "pause_collection": null,
    "payment_settings": {
      "payment_method_options": {
        "acss_debit": null,
        "bancontact": null,
        "card": {
          "network": null,
          "request_three_d_secure": "automatic"
        },
        "customer_balance": null,
        "konbini": null,
        "payto": null,
        "sepa_debit": null,
        "us_bank_account": null
      },
      "payment_method_types": null,
      "save_default_payment_method": "off"
    },
    "pending_invoice_item_interval": null,
    "pending_setup_intent": null,
    "pending_update": null,
    "plan": {
      "id": "price_1SzXZpGVc7V7LqXl8XDZqXUN",
      "object": "plan",
      "active": true,
      "amount": 2980,
      "amount_decimal": "2980",
      "billing_scheme": "per_unit",
      "created": 1770793869,
      "currency": "jpy",
      "interval": "month",
      "interval_count": 1,
      "livemode": false,
      "metadata": {},
      "meter": null,
      "nickname": null,
      "product": "prod_TxSUxbD05dpvOL",
      "tiers_mode": null,
      "transform_usage": null,
      "trial_period_days": null,
      "usage_type": "licensed"
    },
    "quantity": 1,
    "schedule": "sub_sched_1SzcCHGVc7V7LqXlHT415duq",
    "start_date": 1770807375,
    "status": "canceled",
    "test_clock": null,
    "transfer_data": null,
    "trial_end": null,
    "trial_settings": {
      "end_behavior": {
        "missing_payment_method": "create_invoice"
      }
    },
    "trial_start": null
  }