import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import {BillingCycle} from "../../entities/Pricing";
import {PlanManager} from "../../services/PlanManager";
import Tooltip from "../Tooltip";
import Icon from "../Icon";
import {Helper} from "../../Helper";

class Packages extends Component {
    static contextType = FSPricingContext;

    previouslySelectedPricingByPlan = {};

    constructor(props) {
        super(props);
    }

    billingCycleLabel() {
        let label = 'Billed ';

        if ('annual' === this.context.selectedBillingCycle)
            label += 'Annually';
        else if ('lifetime' === this.context.selectedBillingCycle)
            label += 'Once';
        else
            label += 'Monthly';

        return label;
    }

    changeLicenses(e) {
        let target = e.currentTarget;

        if ('tr' !== target.tagName.toLowerCase()) {
            target = target.closest('tr');
        }

        let pricingID = target.dataset['pricingId'];

        document.getElementById(`pricing_${pricingID}`).click();
    }

    priceLabel(pricing) {
        let pricingData = this.context,
            label       = '',
            price       = pricing[pricingData.selectedBillingCycle + '_price'];

        label += pricingData.currencySymbols[pricingData.selectedCurrency];
        label += Helper.formatNumber(price);

        if ('monthly' === pricingData.selectedBillingCycle)
            label += ' / mo';
        else if ('annual' === pricingData.selectedBillingCycle)
            label += ' / year';

        return label;
    }

