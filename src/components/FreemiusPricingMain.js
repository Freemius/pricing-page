import React, { Component, Fragment } from 'react';

import '.././assets/scss/App.scss';

import jQuery from 'jquery';
import guaranteeStamp from '.././assets/img/guarantee-stamp.svg';
import badgeFreemius from '.././assets/img/freemius-badge-secure-payments-light.svg';
import badgeMcAfee from '.././assets/img/mcafee.png';
import badgePayPal from '.././assets/img/paypal.png';
import badgeComodo from '.././assets/img/comodo-short-green.png';

import {Plan} from "../entities/Plan";
import {Plugin} from "../entities/Plugin";
import {Pricing} from '.././entities/Pricing';
import {PlanManager} from '.././services/PlanManager';
import FSPricingContext from ".././FSPricingContext";

import Section from './Section';
import BillingCycleSelector from './BillingCycleSelector';
import CurrencySelector from './CurrencySelector';
import Packages from './packages/Packages';
import Badges from './Badges';
import Testimonials from './testimonials/Testimonials';
import Faq from './faq/Faq';
import RefundPolicy from "./RefundPolicy";
import {FSConfig} from "../index";

class FreemiusPricingMain extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);

        this.state = {
            active_installs        : 0,
            annualDiscount         : 0,
            billingCycles          : [],
            currencies             : [],
            downloads              : 0,
            faq                    : [],
            firstPaidPlan          : null,
            featuredPlan           : null,
            isPayPalSupported      : false,
            plugin                 : {},
            plans                  : [],
            reviews                : [],
            selectedCurrency       : 'usd',
            selectedLicenseQuantity: 1,
            selectedBillingCycle   : Pricing.getBillingCyclePeriod(FSConfig.billing_cycle),
        };

        this.billingCycleDescription = this.billingCycleDescription.bind(this);
        this.changeBillingCycle      = this.changeBillingCycle.bind(this);
        this.changeCurrency          = this.changeCurrency.bind(this);
        this.changeLicenses          = this.changeLicenses.bind(this);
        this.upgrade                 = this.upgrade.bind(this);
    }

    componentDidMount() {
        this.fetchData();
        this.appendScripts();
    }

    appendScripts() {
        window.jQuery = jQuery;

        let script   = document.createElement("script");
        script.src   = "http://checkout.freemius-local.com:8080/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script       = document.createElement("script");
        script.src   = "http://js.freemius-local.com:8080/fs/postmessage.js";
        script.async = true;
        document.body.appendChild(script);
    }

    /**
     * Updates the state with the selected billing cycle.
     *
     * @param {object} e
     */
    changeBillingCycle (e) {
        this.setState({selectedBillingCycle: e.currentTarget.dataset.billingCycle});
    }

    /**
     * Updates the state with the selected currency.
     *
     * @param {object} e
     */
    changeCurrency (e) {
        this.setState({selectedCurrency: e.currentTarget.value});
    }

    /**
     * Updates the state with the selected license quantity.
     *
     * @param {object} e
     */
    changeLicenses(e) {
        let pricingID               = e.currentTarget.value,
            selectedLicenseQuantity = this.state.selectedLicenseQuantity;

        for (let plan of this.state.plans) {
            if (plan.is_hidden || ! plan.pricing) {
                continue;
            }

            for (let pricing of plan.pricing) {
                if (pricingID != pricing.id) {
                    continue;
                }

                selectedLicenseQuantity = pricing.isUnlimited() ?
                    0 :
                    pricing.licenses;

                break;
            }
        }

        this.setState({selectedLicenseQuantity: selectedLicenseQuantity});
    }

    componentDidMount() {
        this.fetchPricingData();

        this.appendScripts();
    }

    /**
     * @return {string} Defaults to `usd` if the currency that was passed in the config is not valid.
     */
    getDefaultCurrency() {
        if (
            ! Helper.isNonEmptyString(FSConfig.currency) &&
            ! CurrencySymbol[FSConfig.currency]
        ) {
            return DefaultCurrency;
        }

        return FSConfig.currency;
    }

    /**
     * @return {string} Defaults to `1` if the license quantity that was passed in the config is not valid.
     */
    getDefaultLicenseQuantity() {
        if ('unlimited' === FSConfig.licenses) {
            return 0;
        }

        return Helper.isNumeric(FSConfig.licenses) ?
            FSConfig.licenses :
            1;
    }

    /**
     * @param {number} planID
     *
     * @return {Pricing}
     */
    getSelectedPlanPricing(planID) {
        for (let plan of this.state.plans) {
            if (planID != plan.id) {
                continue;
            }

            for (let pricing of plan.pricing) {
                let selectedLicenseQuantity = (0 === this.state.selectedLicenseQuantity ? null : this.state.selectedLicenseQuantity);

                if (
                    pricing.licenses == selectedLicenseQuantity &&
                    pricing.currency === this.state.selectedCurrency
                ) {
                    return pricing;
                }
            }
        }

        return null;
    }

    /**
     * @return {boolean}
     */
    }

    }

    fetchData() {
        fetch(this.props.pricing_endpoint_url)
            .then (response => response.json())
            .then (pricingData => {
                if (pricingData.data) {
                    pricingData = pricingData.data;
                }

                if ( ! pricingData.plans) {
                    return;
                }

                let billingCycles                   = {},
                    currencies                      = {},
                    hasAnnualCycle                  = false,
                    hasAnyPlanWithSupport           = false,
                    hasEmailSupportForAllPaidPlans  = true,
                    hasEmailSupportForAllPlans      = true,
                    featuredPlan                    = null,
                    hasLifetimePricing              = false,
                    hasMonthlyCycle                 = false,
                    licenseQuantities               = {},
                    paidPlansCount                  = 0,
                    planManager                     = PlanManager.getInstance(pricingData.plans),
                    plansCount                      = 0,
                    planSingleSitePricingCollection = [],
                    priorityEmailSupportPlanID      = null,
                    selectedBillingCycle            = null;

                for (let planID in pricingData.plans) {
                    if ( ! pricingData.plans.hasOwnProperty(planID)) {
                        continue;
                    }

                    plansCount ++;

                    pricingData.plans[planID] = new Plan(pricingData.plans[planID]);

                    let plan = pricingData.plans[planID];

                    if (plan.is_hidden) {
                        continue;
                    }

                    if (plan.is_featured) {
                        featuredPlan = plan;
                    }

                    if ( ! plan.features) {
                        plan.features = [];
                    }

                    let pricingCollection = plan.pricing;

                    if ( ! pricingCollection) {
                        continue;
                    }

                    let pricingCount = pricingCollection.length;

                    for (let k = 0; k < pricingCount; k ++) {
                        pricingCollection[k] = new Pricing(pricingCollection[k]);
                    }

                    let isPaidPlan = planManager.isPaidPlan(pricingCollection);

                    if ( ! plan.hasEmailSupport()) {
                        hasEmailSupportForAllPlans = false;

                        if (isPaidPlan)
                            hasEmailSupportForAllPaidPlans = false;
                    } else {
                        if ( ! plan.hasSuccessManagerSupport()) {
                            priorityEmailSupportPlanID = plan.id;
                        }
                    }

                    if ( ! hasAnyPlanWithSupport && plan.hasAnySupport()) {
                        hasAnyPlanWithSupport = true;
                    }

                    if (isPaidPlan) {
                        paidPlansCount ++;

                        let singleSitePricing = planManager.getSingleSitePricing(pricingCollection, this.state.selectedCurrency);
                        if (null !== singleSitePricing)
                            planSingleSitePricingCollection.push(singleSitePricing);
                    }

                    for (let pricing of pricingCollection) {
                        if (pricing.is_hidden) {
                            continue;
                        }

                        if (null != pricing.monthly_price) {
                            billingCycles.monthly = true;
                        }

                        if (null != pricing.annual_price) {
                            billingCycles.annual = true;
                        }

                        if (null != pricing.lifetime_price) {
                            billingCycles.lifetime = true;
                        }

                        currencies[pricing.currency] = true;

                        let licenses = (null != pricing.licenses) ?
                            pricing.licenses :
                            0;

                        if ( ! licenseQuantities[pricing.currency]) {
                            licenseQuantities[pricing.currency] = {};
                        }

                        licenseQuantities[pricing.currency][licenses] = true;
                    }
                }

                if (null != billingCycles.annual) {
                    hasAnnualCycle       = true;
                } else if (null != billingCycles.monthly) {
                    hasMonthlyCycle      = true;
                } else {
                    hasLifetimePricing   = true;
                }

                this.setState({
                    active_installs               : pricingData.active_installs,
                    allPlansSingleSitePrices      : pricingData.all_plans_single_site_pricing,
                    annualDiscount                : (hasAnnualCycle && hasMonthlyCycle) ?
                        planManager.largestAnnualDiscount(planSingleSitePricingCollection) :
                        0,
                    billingCycles                 : Object.keys(billingCycles),
                    currencies                    : Object.keys(currencies),
                    currencySymbols               : {usd: '$', eur: '€', gbp: '£'},
                    downloads                     : pricingData.downloads,
                    hasAnnualCycle                : hasAnnualCycle,
                    hasEmailSupportForAllPaidPlans: hasEmailSupportForAllPaidPlans,
                    hasEmailSupportForAllPlans    : hasEmailSupportForAllPlans,
                    featuredPlan                  : featuredPlan,
                    hasLifetimePricing            : hasLifetimePricing,
                    hasMonthlyCycle               : hasMonthlyCycle,
                    hasPremiumVersion             : pricingData.hasPremiumVersion,
                    licenseQuantities             : licenseQuantities,
                    plans                         : pricingData.plans,
                    plansCount                    : plansCount,
                    plugin                        : new Plugin(pricingData.plugin),
                    priorityEmailSupportPlanID    : priorityEmailSupportPlanID,
                    reviews                       : pricingData.reviews,
                    selectedBillingCycle          : selectedBillingCycle,
                });
            });
    }

    render() {
        let pricingData = this.state;

        if ( ! pricingData.plugin.id) {
            return null;
        }


    render() {
        let
            pricingData  = this.state,
            featuredPlan = pricingData.featuredPlan;

        if (null !== featuredPlan) {
            console.log(featuredPlan);
            let hasAnyVisiblePricing = false;

            for (let pricing of featuredPlan.pricing) {
                if (pricing.is_hidden) {
                    continue;
                }

                if (pricing.licenses != pricingData.selectedLicenseQuantity) {
                    continue;
                }

                if (pricing.currency != pricingData.selectedCurrency) {
                    continue;
                }

                if ( ! pricing.supportsBillingCycle(pricingData.selectedBillingCycle)) {
                    continue;
                }

                hasAnyVisiblePricing = true;
                break;
            }

            if ( ! hasAnyVisiblePricing) {
                featuredPlan = null;
            }
        }

        return (
            <FSPricingContext.Provider value={this.state}>
                <div id="fs_pricing_wrapper">
                    <header className="fs-app-header">
                        <section className="fs-page-title">
                            <h2>Plans and Pricing</h2>
                            <h3>Choose your plan and upgrade in minutes!</h3>
                        </section>
                        <section className="fs-plugin-title-and-logo">
                            <img src={pricingData.plugin.icon} className="fs-plugin-logo" alt="logo" width="48" height="48" />
                            <h1><strong>{pricingData.plugin.title}</strong></h1>
                        </section>
                    </header>
                    <main className="fs-app-main">
                        <Section fs-section="plans-and-pricing">
                            {pricingData.annualDiscount > 0 &&
                                <Section fs-section="annual-discount"><div className="fs-annual-discount">Save up to {pricingData.annualDiscount}% on Yearly Pricing!</div></Section>
                            }
                            <Section fs-section="billing-cycles">
                                <BillingCycleSelector handler={this.changeBillingCycle} billingCycleDescription={this.billingCycleDescription}/>
                            </Section>
                            <Section fs-section="currencies">
                                <CurrencySelector handler={this.changeCurrency}/>
                            </Section>
                            <Section fs-section="packages" className={null !== featuredPlan ? 'fs-has-featured-plan' : ''}><Packages handler={this.changeLicenses}/></Section>
                            <Section fs-section="custom-implementation">
                                <h2>Need more sites, custom implementation and dedicated support?</h2>
                                <p>We got you covered! <a href="#">Click here to contact us</a> and we'll scope a plan that's tailored to your needs.</p>
                            </Section>
                            {pricingData.plugin.id && pricingData.plugin.hasRefundPolicy() && ( ! pricingData.is_trial || trialUtilized) &&
                                <Section fs-section="money-back-guarantee">
                                    <RefundPolicy/>
                                </Section>
                            }
                            <Section fs-section="badges">
                                <Badges badges={[
                                    {key: "fs-badges", src: badgeFreemius, alt: "Secure payments by Freemius - Sell and market freemium and premium WordPress plugins & themes"},
                                    {key: "mcafee", src: badgeMcAfee, alt: "McAfee Badge"},
                                    {key: "paypal", src: badgePayPal, alt: "PayPal Verified Badge"},
                                    {key: "comodo", src: badgeComodo, alt: "Comodo Secure SSL Badge"}
                                ]}/>
                            </Section>
                        </Section>
                        <Section fs-section="testimonials">
                            <Testimonials />
                        </Section>
                        <Section fs-section="faq">
                            <Faq />
                        </Section>
                    </main>
                </div>
            </FSPricingContext.Provider>
        );
    }
}

export default FreemiusPricingMain;