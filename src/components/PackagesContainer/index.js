import React, { Component, Fragment } from 'react';
import FSPricingContext from "../../FSPricingContext";
import { BillingCycleString } from "../../entities/Pricing";
import { PlanManager } from "../../services/PlanManager";
import { Helper } from "../../Helper";
import { Plan } from "../../entities/Plan";
import Package from "../Package";
import Icon from "../Icon";
import Placeholder from "../Placeholder";

class PackagesContainer extends Component {
    static contextType = FSPricingContext;

    slider = null;

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

    initSlider() {
        setTimeout(() => {
            if (null !== this.slider) {
                this.slider.adjustPackages();
                return;
            }

            this.slider = (function() {
                let firstVisibleIndex,
                    $plansAndPricingSection,
                    $track,
                    $packages,
                    $packagesContainer,
                    $nextPackage,
                    $prevPackage,
                    $packagesMenu,
                    $packagesTab,
                    defaultNextPrevPreviewWidth,
                    cardMinWidth,
                    maxMobileScreenWidth,
                    cardWidth,
                    nextPrevPreviewWidth,
                    screenWidth,
                    visibleCards,
                    mobileSectionOffset;

                let init = function () {
                    firstVisibleIndex           = 0;
                    $plansAndPricingSection     = document.querySelector('.fs-section--plans-and-pricing');
                    $track                      = $plansAndPricingSection.querySelector('.fs-section--packages');
                    $packages                   = $track.querySelectorAll('.fs-package');
                    $packagesContainer          = $track.querySelector('.fs-packages');
                    $nextPackage                = $plansAndPricingSection.querySelector('.fs-next-package');
                    $prevPackage                = $plansAndPricingSection.querySelector('.fs-prev-package');
                    $packagesMenu               = $plansAndPricingSection.querySelector('.fs-packages-menu');
                    $packagesTab                = $plansAndPricingSection.querySelector('.fs-packages-tab');
                    defaultNextPrevPreviewWidth = 60;
                    cardMinWidth                = 315;
                    maxMobileScreenWidth        = 768;
                    mobileSectionOffset         = 20;
                };

                const isMobileDevice = function () {
                    const sectionComputedStyle = window.getComputedStyle($plansAndPricingSection),
                        sectionWidth = parseFloat(sectionComputedStyle.width);

                    return sectionWidth < (cardMinWidth * 2 - mobileSectionOffset);
                }

                let slide = function (selectedIndex, leftOffset) {
                    let leftPos = (-1 * selectedIndex * cardWidth) + (leftOffset ? leftOffset : 0) - 1;

                    $packagesContainer.style.left = (leftPos + 'px');
                };

                let nextSlide = function () {
                    firstVisibleIndex++;

                    let leftOffset = 0;

                    if ( ! isMobileDevice() && screenWidth > maxMobileScreenWidth) {
                        leftOffset = defaultNextPrevPreviewWidth;

                        if (firstVisibleIndex + visibleCards >= $packages.length) {
                            $nextPackage.style.visibility = 'hidden';
                            $packagesContainer.parentNode.classList.remove('fs-has-next-plan');

                            if (firstVisibleIndex - 1 > 0) {
                                leftOffset *= 2;
                            }
                        }

                        if (firstVisibleIndex > 0) {
                            $prevPackage.style.visibility = 'visible';
                            $packagesContainer.parentNode.classList.add('fs-has-previous-plan');
                        }
                    }

                    slide(firstVisibleIndex, leftOffset);
                };

                let prevSlide = function () {
                    firstVisibleIndex--;

                    let leftOffset = 0;

                    if ( ! isMobileDevice() && screenWidth > maxMobileScreenWidth) {
                        if (firstVisibleIndex - 1 < 0) {
                            $prevPackage.style.visibility = 'hidden';
                            $packagesContainer.parentNode.classList.remove('fs-has-previous-plan');
                        }

                        if (firstVisibleIndex + visibleCards <= $packages.length) {
                            $nextPackage.style.visibility = 'visible';
                            $packagesContainer.parentNode.classList.add('fs-has-next-plan');

                            if (firstVisibleIndex > 0) {
                                leftOffset = defaultNextPrevPreviewWidth;
                            }
                        }
                    }

                    slide(firstVisibleIndex, leftOffset);
                };

                let adjustPackages = function () {
                    $packagesContainer.parentNode.classList.remove('fs-has-previous-plan');
                    $packagesContainer.parentNode.classList.remove('fs-has-next-plan');

                    screenWidth = window.outerWidth;

                    let sectionComputedStyle = window.getComputedStyle($plansAndPricingSection),
                        sectionWidth         = parseFloat(sectionComputedStyle.width),
                        sectionLeftPos       = 0,
                        isMobile             = (screenWidth <= maxMobileScreenWidth) || isMobileDevice();

                    nextPrevPreviewWidth = defaultNextPrevPreviewWidth;

                    if (isMobile) {
                        visibleCards = 1;
                        cardWidth    = sectionWidth;
                    } else {
                        visibleCards = Math.floor(sectionWidth / cardMinWidth);

                        if (visibleCards === $packages.length) {
                            nextPrevPreviewWidth = 0;
                        } else if (visibleCards < $packages.length) {
                            visibleCards = Math.floor((sectionWidth - nextPrevPreviewWidth) / cardMinWidth);

                            if (visibleCards + 1 < $packages.length) {
                                nextPrevPreviewWidth *= 2;
                                visibleCards = Math.floor((sectionWidth - nextPrevPreviewWidth) / cardMinWidth);
                            }
                        }

                        cardWidth = cardMinWidth;
                    }

                    $packagesContainer.style.width = (cardWidth * $packages.length) + 'px';

                    sectionWidth = (visibleCards * cardWidth) + ( ! isMobile ? nextPrevPreviewWidth : 0);

                    $packagesContainer.parentNode.style.width = (sectionWidth + 'px');

                    $packagesContainer.style.left = (sectionLeftPos + 'px');

                    if ( ! isMobile && visibleCards < $packages.length) {
                        $nextPackage.style.visibility = 'visible';

                        /**
                         * Center the prev and next buttons on the available space on the left and right sides of the packages collection.
                         */
                        let packagesContainerParentMargin = parseFloat(window.getComputedStyle($packagesContainer.parentNode).marginLeft),
                            sectionPadding                = parseFloat(sectionComputedStyle.paddingLeft),
                            prevButtonRightPos            = -sectionPadding,
                            nextButtonRightPos            = (sectionWidth + packagesContainerParentMargin),
                            nextPrevWidth                 = parseFloat(window.getComputedStyle($nextPackage).width);

                        $prevPackage.style.left = (prevButtonRightPos + (sectionPadding + packagesContainerParentMargin - nextPrevWidth) / 2) + 'px';
                        $nextPackage.style.left = (nextButtonRightPos + (sectionPadding + packagesContainerParentMargin - nextPrevWidth) / 2) + 'px';

                        $packagesContainer.parentNode.classList.add('fs-has-next-plan');
                    } else {
                        $prevPackage.style.visibility = 'hidden';
                        $nextPackage.style.visibility = 'hidden';
                    }

                    for (let $package of $packages) {
                        $package.style.width = (cardWidth + 'px');
                    }

                    if ($packagesMenu) {
                        firstVisibleIndex = $packagesMenu.selectedIndex;
                    } else if ($packagesTab) {
                        let $tabs = $packagesTab.querySelectorAll('li');

                        for (let i = 0; i < $tabs.length; i ++) {
                            let $tab = $tabs[i];

                            if ($tab.classList.contains('fs-package-tab--selected')) {
                                firstVisibleIndex = i;
                                break;
                            }
                        }
                    }

                    if (firstVisibleIndex > 0) {
                        firstVisibleIndex --;
                        nextSlide();
                    }
                };

                init();
                adjustPackages();

                if ($packagesMenu) {
                    $packagesMenu.addEventListener('change', function(evt) {
                        firstVisibleIndex = (evt.target.selectedIndex - 1);
                        nextSlide();
                    });
                }

                $nextPackage.addEventListener('click', nextSlide);
                $prevPackage.addEventListener('click', prevSlide);
                window.addEventListener('resize', adjustPackages);

                return {
                    adjustPackages: function() {
                        init();
                        adjustPackages();
                    }
                };
            })();
        }, 10);
    }

