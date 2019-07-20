import {Helper} from "../Helper";

/**
 * @author Leo Fajardo
 */
export const CurrencySymbol = Object.freeze({
    'USD': '$',
    'GBP': '£',
    'EUR': '€'
});

export const BillingCycle = {
    'MONTHLY' : 1,
    'ANNUAL'  : 12,
    'LIFETIME': 0
};

export const DefaultCurrency = 'usd';

export class Pricing {

    //region Properties

    /**
     * @type number
     */
    plan_id = null;

    /**
     * @type int|null License activations limit. If null, unlimited license activations.
     */
    licenses = 1;

    /**
     * @type number
     */
    monthly_price = null;

    /**
     * @type number
     */
    annual_price = null;

    /**
     * @type number
     */
    lifetime_price = null;

    /**
     * @type string One of the following: `usd`, `gbp`, `eur`.
     */
    currency = DefaultCurrency;

    is_hidden = false;

    //endregion Properties

    constructor(object = null) {
        if (null == object) {
            return;
        }

        for (const p in object) {
            if (object.hasOwnProperty(p)) {
                this[p] = object[p];
            }
        }
    }

    /**
     * Normalizes the given billing cycle.
     *
     * @param {string|int} billingCycle One of the following: `annual`, `lifetime`, `monthly`, 1, 12, 0 (for lifetime).
     *
     * @return {string} Returns one of the following: `annual`, `lifetime`, `monthly`.
     */
    static getBillingCyclePeriod(billingCycle) {
        if ( ! Helper.isNumeric(billingCycle)) {
            return billingCycle;
        }

        switch (billingCycle) {
            case BillingCycle.ANNUAL:
                return 'annual';
            case BillingCycle.LIFETIME:
                return 'lifetime';
            case BillingCycle.MONTHLY:
            default:
                return 'monthly';
        }
    }

    /**
     * @param {int}     billingCycle One of the following: 1, 12, 0 (for lifetime).
     * @param {boolean} format       If true, the number 1299 for example will become 1,299.
     *
     * @return {string|number}
     */
    getAmount(billingCycle, format) {
        let amount = .0;

        switch (billingCycle)
        {
            case BillingCycle.MONTHLY:
                amount = this.monthly_price;
                break;
            case BillingCycle.ANNUAL:
                amount = this.annual_price;
                break;
            case BillingCycle.LIFETIME:
                amount = this.lifetime_price;
                break;
        }

        amount = parseFloat(amount);

        if (format) {
            amount = Helper.formatNumber(amount);
        }

        return amount;
    }

    /**
     * @param {int}     billingCycle One of the following: 1, 12, 0 (for lifetime).
     * @param {boolean} format       If true, the number 1299 for example will become 1,299.
     *
     * @return {string|number}
     */
    getMonthlyAmount(billingCycle, format) {
        let amount = .0;

        switch (billingCycle) {
            case BillingCycle.MONTHLY:
                amount = this.hasMonthlyPrice() ?
                    this.monthly_price :
                    this.annual_price / 12;
                break;
            case BillingCycle.ANNUAL:
                amount = this.hasAnnualPrice() ?
                    this.annual_price / 12 :
                    this.monthly_price;
                break;
        }

        if (format) {
            amount = Helper.formatNumber(amount);
        }

        return parseFloat(amount);
    }

    hasAnnualPrice() {
        return (Helper.isNumeric(this.annual_price) && this.annual_price > 0);
    }

    hasLifetimePrice() {
        return (Helper.isNumeric(this.lifetime_price) && this.lifetime_price > 0);
    }

    hasMonthlyPrice() {
        return (Helper.isNumeric(this.monthly_price) && this.monthly_price > 0);
    }

    isFree() {
        return (
            ! this.hasMonthlyPrice() &&
            ! this.hasAnnualPrice() &&
            ! this.hasLifetimePrice()
        );
    }

    isSingleSite() {
        return (1 == this.licenses);
    }

    isUnlimited() {
        return (null == this.licenses);
    }

    /**
     * @return {string} Returns `Single Site`, `Unlimited Sites`, or `n Sites` (where n > 1).
     */
    sitesLabel() {
        let sites = '';

        if (this.isSingleSite())
            sites = 'Single';
        else if (this.isUnlimited())
            sites = 'Unlimited';
        else
            sites = this.licenses;

        return (sites + ' Site' + (this.isSingleSite() ? '' : 's'));
    }

    supportsBillingCycle(billingCycle) {
        return (null !== this[`${billingCycle}_price`]);
    }
}