import { Helper } from '../Helper';

/**
 * Pick a currency that actually has at least one visible pricing for the selected billing cycle.
 * Falls back to any visible currency and finally to the preferred currency.
 *
 * @param {Array} plans
 * @param {string} preferredCurrency
 * @param {string} billingCycle
 *
 * @return {string}
 */
export function getFirstAvailableCurrency(
  plans,
  preferredCurrency,
  billingCycle
) {
  let firstVisibleCurrency = null;

  for (let plan of plans) {
    if (plan.is_hidden || Helper.isUndefinedOrNull(plan.pricing)) {
      continue;
    }

    for (let pricing of plan.pricing) {
      if (pricing.is_hidden || pricing.isFree()) {
        continue;
      }

      if (
        pricing.currency === preferredCurrency &&
        pricing.supportsBillingCycle(billingCycle)
      ) {
        return preferredCurrency;
      }

      if (
        null === firstVisibleCurrency &&
        pricing.supportsBillingCycle(billingCycle)
      ) {
        firstVisibleCurrency = pricing.currency;
      }
    }
  }

  if (null !== firstVisibleCurrency) {
    return firstVisibleCurrency;
  }

  return preferredCurrency;
}