    render() {
        let packages                 = null,
            licenseQuantities        = this.context.licenseQuantities[this.context.selectedCurrency],
            licenseQuantitiesCount   = Object.keys(licenseQuantities).length,
            currentLicenseQuantities = {},
            isSinglePlan             = false;

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
            prevPlanPackage                = null,
            installPlanLicensesCount       = 0;

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
            } else {
                planPackage.pricingCollection = {};

                planPackage.pricing.map(pricing => {
                    let licenses = pricing.getLicenses();

                    if (
                        pricing.is_hidden ||
                        this.context.selectedCurrency !== pricing.currency
                    ) {
                        return;
                    }

                    if ( ! pricing.supportsBillingCycle(this.context.selectedBillingCycle)) {
                        return;
                    }

                    planPackage.pricingCollection[licenses] = pricing;

                    if (isSinglePlan || this.context.selectedLicenseQuantity == licenses) {
                        planPackage.selectedPricing = pricing;
                    }

                    if (this.context.license && this.context.license.pricing_id == pricing.id) {
                        installPlanLicensesCount = pricing.licenses;
                    }
                });

                let pricingLicenses = Object.keys(planPackage.pricingCollection);

                if (0 === pricingLicenses.length) {
                    continue;
                }

                planPackage.pricingLicenses = pricingLicenses;
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

            if ( ! isFreePlan) {
                for (let pricing of planPackage.pricing) {
                    if (
                        pricing.is_hidden ||
                        this.context.selectedCurrency !== pricing.currency ||
                        ! pricing.supportsBillingCycle(this.context.selectedBillingCycle)
                    ) {
                        continue;
                    }

                    currentLicenseQuantities[pricing.getLicenses()] = true;
                }
            }

            if ( ! isSinglePlan) {
                prevPlanPackage = planPackage;
            }
        }

