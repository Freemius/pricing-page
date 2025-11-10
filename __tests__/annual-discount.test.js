import { describe, test, expect } from 'vitest';
import { PlanManager } from '../src/services/PlanManager.js';
import { Pricing } from '../src/entities/Pricing.js';

// Seed a minimal in-memory catalog so PlanManager initializes its internal collections
const plans = [
  {
    id: 1,
    pricing: [
      {
        plan_id: 1,
        currency: 'USD',
        licenses: 1,
        monthly_price: 30,
        annual_price: 300, // ~17% vs monthly*12
      },
      {
        plan_id: 1,
        currency: 'USD',
        licenses: 1,
        monthly_price: 40,
        annual_price: 360, // 25%
      },
    ],
  },
];

// Build the singleton instance (this initializes internal collections)
const pm = PlanManager.getInstance(plans);

// Thin wrappers to call instance methods under test
const annualSavings = pricing => pm.annualSavings(pricing);
const annualDiscountPercentage = pricing =>
  pm.annualDiscountPercentage(pricing);
const largestAnnualDiscount = collection =>
  pm.largestAnnualDiscount(collection);
const getPricingWithLowestLicenses = (collection, currency) =>
  pm.getPricingWithLowestLicenses(collection, currency);

// Factory for real Pricing entities
function makePricing({
  plan_id = 1,
  currency = 'USD',
  licenses = 1,
  monthly = null,
  annual = null,
  unlimited = false,
} = {}) {
  return new Pricing({
    plan_id,
    currency,
    licenses,
    monthly_price: monthly,
    annual_price: annual,
    is_unlimited: unlimited,
  });
}

describe('Annual discount logic (PlanManager instance methods)', () => {
  test('Basic 1-site math: 12×monthly vs annual', () => {
    const p = makePricing({ monthly: 30, annual: 300, licenses: 1 }); // 360 vs 300 => 60 => 17%
    expect(annualSavings(p)).toBe(60);
    expect(annualDiscountPercentage(p)).toBe(17);
  });

  test('Lowest available tier ≠ 1-site (e.g., 3-site): correct pick', () => {
    const tiers = [
      makePricing({ monthly: 50, annual: 500, licenses: 5 }),
      makePricing({ monthly: 35, annual: 330, licenses: 3 }), // lowest licenses (non-unlimited)
      makePricing({ monthly: 90, annual: 900, licenses: 10 }),
    ];
    const picked = getPricingWithLowestLicenses(tiers, 'USD');
    expect(picked.licenses).toBe(3);
    expect(annualDiscountPercentage(picked)).toBe(
      Math.round(((35 * 12 - 330) / (35 * 12)) * 100)
    );
  });

  test('Prefer non-unlimited when possible', () => {
    const tiers = [
      makePricing({ monthly: 100, annual: 900, licenses: null }),
      makePricing({ monthly: 25, annual: 240, licenses: 3 }), // preferred
    ];
    const picked = getPricingWithLowestLicenses(tiers, 'USD');
    expect(picked.isUnlimited()).toBe(false);
    expect(picked.licenses).toBe(3);
  });

  test('Currency filter works', () => {
    const usd = makePricing({ monthly: 20, annual: 180, currency: 'USD' });
    const eur = makePricing({ monthly: 18, annual: 160, currency: 'EUR' });
    const pickedUsd = getPricingWithLowestLicenses([usd, eur], 'USD');
    expect(pickedUsd.currency).toBe('USD');
  });

  test('largestAnnualDiscount returns the highest % among valid tiers', () => {
    const tiers = [
      makePricing({ monthly: 30, annual: 300, licenses: 1 }), // ~17%
      makePricing({ monthly: 40, annual: 360, licenses: 1 }), // 25%
    ];
    expect(largestAnnualDiscount(tiers)).toBe(25);
  });

  test('Non-negative savings: when annual >= 12×monthly → 0%', () => {
    const p = makePricing({ monthly: 20, annual: 250, licenses: 1 }); // 240 vs 250
    expect(annualSavings(p)).toBe(0);
    expect(annualDiscountPercentage(p)).toBe(0);
  });
});
