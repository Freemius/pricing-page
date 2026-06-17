import { describe, test, expect } from 'vitest';
import { BillingCycleString } from '../src/entities/Pricing.js';
import { getFirstAvailableCurrency } from '../src/utils/currency.js';

function makePricing({ currency, is_hidden = false, supportedCycles = [] }) {
  return {
    currency,
    is_hidden,
    supportsBillingCycle: cycle => supportedCycles.includes(cycle),
  };
}

describe('Currency fallback selection', () => {
  test('Keeps preferred currency when at least one visible pricing supports the selected billing cycle', () => {
    const plans = [
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            supportedCycles: [BillingCycleString.MONTHLY],
          }),
          makePricing({
            currency: 'eur',
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
    ];

    const picked = getFirstAvailableCurrency(
      plans,
      'usd',
      BillingCycleString.ANNUAL
    );

    expect(picked).toBe('usd');
  });

  test('Falls back to first visible currency when preferred currency has no visible pricing for the selected billing cycle', () => {
    const plans = [
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            is_hidden: true,
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
          makePricing({
            currency: 'eur',
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
    ];

    const picked = getFirstAvailableCurrency(
      plans,
      'usd',
      BillingCycleString.ANNUAL
    );

    expect(picked).toBe('eur');
  });

  test('Returns preferred currency when no visible pricing exists at all', () => {
    const plans = [
      {
        is_hidden: true,
        pricing: [
          makePricing({
            currency: 'eur',
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            is_hidden: true,
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
    ];

    const picked = getFirstAvailableCurrency(
      plans,
      'usd',
      BillingCycleString.ANNUAL
    );

    expect(picked).toBe('usd');
  });
});
