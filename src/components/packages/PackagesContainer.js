import React, { Component, Fragment } from 'react';
import FSPricingContext from "../../FSPricingContext";
import { BillingCycleString } from "../../entities/Pricing";
import { PlanManager } from "../../services/PlanManager";
import { Helper } from "../../Helper";
import { Plan } from "../../entities/Plan";
import Package from "./Package";

class PackagesContainer extends Component {
    static contextType = FSPricingContext;

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

    /**
     * @param {Object} pricing Pricing entity.
     *
     * @return {string} The price label in this format: `$4.99 / mo` or `$4.99 / year`
     */
    priceLabel(pricing) {
        let pricingData = this.context,
            label       = '',
            price       = pricing[pricingData.selectedBillingCycle + '_price'];

        label += pricingData.currencySymbols[pricingData.selectedCurrency];
        label += Helper.formatNumber(price);

        if (BillingCycleString.MONTHLY === pricingData.selectedBillingCycle)
            label += ' / mo';
        else if (BillingCycleString.ANNUAL === pricingData.selectedBillingCycle)
            label += ' / year';

        return label;
    }

    render() {
        let packages               = null,
            licenseQuantities      = this.context.licenseQuantities[this.context.selectedCurrency],
            licenseQuantitiesCount = Object.keys(licenseQuantities).length,
            isSinglePlan           = false;

        if (this.context.paidPlansCount > 1 || 1 === licenseQuantitiesCount) {
            // If there are more than one paid plans, create a package component for each plan.
            packages = this.context.plans;
        } else {
            // If there is only one paid plan and it supports multi-license options, create a package component for license quantity.
            packages = [];

            let paidPlan = null;

            for (paidPlan of this.context.plans) {
                if (PlanManager.getInstance().isHiddenOrFreePlan(paidPlan)) {
                    continue;
                }

                break;
            }

            for (let pricing of paidPlan.pricing) {
                if (
                    pricing.is_hidden ||
                    this.context.selectedCurrency !== pricing.currency ||
                    ! pricing.supportsBillingCycle(this.context.selectedBillingCycle)
                ) {
                    continue;
                }

                let planClone = Object.assign(new Plan(), paidPlan);

                planClone.pricing = [pricing];

                packages.push(planClone);
            }

            isSinglePlan = true;
        }


        let visiblePlanPackages            = [],
            maxHighlightedFeaturesCount    = 0,
            maxNonHighlightedFeaturesCount = 0,
            prevNonHighlightedFeatures     = {},
            maxPlanDescriptionLinesCount   = 0,
            prevPlanPackage                = null;

        for (let planPackage of packages) {
            if (planPackage.is_hidden) {
                continue;
            }

            let isFreePlan = PlanManager.getInstance().isFreePlan(planPackage.pricing);

            if (isFreePlan) {
                if (this.context.paidPlansCount >= 3) {
                    continue;
                }

                planPackage.is_free_plan = isFreePlan;
            }

            planPackage.highlighted_features    = [];
            planPackage.nonhighlighted_features = [];

            if (null !== prevPlanPackage) {
                planPackage.nonhighlighted_features.push({
                    id   : `all_plan_${prevPlanPackage.id}_features`,
                    title: `All ${prevPlanPackage.title} Features`
                });
            }

            if (planPackage.hasSuccessManagerSupport()) {
                planPackage.nonhighlighted_features.push({id: `plan_${planPackage.id}_personal_success_manager`, title: 'Personal Success Manager'});
            }

            if ( ! Helper.isNonEmptyString(planPackage.description)) {
                planPackage.description_lines = [];
            } else {
                planPackage.description_lines = planPackage.description.split('\n').map((item, key) => {
                    return <Fragment key={key}>{item}<br/></Fragment>
                })
            }

            maxPlanDescriptionLinesCount = Math.max(maxPlanDescriptionLinesCount, planPackage.description_lines.length);

            visiblePlanPackages.push(planPackage);

            if (Helper.isUndefinedOrNull(planPackage.features)) {
                continue;
            }

            for (let feature of planPackage.features) {
                if ( ! feature.is_featured) {
                    continue;
                }

                if (Helper.isNonEmptyString(feature.value) || Helper.isNumeric(feature.value)) {
                    planPackage.highlighted_features.push(feature);
                } else if (
                    isSinglePlan ||
                    Helper.isUndefinedOrNull(prevNonHighlightedFeatures[`f_${feature.id}`])
                ) {
                    planPackage.nonhighlighted_features.push(feature);

                    prevNonHighlightedFeatures[`f_${feature.id}`] = true;
                }
            }

            maxHighlightedFeaturesCount    = Math.max(maxHighlightedFeaturesCount, planPackage.highlighted_features.length);
            maxNonHighlightedFeaturesCount = Math.max(maxNonHighlightedFeaturesCount, planPackage.nonhighlighted_features.length);

            if ( ! isSinglePlan) {
                prevPlanPackage = planPackage;
            }
        }

        let packageComponents  = [],
            isFirstPlanPackage = true,
            hasFeaturedPlan    = false;

        for (let visiblePlanPackage of visiblePlanPackages) {
            if (visiblePlanPackage.highlighted_features.length < maxHighlightedFeaturesCount) {
                const total = (maxHighlightedFeaturesCount - visiblePlanPackage.highlighted_features.length);

                for (let i = 0; i < total; i ++) {
                    visiblePlanPackage.highlighted_features.push({id: `filler_${i}`});
                }
            }

            if (visiblePlanPackage.nonhighlighted_features.length < maxNonHighlightedFeaturesCount) {
                const total = (maxNonHighlightedFeaturesCount - visiblePlanPackage.nonhighlighted_features.length);

                for (let i = 0; i < total; i ++) {
                    visiblePlanPackage.nonhighlighted_features.push({id: `filler_${i}`});
                }
            }

            if (visiblePlanPackage.description_lines.length < maxPlanDescriptionLinesCount) {
                const total = (maxPlanDescriptionLinesCount - visiblePlanPackage.description_lines.length);

                for (let i = 0; i < total; i ++) {
                    visiblePlanPackage.description_lines.push(<Fragment key={`filler_${i}`}>&nbsp;</Fragment>);
                }
            }

            if (visiblePlanPackage.is_featured && ! isSinglePlan && this.context.paidPlansCount > 1) {
                hasFeaturedPlan = true;
            }

            packageComponents.push(
                <Package
                    key={isSinglePlan ? visiblePlanPackage.pricing[0].id : visiblePlanPackage.id}
                    isFirstPlanPackage={isFirstPlanPackage}
                    isSinglePlan={isSinglePlan}
                    maxHighlightedFeaturesCount={maxHighlightedFeaturesCount}
                    maxNonHighlightedFeaturesCount={maxNonHighlightedFeaturesCount}
                    licenseQuantities={licenseQuantities}
                    planPackage={visiblePlanPackage}
                    changeLicensesHandler={this.props.changeLicensesHandler}
                    upgradeHandler={this.props.upgradeHandler}
                />
            );

            if (isFirstPlanPackage) {
                isFirstPlanPackage = false;
            }
        }

        return <ul className={"fs-packages" + (hasFeaturedPlan ? " fs-has-featured-plan" : "")}>{packageComponents}</ul>;
    }
}

export default PackagesContainer;