        let packageComponents       = [],
            isFirstPlanPackage      = true,
            hasFeaturedPlan         = false,
            mobileTabs              = [],
            mobileDropdownOptions   = [],
            selectedPlanOrPricingID = this.context.selectedPlanID;

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
                    visiblePlanPackage.description_lines.push(<Placeholder key={`filler_${i}`}></Placeholder>);
                }
            }

            if (visiblePlanPackage.is_featured && ! isSinglePlan && this.context.paidPlansCount > 1) {
                hasFeaturedPlan = true;
            }

            const visiblePlanOrPricingID = isSinglePlan ? visiblePlanPackage.pricing[0].id : visiblePlanPackage.id;

            if ( ! selectedPlanOrPricingID && isFirstPlanPackage) {
                selectedPlanOrPricingID = visiblePlanOrPricingID;
            }

            mobileTabs.push(
                <li key={visiblePlanOrPricingID} className={"fs-package-tab" + (visiblePlanOrPricingID == selectedPlanOrPricingID ? ' fs-package-tab--selected' : '')} data-plan-id={visiblePlanOrPricingID} onClick={this.props.changePlanHandler}><a href="#">{isSinglePlan ? visiblePlanPackage.pricing[0].sitesLabel(): visiblePlanPackage.title}</a></li>
            );

            mobileDropdownOptions.push(
                <option
                    key={visiblePlanOrPricingID}
                    className="fs-package-option"
                    id={`fs_package_${visiblePlanOrPricingID}_option`}
                    value={visiblePlanOrPricingID}
                >{(visiblePlanOrPricingID == selectedPlanOrPricingID || isFirstPlanPackage ? 'Selected Plan: ' : '') + visiblePlanPackage.title}</option>
            );

            packageComponents.push(
                <Package
                    key={visiblePlanOrPricingID}
                    isFirstPlanPackage={isFirstPlanPackage}
                    installPlanLicensesCount={installPlanLicensesCount}
                    isSinglePlan={isSinglePlan}
                    maxHighlightedFeaturesCount={maxHighlightedFeaturesCount}
                    maxNonHighlightedFeaturesCount={maxNonHighlightedFeaturesCount}
                    licenseQuantities={licenseQuantities}
                    currentLicenseQuantities={currentLicenseQuantities}
                    planPackage={visiblePlanPackage}
                    changeLicensesHandler={this.props.changeLicensesHandler}
                    upgradeHandler={this.props.upgradeHandler}
                />
            );

            if (isFirstPlanPackage) {
                isFirstPlanPackage = false;
            }
        }

        this.initSlider();

        return <Fragment>
            <nav className="fs-prev-package"><Icon icon={['fas', 'chevron-left']}/></nav>
            <section className={"fs-packages-nav" + (hasFeaturedPlan ? " fs-has-featured-plan" : "")}>
                {packageComponents.length > 3 && <select className="fs-packages-menu" onChange={this.props.changePlanHandler} value={selectedPlanOrPricingID}>{mobileDropdownOptions}</select>}
                {packageComponents.length <= 3 && <ul className="fs-packages-tab">{mobileTabs}</ul>}
                <ul className="fs-packages">{packageComponents}</ul>
            </section>
            <nav className="fs-next-package"><Icon icon={['fas', 'chevron-right']}/></nav>
        </Fragment>
    }
}

export default PackagesContainer;
