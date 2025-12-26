---
name: stripe-integration
description: Implement Stripe payment processing for robust, PCI-compliant payment flows including checkout, subscriptions, and webhooks. Use when integrating Stripe payments, building subscription systems, or implementing secure checkout flows.
version: 1.0.0
---

# Stripe Integration

Master Stripe payment processing integration for robust, PCI-compliant payment flows including checkout, subscriptions, webhooks, and refunds.

## When to Use This Skill

- Implementing payment processing in web/mobile applications
- Setting up subscription billing systems
- Handling one-time payments and recurring charges
- Processing refunds and disputes
- Managing customer payment methods
- Implementing SCA for European payments
- Building marketplace payment flows with Stripe Connect

## Payment Flows

| Flow | Description | PCI Burden |
|------|-------------|------------|
| Checkout Session | Stripe-hosted page | Minimal |
| Payment Intents | Custom UI | Requires Stripe.js |
| Setup Intents | Save payment method | Requires confirmation |

## Quick Start

```python
import stripe
stripe.api_key = "sk_test_..."

session = stripe.checkout.Session.create(
    payment_method_types=['card'],
    line_items=[{
        'price_data': {
            'currency': 'usd',
            'product_data': {'name': 'Premium'},
            'unit_amount': 2000,
            'recurring': {'interval': 'month'},
        },
        'quantity': 1,
    }],
    mode='subscription',
    success_url='https://example.com/success',
    cancel_url='https://example.com/cancel',
)
```

## Subscription Creation

```python
def create_subscription(customer_id, price_id):
    subscription = stripe.Subscription.create(
        customer=customer_id,
        items=[{'price': price_id}],
        payment_behavior='default_incomplete',
        expand=['latest_invoice.payment_intent'],
    )
    return {
        'subscription_id': subscription.id,
        'client_secret': subscription.latest_invoice.payment_intent.client_secret
    }
```

## Webhook Handling

```python
@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    event = stripe.Webhook.construct_event(
        payload, sig_header, endpoint_secret
    )

    if event['type'] == 'payment_intent.succeeded':
        handle_successful_payment(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_canceled(event['data']['object'])

    return 'Success', 200
```

## Customer Portal

```python
def create_portal_session(customer_id):
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url='https://example.com/account',
    )
    return session.url
```

## Refunds

```python
def create_refund(payment_intent_id, amount=None):
    refund = stripe.Refund.create(
        payment_intent=payment_intent_id,
        amount=amount,  # Partial refund if specified
    )
    return refund
```

## Test Cards

```python
TEST_CARDS = {
    'success': '4242424242424242',
    'declined': '4000000000000002',
    '3d_secure': '4000002500003155',
    'insufficient_funds': '4000000000009995'
}
```

## Best Practices

1. **Always Use Webhooks**: Don't rely solely on client-side confirmation
2. **Idempotency**: Handle webhook events idempotently
3. **Error Handling**: Gracefully handle all Stripe errors
4. **Test Mode**: Thoroughly test before production
5. **Metadata**: Link Stripe objects to your database
6. **Monitoring**: Track payment success rates
7. **PCI Compliance**: Never handle raw card data
8. **SCA Ready**: Implement 3D Secure for EU payments

## Common Pitfalls

- **Not Verifying Webhooks**: Always verify signatures
- **Missing Webhook Events**: Handle all relevant events
- **Hardcoded Amounts**: Use cents/smallest currency unit
- **No Retry Logic**: Implement retries for API calls
- **Ignoring Test Mode**: Test all edge cases