    render() {
        let
            prevPlan                    = null,
            prevPlanFeaturesWithNoValue = {};

        return (
            <ul className="fs-packages">
                {
                    this.context.plans.map(
                        (plan) => {
                            if (plan.is_hidden || ! plan.pricing) {
                                return '';
                            }

                            let pricingCollection       = [],
                                selectedPricing         = null,
                                licenseQuantities       = this.context.licenseQuantities[this.context.selectedCurrency],
                                licenseQuantitiesCount  = Object.keys(licenseQuantities).length,
                                selectedLicenseQuantity = this.context.selectedLicenseQuantity;

                            plan.pricing.map(pricing => {
                                if (pricing.is_hidden || this.context.selectedCurrency !== pricing.currency) {
                                    return;
                                }

                                pricingCollection.push(pricing);

                                if (
                                    this.context.selectedCurrency == pricing.currency &&
                                    selectedLicenseQuantity       == (null != pricing.licenses ? pricing.licenses : 0)
                                ) {
                                    selectedPricing = pricing;
                                }
                            });

                            if ( ! selectedPricing) {
                                if ( ! this.previouslySelectedPricingByPlan[plan.id]) {
                                    this.previouslySelectedPricingByPlan[plan.id] = pricingCollection[1];
                                }

                                selectedPricing = this.previouslySelectedPricingByPlan[plan.id];

                                selectedLicenseQuantity = (null != selectedPricing.licenses ? selectedPricing.licenses : 0);
                            }

                            this.previouslySelectedPricingByPlan[plan.id] = selectedPricing;

                            let visiblePricingCount = pricingCollection.length;

                            /**
                             * Include filler rows to keep the alignment on the frontend when the number of license
                             * quantities is not the same for all plans.
                             */
                            if (licenseQuantitiesCount > pricingCollection.length) {
                                for (let i = 0; i < (licenseQuantitiesCount - pricingCollection.length); i ++) {
                                    pricingCollection.push({id: `filler_${i}`});
                                }
                            }

                            let planDescription = plan.description ?
                                plan.description :
                                '';

                            let selectedPricingAmount = selectedPricing[`${this.context.selectedBillingCycle}_price`].toString();

                            let
                                planFeaturesWithValue    = [],
                                planFeaturesWithoutValue = {},
                                allPrevPlanFeaturesTitle = null;

                            if (null !== prevPlan) {
                                allPrevPlanFeaturesTitle = `All ${prevPlan.title} Features`;
                            }

                            if (plan.features) {
                                for (let feature of plan.features) {
                                    if ( ! feature.is_featured ) {
                                        continue;
                                    }

                                    if (prevPlanFeaturesWithNoValue[`f_${feature.id}`]) {
                                        continue;
                                    }

                                    let hasValue = (feature.value && feature.value.toString().length > 0);

                                    if (hasValue) {
                                        planFeaturesWithValue.push(feature);
                                    } else {
                                        planFeaturesWithoutValue[`f_${feature.id}`] = feature;
                                    }
                                }
                            }

                            prevPlan                    = plan;
                            prevPlanFeaturesWithNoValue = planFeaturesWithoutValue;

                            let supportLabel = null;

                            if ( ! plan.hasAnySupport()) {
                                supportLabel = 'No Support';
                            } else if (plan.hasSuccessManagerSupport()) {
                                supportLabel = 'Priority Phone, Email & Chat Support';
                            } else {
                                let supportedChannels = [];

                                if (plan.hasPhoneSupport()) {
                                    supportedChannels.push('Phone');
                                }

                                if (plan.hasSkypeSupport()) {
                                    supportedChannels.push('Skype');
                                }

                                if (plan.hasEmailSupport()) {
                                    supportedChannels.push((this.context.priorityEmailSupportPlanID == plan.id ? 'Priority ' : '') + 'Email');
                                }

                                if (plan.hasForumSupport()) {
                                    supportedChannels.push('Forum');
                                }

                                if (plan.hasKnowledgeBaseSupport()) {
                                    supportedChannels.push('Help Center');
                                }

                                if (1 === supportedChannels.length) {
                                    supportLabel = `${supportedChannels[0]} Support`;
                                } else {
                                    supportLabel = supportedChannels.slice(0, supportedChannels.length - 1).join(', ') +
                                        ' & ' + supportedChannels[supportedChannels.length-1] + ' Support';
                                }
                            }

                            return <li key={plan.id} className={'fs-package' + (plan.is_featured ? ' fs-featured-plan' : '')}>
                                <div className="fs-most-popular"><h4><strong>Most Popular</strong></h4></div>
                                <div className="fs-package-content">
                                    <h2 className="fs-plan-title"><strong>{plan.title}</strong></h2>
                                    <h3 className="fs-plan-description">
                                        <strong>
                                            {
                                                planDescription.split('\n').map((item, key) => {
                                                    return <Fragment key={key}>{item}<br/></Fragment>
                                                })
                                            }
                                        </strong>
                                    </h3>
                                    {'annual' === this.context.selectedBillingCycle && this.context.annualDiscount > 0 &&
                                    <div className="fs-undiscounted-price">Normally {selectedPricing.getMonthlyAmount(BillingCycle.MONTHLY, true)} / mo</div>
                                    }
                                    <div className="fs-selected-pricing-amount">
                                        <strong className="fs-currency-symbol">{this.context.currencySymbols[this.context.selectedCurrency]}</strong>
                                        <span className="fs-selected-pricing-amount-integer"><strong>{Helper.formatNumber(parseInt(selectedPricingAmount.split('.')[0]))}</strong></span>
                                        <span className="fs-selected-pricing-amount-fraction-container">
                                            <strong className="fs-selected-pricing-amount-fraction">.{selectedPricingAmount.split('.')[1]}</strong>
                                            {'lifetime' !== this.context.selectedBillingCycle && <sub className="fs-selected-pricing-amount-cycle">/ mo</sub>}
                                        </span>
                                    </div>
                                    <div className="fs-selected-pricing-cycle"><strong>{this.billingCycleLabel()}</strong></div>
                                    <div className="fs-selected-pricing-license-quantity">{selectedPricing.sitesLabel()}
                                        <Tooltip>
                                            <Fragment>
                                                If you are running a multi-site network, each site in the network requires a license.{visiblePricingCount > 0 ? 'Therefore, if you need to use it on multiple sites, check out our multi-site prices.' : ''}
                                            </Fragment>
                                        </Tooltip>
                                    </div>
                                    <div className="fs-support-and-main-features">
                                        {null !== supportLabel && <div className="fs-plan-support"><strong>{supportLabel}</strong></div>}
                                        <ul className="fs-plan-features-with-value">
                                            {planFeaturesWithValue.map(feature => <li key={feature.id}><span className="fs-feature-title"><span><strong>{feature.value}</strong></span> {feature.title}</span> {Helper.isNonEmptyString(feature.description) && <Tooltip><Fragment>{feature.description}</Fragment></Tooltip>}</li>)}
                                        </ul>
                                    </div>
                                    <table className="fs-license-quantities">
                                        <tbody>{
                                            pricingCollection.map(pricing => {
                                                if (0 === pricing.id.indexOf('filler_')) {
                                                    return <tr className="fs-license-quantity-container" key={pricing.id}><td>&nbsp;</td><td></td><td></td></tr>;
                                                }

                                                let isPricingLicenseQuantitySelected = (selectedLicenseQuantity == (null == pricing.licenses ? 0 : pricing.licenses));

                                                let multiSiteDiscount = PlanManager.getInstance().calculateMultiSiteDiscount(pricing, this.context.selectedBillingCycle);

                                                return (
                                                    <tr
                                                        key={pricing.id}
                                                        data-pricing-id={pricing.id}
                                                        className={"fs-license-quantity-container" + (isPricingLicenseQuantitySelected ? ' fs-license-quantity-selected' : '')}
                                                        onClick={this.changeLicenses}
                                                    >
                                                        <td className="fs-license-quantity">
                                                            <input
                                                                type="radio"
                                                                id={`pricing_${pricing.id}`}
                                                                name={'fs_plan_' + plan.id + '_licenses'}
                                                                value={pricing.id}
                                                                checked={isPricingLicenseQuantitySelected}
                                                                onChange={this.props.handler}
                                                            />
                                                            {pricing.sitesLabel()}
                                                        </td>
                                                        {
                                                            multiSiteDiscount > 0 ?
                                                                <td className="fs-license-quantity-discount"><span>Save {multiSiteDiscount}%</span></td> :
                                                                <td></td>
                                                        }
                                                        <td className="fs-license-quantity-price">{this.priceLabel(pricing)}</td>
                                                    </tr>
                                                );
                                            })
                                        }</tbody>
                                    </table>
                                    <div className="fs-upgrade-button-container">
                                        <button className="fs-button fs-button--size-large fs-upgrade-button" onClick={() => {this.upgrade(plan.id)}}>Upgrade Now</button>
                                    </div>
                                    <ul className="fs-plan-features">
                                        {null !== allPrevPlanFeaturesTitle &&
                                            <li><Icon icon={['fas', 'check']} /> <span className="fs-feature-title"><strong>{allPrevPlanFeaturesTitle}</strong></span></li>
                                        }
                                        {plan.hasSuccessManagerSupport() &&
                                            <li><Icon icon={['fas', 'check']} /> <span className="fs-feature-title">Personal Success Manager</span></li>
                                        }
                                        {Object.keys(planFeaturesWithoutValue).map(featureKey => <li key={planFeaturesWithoutValue[featureKey].id}><Icon icon={['fas', 'check']} /> <span className="fs-feature-title">{planFeaturesWithoutValue[featureKey].title}</span> {Helper.isNonEmptyString(planFeaturesWithoutValue[featureKey].description) && <Tooltip><Fragment>{planFeaturesWithoutValue[featureKey].description}</Fragment></Tooltip>}</li>)}
                                    </ul>
                                </div>
                            </li>
                        }
                    )
                }
            </ul>
        );
    }
}

export default Packages;