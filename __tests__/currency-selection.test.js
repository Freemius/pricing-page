import { describe, test, expect } from 'vitest';
import { BillingCycleString } from '../src/entities/Pricing.js';
import { getFirstAvailableCurrency } from '../src/utils/currency.js';

function makePricing({
  currency,
  is_hidden = false,
  supportedCycles = [],
  monthly_price = null,
  annual_price = null,
  lifetime_price = null,
}) {
  const hasMonthlyPrice = () => monthly_price != null && monthly_price > 0;
  const hasAnnualPrice = () => annual_price != null && annual_price > 0;
  const hasLifetimePrice = () => lifetime_price != null && lifetime_price > 0;

  return {
    currency,
    is_hidden,
    monthly_price,
    annual_price,
    lifetime_price,
    supportsBillingCycle: cycle => supportedCycles.includes(cycle),
    isFree: () =>
      !hasMonthlyPrice() && !hasAnnualPrice() && !hasLifetimePrice(),
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
            monthly_price: 9,
            supportedCycles: [BillingCycleString.MONTHLY],
          }),
          makePricing({
            currency: 'eur',
            annual_price: 79,
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
        ],
      },
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            annual_price: 99,
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
            annual_price: 99,
            is_hidden: true,
            supportedCycles: [BillingCycleString.ANNUAL],
          }),
          makePricing({
            currency: 'eur',
            annual_price: 89,
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

  test('Ignores free pricings and falls back to first non-free visible currency', () => {
    const plans = [
      {
        is_hidden: false,
        pricing: [
          makePricing({
            currency: 'usd',
            supportedCycles: [BillingCycleString.ANNUAL],
            // no prices → isFree() returns true
          }),
          makePricing({
            currency: 'eur',
            annual_price: 49,
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
