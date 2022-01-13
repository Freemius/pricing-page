import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import {BillingCycle, BillingCycleString} from "../../entities/Pricing";
import {PlanManager} from "../../services/PlanManager";
import Tooltip from "../Tooltip";
import Icon from "../Icon";
import {Helper} from "../../Helper";
import {Plan} from "../../entities/Plan";
import Placeholder from "./Placeholder";

class Package extends Component {
    static contextType             = FSPricingContext;
    static contextInstallPlanFound = false;

    /**
     * If we unset it (or set it to `undefined`) it will use the browser's locale.
     * For now we are going to use the 'en-US' locale, until we start supporting other locales in our checkout for a consistent experience.
     * 
     * @author Vova Feldman
     */
    static locale = 'en-US';

    previouslySelectedPricingByPlan = {};

    constructor(props) {
        super(props);
    }

    /**
     * @return {string} Returns `Billed Annually`, `Billed Once`, or `Billed Monthly`.
     */
    billingCycleLabel() {
        let label = 'Billed ';

        if (BillingCycleString.ANNUAL === this.context.selectedBillingCycle)
            label += 'Annually';
        else if (BillingCycleString.LIFETIME === this.context.selectedBillingCycle)
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

    /**
     * @param {Plan} plan
     * @param {int}  installPlanLicensesCount
     *
     * @return {string|Fragment}
     */
    getCtaButtonLabel(plan, installPlanLicensesCount) {
        if (this.context.isActivatingTrial && this.context.upgradingToPlanID == plan.id) {
            return 'Activating...';
        }

        let hasInstallContext        = ( ! Helper.isUndefinedOrNull(this.context.install)),
            isContextInstallPlan     = (hasInstallContext && this.context.install.plan_id == plan.id),
            currentPlanLicensesCount = installPlanLicensesCount,
            isFreePlan               = PlanManager.getInstance().isFreePlan(plan.pricing);

        if (isContextInstallPlan) {
            Package.contextInstallPlanFound = true;
        }

        let label       = '',
            installPlan = isContextInstallPlan ?
                plan :
                (
                    hasInstallContext ?
                        PlanManager.getInstance().getPlanByID(this.context.install.plan_id) :
                        null
                );

        let isPayingUser = (
            ! this.context.isTrial &&
            (null !== installPlan) &&
            ! this.isInstallInTrial(this.context.install) &&
            PlanManager.getInstance().isPaidPlan(installPlan.pricing)
        );

        if (isContextInstallPlan || ( ! hasInstallContext && isFreePlan)) {
            label = (currentPlanLicensesCount > 1) ?
                'Downgrade' :
                ((1 == currentPlanLicensesCount ? 'Your Plan' : 'Upgrade'));
        } else if (isFreePlan) {
            label = 'Downgrade';
        } else if (this.context.isTrial && plan.hasTrial()) {
            label = <Fragment>Start my free <nobr>{plan.trial_period} days</nobr></Fragment>;
        } else if (isPayingUser && ! Package.contextInstallPlanFound) {
            label = 'Downgrade';
        } else {
            label = 'Upgrade Now';
        }

        return label;
    }

    getUndiscountedPrice(planPackage, selectedPricing) {
        if (
            BillingCycleString.ANNUAL !== this.context.selectedBillingCycle ||
            ! (this.context.annualDiscount > 0)
        ) {
            return <Placeholder className={"fs-undiscounted-price"}/>;
        }

        if (planPackage.is_free_plan || null === selectedPricing) {
            return <Placeholder className={"fs-undiscounted-price"}/>
        }

        return <div className="fs-undiscounted-price">Normally {this.context.currencySymbols[this.context.selectedCurrency]}{selectedPricing.getMonthlyAmount(BillingCycle.MONTHLY, true, Package.locale)} / mo</div>;
    }

    getSitesLabel(planPackage, selectedPricing, pricingLicenses) {
        if (planPackage.is_free_plan) {
            return <Placeholder/>
        }

        return <div className="fs-selected-pricing-license-quantity">
            {selectedPricing.sitesLabel()}
            { ! planPackage.is_free_plan && <Tooltip>
                <Fragment>
                    If you are running a multi-site network, each site in the network requires a license.{pricingLicenses.length > 0 ? 'Therefore, if you need to use it on multiple sites, check out our multi-site prices.' : ''}
                </Fragment>
            </Tooltip>}
        </div>
    }

    /**
     * @param {Object} pricing   Pricing entity.
     * @param {string} [locale]  The country code and language code combination (e.g. 'fr-FR').
     *
     * @return {string} The price label in this format: `$4.99 / mo` or `$4.99 / year`
     */
    priceLabel(pricing, locale) {
        let pricingData = this.context,
            label       = '',
            price       = pricing[pricingData.selectedBillingCycle + '_price'];

        label += pricingData.currencySymbols[pricingData.selectedCurrency];
        label += Helper.formatNumber(price, locale);

        if (BillingCycleString.MONTHLY === pricingData.selectedBillingCycle)
            label += ' / mo';
        else if (BillingCycleString.ANNUAL === pricingData.selectedBillingCycle)
            label += ' / year';

        return label;
    }

    isInstallInTrial(install) {
        if ( ! Helper.isNumeric(install.trial_plan_id) || Helper.isUndefinedOrNull(install.trial_ends)) {
            return false;
        }

        return (Date.parse(install.trial_ends) > new Date().getTime());
    }

    render() {
        let isSinglePlan             = this.props.isSinglePlan,
            planPackage              = this.props.planPackage,
            installPlanLicensesCount = this.props.installPlanLicensesCount,
            currentLicenseQuantities = this.props.currentLicenseQuantities,
            pricingLicenses          = null,
            selectedLicenseQuantity  = this.context.selectedLicenseQuantity,
            pricingCollection        = {},
            selectedPricing          = null,
            selectedPricingAmount    = null,
            supportLabel             = null;

        if (this.props.isFirstPlanPackage) {
            Package.contextInstallPlanFound = false;
        }

        if ( ! planPackage.is_free_plan) {
            pricingCollection = planPackage.pricingCollection;
            pricingLicenses   = planPackage.pricingLicenses;
            selectedPricing   = planPackage.selectedPricing;

            if ( ! selectedPricing) {
                if (
                    ! this.previouslySelectedPricingByPlan[planPackage.id] ||
                    this.context.selectedCurrency !== this.previouslySelectedPricingByPlan[planPackage.id].currency ||
                    ! this.previouslySelectedPricingByPlan[planPackage.id].supportsBillingCycle(this.context.selectedBillingCycle)
                ) {
                    /**
                     * Select the first pricing if there's no previously selected pricing that matches the selected license quantity and currency.
                     */
                    this.previouslySelectedPricingByPlan[planPackage.id] = pricingCollection[pricingLicenses[0]];
                }

                selectedPricing = this.previouslySelectedPricingByPlan[planPackage.id];

                selectedLicenseQuantity = selectedPricing.getLicenses();
            }

            this.previouslySelectedPricingByPlan[planPackage.id] = selectedPricing;

            selectedPricingAmount = ((BillingCycleString.ANNUAL === this.context.selectedBillingCycle) ?
                // The 'en-US' is intentionally hard-coded here because we are spliting the decimal by '.'.
                Helper.formatNumber(selectedPricing.getMonthlyAmount(BillingCycle.ANNUAL), 'en-US') :
                selectedPricing[`${this.context.selectedBillingCycle}_price`]).toString();
        }

        if ( ! planPackage.hasAnySupport()) {
            supportLabel = 'No Support';
        } else if (planPackage.hasSuccessManagerSupport()) {
            supportLabel = 'Priority Phone, Email & Chat Support';
        } else {
            let supportedChannels = [];

            if (planPackage.hasPhoneSupport()) {
                supportedChannels.push('Phone');
            }

            if (planPackage.hasSkypeSupport()) {
                supportedChannels.push('Skype');
            }

            if (planPackage.hasEmailSupport()) {
                supportedChannels.push((this.context.priorityEmailSupportPlanID == planPackage.id ? 'Priority ' : '') + 'Email');
            }

            if (planPackage.hasForumSupport()) {
                supportedChannels.push('Forum');
            }

            if (planPackage.hasKnowledgeBaseSupport()) {
                supportedChannels.push('Help Center');
            }

            if (1 === supportedChannels.length) {
                supportLabel = `${supportedChannels[0]} Support`;
            } else {
                supportLabel = supportedChannels.slice(0, supportedChannels.length - 1).join(', ') +
                    ' & ' + supportedChannels[supportedChannels.length-1] + ' Support';
            }
        }

        let packageClassName = 'fs-package';

        if (planPackage.is_free_plan) {
            packageClassName += ' fs-free-plan';
        } else if ( ! isSinglePlan && planPackage.is_featured) {
            packageClassName += ' fs-featured-plan';
        }

        const localDecimalSeparator = Helper.formatNumber(0.1, Package.locale)[1];

        let selectedAmountInteger, selectedAmountFraction;

        if (selectedPricingAmount) {
            const amountParts = selectedPricingAmount.split('.');

            selectedAmountInteger = Helper.formatNumber(parseInt(amountParts[0], 10));
            selectedAmountFraction = Helper.formatFraction(amountParts[1]);
        }


        return <li key={planPackage.id} className={packageClassName}>
            <div className="fs-most-popular"><h4><strong>Most Popular</strong></h4></div>
            <div className="fs-package-content">
                <h2 className="fs-plan-title"><strong>{isSinglePlan ? selectedPricing.sitesLabel() : planPackage.title}</strong></h2>
                <h3 className="fs-plan-description">
                    <strong>{planPackage.description_lines}</strong>
                </h3>
                {this.getUndiscountedPrice(planPackage, selectedPricing)}
                <div className="fs-selected-pricing-amount">
                    <strong className="fs-currency-symbol">{ ! planPackage.is_free_plan ? this.context.currencySymbols[this.context.selectedCurrency] : ''}</strong>
                    <span className="fs-selected-pricing-amount-integer"><strong>{planPackage.is_free_plan ? 'Free' : selectedAmountInteger}</strong></span>
                    <span className="fs-selected-pricing-amount-fraction-container">
                        <strong className="fs-selected-pricing-amount-fraction">{!planPackage.is_free_plan ? localDecimalSeparator + selectedAmountFraction : ''}</strong>
                        {
                            ! planPackage.is_free_plan &&
                            BillingCycleString.LIFETIME !== this.context.selectedBillingCycle &&
                            <sub className="fs-selected-pricing-amount-cycle">/ mo</sub>
                        }
                    </span>
                </div>
                <div className="fs-selected-pricing-cycle">{ ! planPackage.is_free_plan ? <strong>{this.billingCycleLabel()}</strong> : <Placeholder/>}</div>
                {this.getSitesLabel(planPackage, selectedPricing, pricingLicenses)}
                <div className="fs-support-and-main-features">
                    {null !== supportLabel && <div className="fs-plan-support"><strong>{supportLabel}</strong></div>}
                    <ul className="fs-plan-features-with-value">
                        {planPackage.highlighted_features.map(feature => {
                                if ( ! Helper.isNonEmptyString(feature.title)) {
                                    return <li key={feature.id}><Placeholder/></li>;
                                }

                                return <li
                                    key={feature.id}>
                                    <span className="fs-feature-title">
                                        <span><strong>{feature.value}</strong></span>
                                        <span className="fs-feature-title">{feature.title}</span>
                                    </span>
                                    {Helper.isNonEmptyString(feature.description) && <Tooltip><Fragment>{feature.description}</Fragment></Tooltip>}
                                </li>;
                            }
                        )}
                    </ul>
                </div>
                { ! isSinglePlan &&
                <table className="fs-license-quantities">
                    <tbody>{
                        Object.keys(currentLicenseQuantities).map(licenseQuantity => {
                            let pricing = pricingCollection[licenseQuantity];

                            if (Helper.isUndefinedOrNull(pricing)) {
                                return <tr className="fs-license-quantity-container" key={licenseQuantity}><td><Placeholder/></td><td></td><td></td></tr>;
                            }

                            let isPricingLicenseQuantitySelected = (selectedLicenseQuantity == licenseQuantity);

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
                                            name={'fs_plan_' + planPackage.id + '_licenses' + (isSinglePlan ? selectedPricing.id : '')}
                                            value={pricing.id}
                                            checked={isPricingLicenseQuantitySelected || isSinglePlan}
                                            onChange={this.props.changeLicensesHandler}
                                        />
                                        {pricing.sitesLabel()}
                                    </td>
                                    {
                                        multiSiteDiscount > 0 ?
                                            <td className="fs-license-quantity-discount"><span>Save {multiSiteDiscount}%</span></td> :
                                            <td></td>
                                    }
                                    <td className="fs-license-quantity-price">{this.priceLabel(pricing, Package.locale)}</td>
                                </tr>
                            );
                        })
                    }</tbody>
                </table>}
                <div className="fs-upgrade-button-container">
                    <button className="fs-button fs-button--size-large fs-upgrade-button" onClick={() => {this.props.upgradeHandler(planPackage, selectedPricing)}}>{this.getCtaButtonLabel(planPackage, installPlanLicensesCount)}</button>
                </div>
                <ul className="fs-plan-features">
                    {planPackage.nonhighlighted_features.map(feature => {
                            if ( ! Helper.isNonEmptyString(feature.title)) {
                                return <li key={feature.id}><Placeholder/></li>;
                            }

                            const featureTitle = (0 === feature.id.indexOf('all_plan_')) ?
                                <strong>{feature.title}</strong> :
                                feature.title;

                            return <li
                                    key={feature.id}>
                                    <Icon icon={['fas', 'check']} />
                                    <span className="fs-feature-title">{featureTitle}</span>
                                    {Helper.isNonEmptyString(feature.description) && <Tooltip><Fragment>{feature.description}</Fragment></Tooltip>}
                                </li>
                        })
                    }
                </ul>
            </div>
        </li>;
    }
}

export default Package;