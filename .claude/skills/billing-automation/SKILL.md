---
name: billing-automation
description: Build automated billing systems for recurring payments, invoicing, subscription lifecycle, and dunning management. Use when implementing subscription billing, automating invoicing, or managing recurring payment systems.
version: 1.0.0
---

# Billing Automation

Master automated billing systems including recurring billing, invoice generation, dunning management, proration, and tax calculation.

## When to Use This Skill

- Implementing SaaS subscription billing
- Automating invoice generation and delivery
- Managing failed payment recovery (dunning)
- Calculating prorated charges for plan changes
- Handling sales tax, VAT, and GST
- Processing usage-based billing
- Managing billing cycles and renewals

## Core Concepts

### Subscription States
```
trial → active → past_due → canceled
              → paused → resumed
```

### Billing Cycles
- Monthly (most common for SaaS)
- Annual (discounted long-term)
- Quarterly / Weekly / Custom

## Subscription Lifecycle

```python
class Subscription:
    def start_trial(self, trial_days):
        self.status = SubscriptionStatus.TRIAL
        self.trial_end = datetime.now() + timedelta(days=trial_days)

    def activate(self):
        self.status = SubscriptionStatus.ACTIVE
        self.current_period_end = self.calculate_next_billing_date()

    def mark_past_due(self):
        self.status = SubscriptionStatus.PAST_DUE

    def cancel(self, at_period_end=True):
        if at_period_end:
            self.cancel_at_period_end = True
        else:
            self.status = SubscriptionStatus.CANCELED
```

## Dunning Management

```python
class DunningManager:
    retry_schedule = [
        {'days': 3, 'email': 'payment_failed_first'},
        {'days': 7, 'email': 'payment_failed_reminder'},
        {'days': 14, 'email': 'payment_failed_final'}
    ]

    def retry_payment(self, attempt):
        result = self.charge_customer(subscription.customer_id, invoice.total)
        if result.success:
            invoice.mark_paid()
            subscription.status = SubscriptionStatus.ACTIVE
        elif attempt.attempt_number >= len(self.retry_schedule):
            subscription.cancel(at_period_end=False)
```

## Proration

```python
def calculate_proration(old_plan, new_plan, period_start, period_end, change_date):
    total_days = (period_end - period_start).days
    days_remaining = (period_end - change_date).days

    unused_amount = (old_plan.amount / total_days) * days_remaining
    new_plan_amount = (new_plan.amount / total_days) * days_remaining

    return {
        'old_plan_credit': -unused_amount,
        'new_plan_charge': new_plan_amount,
        'net_proration': new_plan_amount - unused_amount
    }
```

## Tax Calculation

```python
class TaxCalculator:
    tax_rates = {
        'US_CA': 0.0725,  # California
        'GB': 0.20,       # UK VAT
        'DE': 0.19,       # Germany VAT
        'AU': 0.10,       # Australia GST
    }

    def calculate_tax(self, amount, customer):
        jurisdiction = self.get_tax_jurisdiction(customer)
        tax_rate = self.tax_rates.get(jurisdiction, 0)
        return {
            'tax_amount': amount * tax_rate,
            'tax_rate': tax_rate,
            'jurisdiction': jurisdiction
        }
```

## Usage-Based Billing

```python
def calculate_usage_charges(subscription, period_start, period_end):
    usage_records = UsageRecord.get_for_period(
        subscription.customer_id, period_start, period_end
    )
    total_usage = sum(r.quantity for r in usage_records)

    if subscription.plan.pricing_model == 'tiered':
        return calculate_tiered_pricing(total_usage, subscription.plan.tiers)
    elif subscription.plan.pricing_model == 'per_unit':
        return total_usage * subscription.plan.unit_price
```

## Best Practices

1. **Automate Everything**: Minimize manual intervention
2. **Clear Communication**: Notify customers of billing events
3. **Flexible Retry Logic**: Balance recovery with customer experience
4. **Accurate Proration**: Fair calculation for plan changes
5. **Tax Compliance**: Calculate correct tax for jurisdiction
6. **Audit Trail**: Log all billing events
7. **Graceful Degradation**: Handle edge cases without breaking

## Common Pitfalls

- **Incorrect Proration**: Not accounting for partial periods
- **Missing Tax**: Forgetting to add tax to invoices
- **Aggressive Dunning**: Canceling too quickly
- **No Notifications**: Not informing customers of failures
