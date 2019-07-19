import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import {BillingCycle} from "../../entities/Pricing";
import {PlanManager} from "../../services/PlanManager";
import Tooltip from "../Tooltip";
import Icon from "../Icon";
import {Helper} from "../../Helper";

class Packages extends Component {
    static contextType = FSPricingContext;

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
        return (
            <ul className="fs-packages">
                {
                    this.context.plans.map(
                        ( plan ) => {
                            if (plan.is_hidden || ! plan.pricing) {
                                return '';
                            }

                            let pricingCollection = plan.pricing,
                                selectedPricing   = null;

                            pricingCollection.map(pricing => {
                                if (pricing.is_hidden) {
                                    return;
                                }

                                if (
                                    this.context.selectedCurrency        == pricing.currency &&
                                    this.context.selectedLicenseQuantity == (null != pricing.licenses ? pricing.licenses : 0)
                                ) {
                                    selectedPricing = pricing;
                                }
                            });

                            let planDescription = plan.description ?
                                plan.description :
                                '';

                            let selectedPricingAmount = selectedPricing[`${this.context.selectedBillingCycle}_price`].toString();

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
                                    <div className="fs-selected-pricing-license-quantity">{selectedPricing.sitesLabel()} <Tooltip/></div>
                                    <div className="fs-plan-support">{plan.support}</div>
                                    <table className="fs-license-quantities">
                                        <tbody>{
                                            Object.keys(pricingCollection).map(
                                                ( pricingKey ) => {
                                                    let pricing = pricingCollection[pricingKey];

                                                    if (pricing.is_hidden || this.context.selectedCurrency !== pricing.currency) {
                                                        return null;
                                                    }

                                                    let isPricingLicenseQuantitySelected = (this.context.selectedLicenseQuantity == (null == pricing.licenses ? 0 : pricing.licenses));

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
                                                                    value={pricingKey}
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
                                                    )
                                                }
                                            )
                                        }</tbody>
                                    </table>
                                    <div className="fs-upgrade-button-container">
                                        <button className="fs-button fs-button--size-large fs-upgrade-button" onClick={() => {this.upgrade(plan.id)}}>Upgrade Now</button>
                                    </div>
                                    <ul className="fs-plan-features">
                                        {plan.features.map(feature => <li key={feature.id}><Icon icon={['fas', 'check']} /> <span className="fs-feature-title">{feature.title}</span> <Tooltip/></li>)}
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