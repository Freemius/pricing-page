import {Helper} from "../Helper";
import {Pricing} from "./Pricing";

export const DiscountType = Object.freeze({
    'DOLLAR'    : 'dollar',
    'PERCENTAGE': 'percentage'
});

export const RefundPolicyType = Object.freeze({
    'FLEXIBLE': 'flexible',
    'MODERATE': 'moderate',
    'STRICT'  : 'strict'
});

export class Plugin {

    //region Properties

    is_wp_org_compliant = null;

    money_back_period = null;

    parent_plugin_id = null;

    refund_policy = null;

    renewals_discount_type = null;

    type = null;

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

    getFormattedRenewalsDiscount(billingCycle, currency) {
        let discount = this.getRenewalsDiscount(billingCycle);

        return (this.renewals_discount_type === DiscountType.DOLLAR) ?
            currency + Helper.formatNumber(discount):
            `${discount}%`;
    }

    getRenewalsDiscount(billingCycle) {
        return ( ! this.hasRenewalsDiscount(billingCycle)) ?
            0 :
            this[Pricing.getBillingCyclePeriod(billingCycle) + '_renewals_discount'];
    }

    hasMoneyBackPeriod() {
        return (Helper.isNumeric(this.money_back_period) && this.money_back_period > 0);
    }

    hasRefundPolicy() {
        return (
           this.hasMoneyBackPeriod() &&
                null !== (this.refund_policy)
        );
    }

    hasRenewalsDiscount(billingCycle) {
        let billingCycleRenewalsDiscount = (Pricing.getBillingCyclePeriod(billingCycle) + '_renewals_discount');

        return (null !== this[billingCycleRenewalsDiscount] &&
            Helper.isNumeric(this[billingCycleRenewalsDiscount]) &&
            this[billingCycleRenewalsDiscount] > 0);
    }

    hasWordPressOrgVersion() {
        return (null !== this.is_wp_org_compliant);
    }

    isAddOn() {
        return (Helper.isNumeric(this.parent_plugin_id) && this.parent_plugin_id > 0);
    }

    moduleLabel() {
        return this.isAddOn() ?
            'add-on' :
            this.type;
    }
}