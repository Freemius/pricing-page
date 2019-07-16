import React, { Component, Fragment } from 'react';
import guaranteeStamp from './assets/img/guarantee-stamp.svg';
import FSPricingContext from "./FSPricingContext";
import jQuery from 'jquery';
import './App.scss';
import {PlanManager} from './services/PlanManager';
import {BillingCycle, Pricing} from './entities/Pricing';

class PricingPage extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);

        this.state = {
            data: {
                plugin: {},
                plans                  : [],
                billingCycles          : [],
                currencies             : [],
                selectedCurrency       : 'usd',
                selectedLicenseQuantity: 1,
                hasFeaturedPlan        : false,
                faq                    : []
            }
        };

        this.billingCycleDescription = this.billingCycleDescription.bind(this);
        this.billingCycleLabel       = this.billingCycleLabel.bind(this);
        this.priceLabel              = this.priceLabel.bind(this);
        this.pricingSitesLabel       = this.pricingSitesLabel.bind(this);
        this.onChangeBillingCycle    = this.onChangeBillingCycle.bind(this);
        this.onChangeCurrency        = this.onChangeCurrency.bind(this);
        this.onChangeLicenses        = this.onChangeLicenses.bind(this);
        this.upgrade                 = this.upgrade.bind(this);
    }

    componentDidMount() {
        this.fetchData();

        window.jQuery = jQuery;

        let script   = document.createElement("script");
        script.src   = "http://checkout.freemius.com/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        script       = document.createElement("script");
        script.src   = "http://js.freemius.com/fs/postmessage.js";
        script.async = true;
        document.body.appendChild(script);
    }

    upgrade(planID) {
        let handler = FS.Checkout.configure({
            plugin_id : this.state.data.plugin.id,
            public_key: this.state.data.plugin.public_key,
        });

        handler.open({
            name    : this.state.data.plugin.title,
            plan_id : planID,
            licenses: this.state.data.selectedLicenseQuantity,
            success : function (response) {
            }
        });
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
                    licenseQuantities               = {},
                    selectedBillingCycle            = null,
                    hasFeaturedPlan                 = false,
                    planSingleSitePricingCollection = [],
                    planManager                     = PlanManager.getInstance(pricingData.plans);

                for (let i in pricingData.plans) {
                    if ( ! pricingData.plans.hasOwnProperty(i)) {
                        continue;
                    }

                    if ( ! hasFeaturedPlan) {
                        hasFeaturedPlan = pricingData.plans[i].is_featured;
                    }

                    if ( ! pricingData.plans[i].features) {
                        pricingData.plans[i].features = [];
                    }

                    let pricingCollection = pricingData.plans[i].pricing;

                    if ( ! pricingCollection) {
                        continue;
                    }

                    for (let j in pricingCollection) {
                        if ( ! pricingCollection.hasOwnProperty(j)) {
                            continue;
                        }

                        let pricing = pricingCollection[j];

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

                        licenseQuantities[licenses] = true;
                    }
                }

                if (null != billingCycles.annual) {
                    selectedBillingCycle = 'annual';
                } else if (null != billingCycles.monthly) {
                    selectedBillingCycle = 'monthly';
                } else {
                    selectedBillingCycle = 'lifetime';
                }

                let newState = this.state;

                newState.data.plugin                   = pricingData.plugin;
                newState.data.plans                    = pricingData.plans;
                newState.data.hasFeaturedPlan          = hasFeaturedPlan;
                newState.data.billingCycles            = Object.keys(billingCycles);
                newState.data.currencies               = Object.keys(currencies);
                newState.data.currencySymbols          = {usd: '$', eur: '€', gbp: '£'};
                newState.data.licenseQuantities        = Object.keys(licenseQuantities);
                newState.data.selectedBillingCycle     = selectedBillingCycle;
                newState.data.faq                      = pricingData.faq[0].questions;
                newState.data.active_installs          = pricingData.active_installs;
                newState.data.downloads                = pricingData.downloads;
                newState.data.reviews                  = pricingData.reviews;
                newState.data.allPlansSingleSitePrices = pricingData.all_plans_single_site_pricing;
                newState.data.annualDiscount           = (billingCycles.annual && billingCycles.monthly) ?
                    planManager.largestAnnualDiscount(planSingleSitePricingCollection) :
                    0;

                this.setState(newState);
            });
    }

    pricingSitesLabel(pricing) {
        if ( ! pricing)
            return '';

        let label = '';

        if (1 == pricing.licenses)
            label = 'Single';
        else if (null == pricing.licenses)
            label = 'Unlimited';
        else
            label = pricing.licenses;

        return (label + ' Site' + (1 == pricing.licenses ? '' : 's'));
    }

    priceLabel(pricing) {
        let pricingData = this.state.data,
            label       = '';

        label += pricingData.currencySymbols[pricingData.selectedCurrency];
        label += pricing[pricingData.selectedBillingCycle + '_price'];

        if ('monthly' === pricingData.selectedBillingCycle)
            label += ' / mo';
        else if ('annual' === pricingData.selectedBillingCycle)
            label += ' / year';

        return label;
    }

    billingCycleDescription (billingCycle) {
        if ('annual' !== billingCycle)
            return '';

        if ( ! (this.state.data.annualDiscount > 0)) {
            return '';
        }

        return `(up to ${this.state.data.annualDiscount}% off)`;
    }

    billingCycleLabel () {
        let label = 'Billed ';

        if ('annual' === this.state.data.selectedBillingCycle)
            label += 'Annually';
        else if ('lifetime' === this.state.data.selectedBillingCycle)
            label += 'Once';
        else
            label += 'Monthly';

        return label;
    }

    onChangeBillingCycle (e) {
        let newState  = this.state;

        newState.data.selectedBillingCycle = e.currentTarget.dataset.billingCycle;

        this.setState(newState);
    }

    onChangeCurrency (e) {
        let newState  = this.state;

        newState.data.selectedCurrency = e.currentTarget.value;

        this.setState(newState);
    }

    onChangeLicenses(e) {
        let newState   = this.state,
            pricingKey = e.currentTarget.value,
            plans      = newState.data.plans;

        for (let planKey in plans) {
            if ( ! plans.hasOwnProperty(planKey)) {
                continue;
            }

            let plan = plans[planKey];

            if (plan.is_hidden || ! plan.pricing) {
                continue;
            }

            let pricingCollection = plans[planKey].pricing;

            if (pricingCollection[pricingKey]) {
                newState.data.selectedLicenseQuantity = (null !== pricingCollection[pricingKey].licenses) ?
                    pricingCollection[pricingKey].licenses :
                    0;

                break;
            }
        }

        this.setState(newState);
    }

    render() {
        let pricingData = this.state.data;

        return (
            <div className="fs-app">
                <div className="fs-page-title">
                    <span>Plans and Pricing</span>
                    <span>Choose your plan and upgrade in minutes!</span>
                </div>
                <header className="fs-app-header">
                    <img src={pricingData.plugin.icon} className="fs-plugin-logo" alt="logo" width="48" height="48" />
                    <span>{pricingData.plugin.title}</span>
                </header>
                {pricingData.annualDiscount > 0 &&
                    <div className="fs-annual-discount">Save up to {pricingData.annualDiscount}% on Yearly Pricing!</div>
                }
                <section className="fs-section fs-section-billing-cycles">
                    <ul className="fs-billing-cycles">
                        {
                            pricingData.billingCycles.map(
                                billingCycle => {
                                    let label = ('annual' === billingCycle) ?
                                        'Annually' :
                                        (billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1));

                                    return <li className={pricingData.selectedBillingCycle === billingCycle ? 'fs-selected-billing-cycle' : ''} key={billingCycle} data-billing-cycle={billingCycle} onClick={this.onChangeBillingCycle}>{label} <span>{this.billingCycleDescription(billingCycle)}</span></li>
                                }
                            )
                        }
                    </ul>
                </section>
                <section className="fs-section fs-section-currencies">
                    <select className="fs-currencies" onChange={this.onChangeCurrency} value={pricingData.selectedCurrency}>
                        {
                            pricingData.currencies.map(
                                ( currency ) => {
                                    return <option key={currency} value={currency}>{pricingData.currencySymbols[currency]} - {currency.toUpperCase()}</option>
                                }
                            )
                        }
                    </select>
                </section>
                <section className="fs-section fs-section-packages">
                    <ul className={'fs-packages' + (pricingData.hasFeaturedPlan ? ' fs-packages-has-featured-plan' : '')}>
                        {
                            pricingData.plans.map(
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
                                            pricingData.selectedCurrency        == pricing.currency &&
                                            pricingData.selectedLicenseQuantity == (null != pricing.licenses ? pricing.licenses : 0)
                                        ) {
                                            selectedPricing = pricing;
                                        }
                                    });

                                    let planDescription = plan.description ?
                                        plan.description :
                                        '';

                                    let selectedPricingAmount = selectedPricing[`${pricingData.selectedBillingCycle}_price`].toString();

                                    return <li key={plan.id} className={'fs-package' + (plan.is_featured ? ' fs-featured-plan' : '')}>
                                        <div className="fs-most-popular"><strong>Most Popular</strong></div>
                                        <div className="fs-package-content">
                                            <div className="fs-plan-title">{plan.title}</div>
                                            <div className="fs-plan-description">
                                                <strong>
                                                    {
                                                        planDescription.split('\n').map((item, key) => {
                                                            return <Fragment key={key}>{item}<br/></Fragment>
                                                        })
                                                    }
                                                </strong>
                                            </div>
                                            {'annual' === pricingData.selectedBillingCycle && pricingData.annualDiscount > 0 &&
                                                <div className="fs-undiscounted-price">Normally {selectedPricing.getMonthlyAmount(BillingCycle.MONTHLY)} / mo</div>
                                            }
                                            <div className="fs-selected-pricing-amount">
                                                <strong className="fs-currency-symbol">{pricingData.currencySymbols[pricingData.selectedCurrency]}</strong>
                                                <span className="fs-selected-pricing-amount-integer"><strong>{selectedPricingAmount.split('.')[0]}</strong></span>
                                                <span className="fs-selected-pricing-amount-fraction-container">
                                                            <strong className="fs-selected-pricing-amount-fraction">.{selectedPricingAmount.split('.')[1]}</strong>
                                                            {'lifetime' !== pricingData.selectedBillingCycle &&
                                                                <sub className="fs-selected-pricing-amount-cycle">/ mo</sub>
                                                            }
                                                        </span>
                                            </div>
                                            <div className="fs-selected-pricing-cycle"><strong>{this.billingCycleLabel()}</strong></div>
                                            <div className="fs-selected-pricing-license-quantity">{this.pricingSitesLabel(selectedPricing)} <span className="fs-tooltip">?</span></div>
                                            <div className="fs-plan-support">{plan.support}</div>
                                            <table className="fs-license-quantities">
                                                <tbody>{
                                                    Object.keys(pricingCollection).map(
                                                        ( pricingKey ) => {
                                                            let pricing = pricingCollection[pricingKey];

                                                            if (pricing.is_hidden || pricingData.selectedCurrency !== pricing.currency) {
                                                                return null;
                                                            }

                                                            let isPricingLicenseQuantitySelected = (pricingData.selectedLicenseQuantity == (null == pricing.licenses ? 0 : pricing.licenses));

                                                            let multiSiteDiscount = PlanManager.getInstance().calculateMultiSiteDiscount(pricing, pricingData.selectedBillingCycle);

                                                            return (
                                                                <tr key={pricing.id} className={"fs-license-quantity-container" + (isPricingLicenseQuantitySelected ? ' fs-license-quantity-selected' : '')}>
                                                                    <td className="fs-license-quantity">
                                                                        <input
                                                                            type="radio"
                                                                            id={pricing.id}
                                                                            name={'fs_plan_' + plan.id + '_licenses'}
                                                                            value={pricingKey}
                                                                            checked={isPricingLicenseQuantitySelected}
                                                                            onChange={this.onChangeLicenses}
                                                                        />
                                                                        {this.pricingSitesLabel(pricing)}
                                                                    </td>
                                                                    {
                                                                        multiSiteDiscount > 0 ?
                                                                            <td className="fs-license-quantity-discount">Save {multiSiteDiscount}%</td> :
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
                                                {plan.features.map(feature => <li key={feature.id}><span>&#10003;</span> {feature.title} <span className="fs-tooltip">?</span></li>)}
                                            </ul>
                                        </div>
                                    </li>
                                }
                            )
                        }
                    </ul>
                </section>
                <section className="fs-section fs-section-custom-implementation">
                    <div>Need more sites, custom implementation and dedicated support?</div>
                    <div>We got you covered! <a href="#">Click here to contact us</a> and we'll scope a plan that's tailored to your needs.</div>
                </section>
                <section className="fs-section fs-section-money-back-guarantee">
                    <div className="fs-money-back-guarantee-title">7-day Money Back Guarantee</div>
                    <div className="fs-money-back-guarantee-message">You are fully protected by our 100% Money Back Guarantee. If during the next 7 days you experience an issue that makes the plugin unusable and we are unable to resolve it, we'll happily consider offering a full refund of your money.</div>
                    <button className="fs-button fs-button--size-small">Learn More</button>
                    <img src={guaranteeStamp}/>
                </section>
                <section className="fs-section fs-section-badges">
                    <ul>
                        <li className="fs-badge"><img src="//img.freemius.com/badges/freemius-badge-secure-payments-light.svg" alt="Secure payments by Freemius - Sell and market freemium and premium WordPress plugins & themes" /></li>
                        <li className="fs-badge"><img src="//img.freemius.com/checkout/badges/mcafee.png" alt="McAfee Badge"/></li>
                        <li className="fs-badge"><img src="//img.freemius.com/checkout/badges/paypal.png" alt="PayPal Verified Badge"/></li>
                        <li className="fs-badge"><img src="//img.freemius.com/checkout/badges/comodo-short-green.png" alt="Comodo Secure SSL Badge"/></li>
                    </ul>
                </section>
                <section className="fs-section fs-section-testimonials">
                    <header className="fs-section-header"><h2></h2></header>
                    <section className="fs-testimonials-nav">
                        <nav className="fs-nav fs-nav-prev">&larr;</nav>
                        <section className="fs-testimonials">
                            <section className="fs-testimonial">
                                <header className="fs-testimonial-header">
                                    <div className="fs-testimonial-logo"></div>
                                    <h3></h3>
                                    <div className="testimonial-rating"></div>
                                </header>
                                <section>
                                    <div className="fs-testimonial-message"></div>
                                    <section className="fs-testimonial-author">
                                        <div className="fs-testimonial-author-name"></div>
                                        <div></div>
                                    </section>
                                </section>
                            </section>
                        </section>
                        <nav className="fs-nav fs-nav-next">&rarr;</nav>
                    </section>
                    <nav className="fs-nav fs-nav-pagination"></nav>
                </section>
                <section className="fs-section fs-section-faq">
                    <h2>Frequently Asked Questions</h2>
                    <section className="fs-section-faq-items">
                        {pricingData.faq.map(faqItem => <section className="fs-section-faq-item"><header>{faqItem['q']}</header><section>{faqItem['a']}</section></section>)}
                    </section>
                </section>
            </div>
        );
    }
}

export default PricingPage;