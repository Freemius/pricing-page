import React, { Component, Fragment } from 'react';

import '.././assets/scss/App.scss';

import badgeFreemius from '.././assets/img/freemius-badge-secure-payments-light.svg';
import badgeMcAfee from '.././assets/img/mcafee.png';
import badgePayPal from '.././assets/img/paypal.png';
import badgeComodo from '.././assets/img/comodo-short-green.png';
import defaultPluginIcon from '.././assets/img/plugin-icon.png';
import defaultThemeIcon from '.././assets/img/theme-icon.png';

import { Plan } from '../entities/Plan';
import { Plugin } from '../entities/Plugin';
import {
  BillingCycleString,
  CurrencySymbol,
  DefaultCurrency,
  DiscountsModel,
  Pricing,
  UnlimitedLicenses,
} from '.././entities/Pricing';
import { PlanManager } from '.././services/PlanManager';
import FSPricingContext from '.././FSPricingContext';

import Section from './Section';
import PeriodSelector from './PeriodSelector';
import CurrencySelector from './CurrencySelector';
import PackagesContainer from './PackagesContainer';
import Badges from './Badges';
import Testimonials from './testimonials/Testimonials';
import Faq from './faq/Faq';
import RefundPolicy from './RefundPolicy';
import { FSConfig } from '../index';
import { RequestManager } from '../services/RequestManager';
import { PageManager } from '../services/PageManager';
import { Helper } from '../Helper';
import { TrackingManager } from '../services/TrackingManager';
import Loader from './Loader';
import TrialConfirmationModal from './TrialConfirmationModal';

class FreemiusPricingMain extends Component {
  static contextType = FSPricingContext;

  constructor(props) {
    super(props);

    this.state = {
      active_installs: 0,
      annualDiscount: 0,
      billingCycles: [],
      currencies: [],
      downloads: 0,
      faq: [],
      firstPaidPlan: null,
      featuredPlan: null,
      isActivatingTrial: false,
      isPayPalSupported: false,
      isNetworkTrial: false,
      isTrial: 'true' === FSConfig.trial || true === FSConfig.trial,
      pendingConfirmationTrialPlan: null,
      plugin: {},
      plans: [],
      selectedPlanID: null,
      reviews: [],
      selectedBillingCycle: Pricing.getBillingCyclePeriod(
        FSConfig.billing_cycle
      ),
      selectedCurrency: this.getDefaultCurrency(),
      selectedLicenseQuantity: this.getDefaultLicenseQuantity(),
      upgradingToPlanID: null,
      license: FSConfig.license,
      showAnnualInMonthly: FSConfig.show_annual_in_monthly,
    };

    this.changeBillingCycle = this.changeBillingCycle.bind(this);
    this.changeCurrency = this.changeCurrency.bind(this);
    this.changeLicenses = this.changeLicenses.bind(this);
    this.changePlan = this.changePlan.bind(this);
    this.getModuleIcon = this.getModuleIcon.bind(this);
    this.startTrial = this.startTrial.bind(this);
    this.toggleRefundPolicyModal = this.toggleRefundPolicyModal.bind(this);
    this.upgrade = this.upgrade.bind(this);
  }

  appendScripts() {
    let script = null;

    if (!this.hasInstallContext()) {
      script = document.createElement('script');
      script.src =
        (this.isProduction()
          ? 'https://checkout.freemius.com'
          : 'http://checkout.freemius-local.com:8080') + '/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }

    if (!this.isSandboxPaymentsMode()) {
      // ga
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] =
          i[r] ||
          function () {
            (i[r].q = i[r].q || []).push(arguments);
          };
        i[r].l = 1 * new Date();
        a = s.createElement(o);
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(
        window,
        document,
        'script',
        '//www.google-analytics.com/analytics.js',
        'ga'
      );
    }
  }

  /**
   * Updates the state with the selected billing cycle.
   *
   * @param {Object} e
   */
  changeBillingCycle(e) {
    this.setState({
      selectedBillingCycle: e.currentTarget.dataset.billingCycle,
    });
  }

  /**
   * Updates the state with the selected currency.
   *
   * @param {object} e
   */
  changeCurrency(e) {
    this.setState({ selectedCurrency: e.currentTarget.value });
  }

  /**
   * Updates the state with the selected license quantity.
   *
   * @param {object} e
   */
  changeLicenses(e) {
    let pricingID = e.currentTarget.value,
      selectedLicenseQuantity = this.state.selectedLicenseQuantity;

    for (let plan of this.state.plans) {
      if (Helper.isUndefinedOrNull(plan.pricing)) {
        continue;
      }

      for (let pricing of plan.pricing) {
        if (pricingID != pricing.id) {
          continue;
        }

        selectedLicenseQuantity = pricing.getLicenses();

        break;
      }
    }

    this.setState({ selectedLicenseQuantity: selectedLicenseQuantity });
  }

  changePlan(e) {
    let selectedPlanID = e.target.value
      ? e.target.value
      : e.target.dataset.planId
      ? e.target.dataset.planId
      : e.target.parentNode.dataset.planId;

    e.preventDefault();

    this.setState({ selectedPlanID: selectedPlanID });
  }

  getModuleIcon() {
    let defaultIconUrl =
      'theme' === this.state.plugin.type ? defaultThemeIcon : defaultPluginIcon;

    return (
      <object
        data={FSConfig.plugin_icon ?? this.state.plugin.icon}
        className="fs-plugin-logo"
        type="image/png"
      >
        <img
          src={defaultIconUrl}
          className="fs-plugin-logo"
          alt={`${this.state.plugin.type}-logo`}
        />
      </object>
    );
  }

  componentDidMount() {
    this.fetchPricingData();
  }

  /**
   * @return {string} Defaults to `usd` if the currency that was passed in the config is not valid.
   */
  getDefaultCurrency() {
    if (
      !Helper.isNonEmptyString(FSConfig.currency) &&
      !CurrencySymbol[FSConfig.currency]
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

    return Helper.isNumeric(FSConfig.licenses) ? FSConfig.licenses : 1;
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
        if (
          pricing.getLicenses() == this.state.selectedLicenseQuantity &&
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
  hasInstallContext() {
    return !Helper.isUndefinedOrNull(this.state.install);
  }

  /**
   * @return {boolean}
   */
  isDashboardMode() {
    return 'dashboard' === FSConfig.mode;
  }

  /**
   * @return {boolean}
   * @deprecated - This always returns what's in `isDashboardMode`, we don't support being loaded through an iFrame, so it is always embedded.
   */
  isEmbeddedDashboardMode() {
    return this.isDashboardMode();
  }

  /**
   * @return {boolean}
   */
  isProduction() {
    if (!Helper.isUndefinedOrNull(FSConfig.is_production)) {
      return FSConfig.is_production;
    }

    return -1 === ['3000', '8080'].indexOf(window.location.port);
  }

  /**
   * @return {boolean}
   */
  isSandboxPaymentsMode() {
    return (
      Helper.isNonEmptyString(FSConfig.sandbox) &&
      Helper.isNumeric(FSConfig.s_ctx_ts)
    );
  }

  startTrial(planID) {
    this.setState({
      isActivatingTrial: true,
      upgradingToPlanID: planID,
    });

    let endpointUrl = this.isEmbeddedDashboardMode()
      ? FSConfig.request_handler_url
      : FSConfig.fs_wp_endpoint_url + '/action/service/subscribe/trial/';

    RequestManager.getInstance()
      .request(endpointUrl, {
        prev_url: window.location.href,
        pricing_action: 'start_trial',
        plan_id: planID,
      })
      .then(result => {
        if (result.success) {
          // Track trial start.
          this.trackingManager.track('started');

          const page =
            this.state.plugin.menu_slug +
            (this.hasInstallContext() ? '-account' : '');

          let nextPage;

          if (Helper.isNonEmptyString(FSConfig.next)) {
            // Fix the `page` query string parameter, if no install context is available.
            nextPage = FSConfig.next;

            if (!this.hasInstallContext()) {
              nextPage = nextPage.replace(/page=[^&]+/, `page=${page}`);
            }
          } else {
            // Just a safe fallback in case the FSConfig.next is not set.
            nextPage = PageManager.getInstance().addQueryArgs(
              window.location.href,
              {
                page,
                fs_action: this.state.plugin.unique_affix + '_sync_license',
                plugin_id: this.state.plugin.id,
              }
            );
          }

          PageManager.getInstance().redirect(nextPage);
        }

        this.setState({
          isActivatingTrial: false,
          pendingConfirmationTrialPlan: null,
          upgradingToPlanID: null,
        });
      });
  }

  toggleRefundPolicyModal(evt) {
    evt.preventDefault();

    this.setState({ showRefundPolicyModal: !this.state.showRefundPolicyModal });
  }

  upgrade(plan, pricing) {
    if (PlanManager.getInstance().isFreePlan(plan.pricing)) {
      return;
    }

    if (this.state.isTrial && !plan.requiresSubscription()) {
      if (this.hasInstallContext()) {
        this.startTrial(plan.id);
      } else {
        this.setState({ pendingConfirmationTrialPlan: plan });
      }
    } else {
      if (null === pricing) {
        pricing = this.getSelectedPlanPricing(plan.id);
      }

      const billingCycle = this.state.selectedBillingCycle;

      if (this.state.skipDirectlyToPayPal) {
        let data = {},
          trial_period = plan.trial_period;

        if (trial_period > 0) {
          data.trial_period = trial_period;

          if (this.hasInstallContext()) {
            data.user_id = this.state.install.user_id;
          }
        }

        let params = {
          plan_id: plan.id,
          pricing_id: pricing.id,
          billing_cycle: billingCycle,
        };

        params.prev_url = window.location.href;

        PageManager.getInstance().redirect(
          FSConfig.fs_wp_endpoint_url +
            '/action/service/paypal/express-checkout/',
          params
        );
      } else {
        let urlParams = {
          checkout: 'true',
          plan_id: plan.id,
          plan_name: plan.name,
          billing_cycle: billingCycle,
          pricing_id: pricing.id,
          currency: this.state.selectedCurrency,
        };

        // Handle trial mode which requires payment method, this must go through the checkout.
        if (this.state.isTrial) {
          urlParams.trial = 'true';
        }

        PageManager.getInstance().redirect(window.location.href, urlParams);
      }
    }
  }

  fetchPricingData() {
    let params = {
      pricing_action: 'fetch_pricing_data',
      trial: this.state.isTrial,
      is_sandbox: this.isSandboxPaymentsMode(),
    };

    RequestManager.getInstance()
      .request(FSConfig.request_handler_url, params)
      .then(pricingData => {
        if (pricingData.data) {
          pricingData = pricingData.data;
        }

        if (!pricingData.plans) {
          return;
        }

        let billingCycles = {},
          currencies = {},
          hasAnnualCycle = false,
          hasAnyPlanWithSupport = false,
          hasEmailSupportForAllPaidPlans = true,
          hasEmailSupportForAllPlans = true,
          featuredPlan = null,
          firstPaidPlan = null,
          hasLifetimePricing = false,
          hasMonthlyCycle = false,
          licenseQuantities = {},
          paidPlansCount = 0,
          planManager = PlanManager.getInstance(pricingData.plans),
          plansCount = 0,
          planSingleSitePricingCollection = [],
          priorityEmailSupportPlanID = null,
          selectedBillingCycle = this.state.selectedBillingCycle,
          paidPlanWithTrial = null,
          isNetworkTrial = false,
          isTrial =
            'true' === pricingData.trial_mode ||
            true === pricingData.trial_mode,
          trialUtilized =
            'true' === pricingData.trial_utilized ||
            true === pricingData.trial_utilized;

        for (
          let planIndex = 0;
          planIndex < pricingData.plans.length;
          planIndex++
        ) {
          if (!pricingData.plans.hasOwnProperty(planIndex)) {
            continue;
          }

          if (pricingData.plans[planIndex].is_hidden) {
            // Remove plan from the collection.
            pricingData.plans.splice(planIndex, 1);

            planIndex--;

            continue;
          }

          plansCount++;

          pricingData.plans[planIndex] = new Plan(pricingData.plans[planIndex]);

          let plan = pricingData.plans[planIndex];

          if (plan.is_featured) {
            featuredPlan = plan;
          }

          if (Helper.isUndefinedOrNull(plan.features)) {
            plan.features = [];
          }

          let pricingCollection = plan.pricing;

          if (Helper.isUndefinedOrNull(pricingCollection)) {
            continue;
          }

          for (
            let pricingIndex = 0;
            pricingIndex < pricingCollection.length;
            pricingIndex++
          ) {
            if (!pricingCollection.hasOwnProperty(pricingIndex)) {
              continue;
            }

            pricingCollection[pricingIndex] = new Pricing(
              pricingCollection[pricingIndex]
            );

            let pricing = pricingCollection[pricingIndex];

            if (null != pricing.monthly_price && !pricing.is_hidden) {
              billingCycles[BillingCycleString.MONTHLY] = true;
            }

            if (null != pricing.annual_price && !pricing.is_hidden) {
              billingCycles[BillingCycleString.ANNUAL] = true;
            }

            if (null != pricing.lifetime_price && !pricing.is_hidden) {
              billingCycles[BillingCycleString.LIFETIME] = true;
            }

            currencies[pricing.currency] = true;

            let licenses = pricing.getLicenses();

            if (!licenseQuantities[pricing.currency]) {
              licenseQuantities[pricing.currency] = {};
            }

            licenseQuantities[pricing.currency][licenses] = true;
          }

          let isPaidPlan = planManager.isPaidPlan(pricingCollection);

          if (isPaidPlan && null === firstPaidPlan) {
            firstPaidPlan = plan;
          }

          if (!plan.hasEmailSupport()) {
            hasEmailSupportForAllPlans = false;

            if (isPaidPlan) {
              hasEmailSupportForAllPaidPlans = false;
            }
          } else {
            if (!plan.hasSuccessManagerSupport()) {
              priorityEmailSupportPlanID = plan.id;
            }
          }

          if (!hasAnyPlanWithSupport && plan.hasAnySupport()) {
            hasAnyPlanWithSupport = true;
          }

          if (isPaidPlan) {
            paidPlansCount++;

            let singleSitePricing = planManager.getSingleSitePricing(
              pricingCollection,
              this.state.selectedCurrency
            );
            if (null !== singleSitePricing) {
              planSingleSitePricingCollection.push(singleSitePricing);
            }
          }
        }

        if (
          isTrial &&
          !Helper.isUndefinedOrNull(FSConfig.is_network_admin) &&
          ('true' === FSConfig.is_network_admin ||
            true === FSConfig.is_network_admin)
        ) {
          isNetworkTrial = true;

          /**
           * Trial mode in the network level is currently disabled since the trial logic allows only one trial per user per product.
           */
          isTrial = false;
        }

        if (isTrial) {
          for (let plan of pricingData.plans) {
            if (plan.is_hidden) {
              continue;
            }

            if (plan.pricing && !planManager.isFreePlan(plan.pricing)) {
              if (plan.hasTrial()) {
                paidPlanWithTrial = plan;
                break;
              }
            }
          }

          if (null === paidPlanWithTrial) {
            // Didn't find any paid plans with trial in it.
            isTrial = false;
          }
        }

        if (null != billingCycles.annual) {
          hasAnnualCycle = true;
        }

        if (null != billingCycles.monthly) {
          hasMonthlyCycle = true;
        }

        if (null != billingCycles.lifetime) {
          hasLifetimePricing = true;
        }

        if (Helper.isUndefinedOrNull(billingCycles[selectedBillingCycle])) {
          if (hasAnnualCycle) {
            selectedBillingCycle = BillingCycleString.ANNUAL;
          } else if (hasMonthlyCycle) {
            selectedBillingCycle = BillingCycleString.MONTHLY;
          } else {
            selectedBillingCycle = BillingCycleString.LIFETIME;
          }
        }

        let plugin = new Plugin(pricingData.plugin);

        if (Helper.isNonEmptyString(FSConfig.menu_slug)) {
          plugin.menu_slug = FSConfig.menu_slug;
        }

        plugin.unique_affix = !Helper.isUndefinedOrNull(FSConfig.unique_affix)
          ? FSConfig.unique_affix
          : plugin.slug + ('theme' === plugin.type ? '-theme' : '');

        this.setState({
          active_installs: pricingData.active_installs,
          allPlansSingleSitePrices: pricingData.all_plans_single_site_pricing,
          annualDiscount:
            hasAnnualCycle && hasMonthlyCycle
              ? planManager.largestAnnualDiscount(
                  planSingleSitePricingCollection
                )
              : 0,
          billingCycles: Object.keys(billingCycles),
          currencies: Object.keys(currencies),
          currencySymbols: { usd: '$', eur: '€', gbp: '£' },
          discountsModel: FSConfig?.discounts_model ?? DiscountsModel.ABSOLUTE,
          downloads: pricingData.downloads,
          hasAnnualCycle: hasAnnualCycle,
          hasEmailSupportForAllPaidPlans: hasEmailSupportForAllPaidPlans,
          hasEmailSupportForAllPlans: hasEmailSupportForAllPlans,
          featuredPlan: featuredPlan,
          firstPaidPlan: firstPaidPlan,
          hasLifetimePricing: hasLifetimePricing,
          hasMonthlyCycle: hasMonthlyCycle,
          hasPremiumVersion:
            'true' === pricingData.plugin.has_premium_version ||
            true === pricingData.plugin.has_premium_version,
          install: pricingData.install,
          isPayPalSupported:
            'true' === pricingData.is_paypal_supported ||
            true === pricingData.is_paypal_supported,
          licenseQuantities: licenseQuantities,
          paidPlansCount: paidPlansCount,
          paidPlanWithTrial: paidPlanWithTrial,
          plans: pricingData.plans,
          plansCount: plansCount,
          plugin: plugin,
          priorityEmailSupportPlanID: priorityEmailSupportPlanID,
          reviews: pricingData.reviews,
          selectedBillingCycle: selectedBillingCycle,
          skipDirectlyToPayPal:
            'true' === pricingData.skip_directly_to_paypal ||
            true === pricingData.skip_directly_to_paypal,
          isNetworkTrial: isNetworkTrial,
          isTrial: isTrial,
          trialUtilized: trialUtilized,
          showRefundPolicyModal: false,
        });

        this.appendScripts();

        this.trackingManager = TrackingManager.getInstance({
          billingCycle: Pricing.getBillingCyclePeriod(
            this.state.selectedBillingCycle
          ),
          isTrialMode: this.state.isTrial,
          isSandbox: this.isSandboxPaymentsMode(),
          isPaidTrial: false,
          isProduction: this.isProduction(),
          pageMode: this.isDashboardMode() ? 'dashboard' : 'page',
          pluginID: this.state.plugin.id,
          type: this.state.plugin.type,
          uid: this.hasInstallContext() ? this.state.install.id : null,
          userID: this.hasInstallContext() ? this.state.install.user_id : null,
        });
      });
  }

  render() {
    let pricingData = this.state;

    if (!pricingData.plugin.id) {
      const leftPos = document
        .querySelector(FSConfig.selector)
        .getBoundingClientRect().left;

      return (
        <Loader
          style={{ left: leftPos + 'px' }}
          isEmbeddedDashboardMode={this.isEmbeddedDashboardMode()}
        />
      );
    }

    let featuredPlan = pricingData.featuredPlan,
      trialUtilized = false;

    if (null !== featuredPlan) {
      let hasAnyVisiblePricing = false;

      for (let pricing of featuredPlan.pricing) {
        if (pricing.is_hidden) {
          continue;
        }

        let pricingLicenses = pricing.getLicenses();

        if (pricingLicenses != pricingData.selectedLicenseQuantity) {
          continue;
        }

        if (pricing.currency != pricingData.selectedCurrency) {
          continue;
        }

        if (!pricing.supportsBillingCycle(pricingData.selectedBillingCycle)) {
          continue;
        }

        hasAnyVisiblePricing = true;
        break;
      }

      if (!hasAnyVisiblePricing) {
        featuredPlan = null;
      }
    }

    let trialMessage = null;

    if (pricingData.trialUtilized || pricingData.isNetworkTrial) {
      if (pricingData.isNetworkTrial) {
        trialMessage =
          'Multisite network level trials are currently not supported. Apologies for the inconvenience.';
      } else if (!pricingData.isTrial) {
        let supportEmailAddress = this.state.plugin.main_support_email_address;

        trialMessage = (
          <Fragment>
            Sorry, but you have already utilized a trial. Please{' '}
            <a href={`mailto:${supportEmailAddress}`}>contact us</a> if you
            still want to test the paid version.
          </Fragment>
        );
      } else {
        trialMessage =
          'Trial was already utilized for this site and only enabled for testing purposes since you are running in a sandbox mode.';
      }

      trialMessage = <div className="fs-trial-message">{trialMessage}</div>;
    }

    return (
      <FSPricingContext.Provider value={this.state}>
        <div id="fs_pricing_app">
          {trialMessage}
          <header className="fs-app-header">
            <section className="fs-page-title">
              <h1>Plans and Pricing</h1>
              <h3>Choose your plan and upgrade in minutes!</h3>
            </section>
            <section className="fs-plugin-title-and-logo">
              {this.getModuleIcon()}
              <h1>
                <strong>{pricingData.plugin.title}</strong>
              </h1>
            </section>
          </header>
          <main className="fs-app-main">
            <Section fs-section="plans-and-pricing">
              {pricingData.annualDiscount > 0 && (
                <Section fs-section="annual-discount">
                  <div className="fs-annual-discount">
                    Save up to {pricingData.annualDiscount}% on Yearly Pricing!
                  </div>
                </Section>
              )}
              {this.state.isTrial && (
                <Section fs-section="trial-header">
                  <h2>
                    Start your {pricingData.paidPlanWithTrial.trial_period}-day
                    free trial
                  </h2>
                  <h4>
                    {!pricingData.paidPlanWithTrial.requiresSubscription()
                      ? 'No credit card required, includes all available features.'
                      : `No commitment for ${pricingData.paidPlanWithTrial.trial_period} days - cancel anytime!`}
                  </h4>
                </Section>
              )}
              {pricingData.billingCycles.length > 1 &&
                (!this.state.isTrial ||
                  pricingData.paidPlanWithTrial.requiresSubscription()) && (
                  <Section fs-section="billing-cycles">
                    <PeriodSelector
                      handler={this.changeBillingCycle}
                      billingCycleDescription={this.billingCycleDescription}
                    />
                  </Section>
                )}
              {pricingData.currencies.length > 1 && (
                <Section fs-section="currencies">
                  <CurrencySelector handler={this.changeCurrency} />
                </Section>
              )}
              <Section fs-section="packages">
                <PackagesContainer
                  changeLicensesHandler={this.changeLicenses}
                  changePlanHandler={this.changePlan}
                  upgradeHandler={this.upgrade}
                />
              </Section>
              <Section fs-section="custom-implementation">
                <h2>
                  Need more sites, custom implementation and dedicated support?
                </h2>
                <p>
                  We got you covered!{' '}
                  <a
                    href={PageManager.getInstance().getContactUrl(
                      this.state.plugin,
                      'pre_sale_question'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to contact us
                  </a>{' '}
                  and we'll scope a plan that's tailored to your needs.
                </p>
              </Section>
              {pricingData.plugin.hasRefundPolicy() &&
                (!this.state.isTrial || trialUtilized) && (
                  <Section fs-section="money-back-guarantee">
                    <RefundPolicy
                      toggleRefundPolicyModal={this.toggleRefundPolicyModal}
                    />
                  </Section>
                )}
              <Section fs-section="badges">
                <Badges
                  badges={[
                    {
                      key: 'fs-badges',
                      src: badgeFreemius,
                      alt: 'Secure payments by Freemius - Sell and market freemium and premium WordPress plugins & themes',
                      link: 'https://freemius.com/?badge=secure_payments&version=light#utm_source=wpadmin&utm_medium=payments_badge&utm_campaign=pricing_page',
                    },
                    {
                      key: 'mcafee',
                      src: badgeMcAfee,
                      alt: 'McAfee Badge',
                      link: 'https://www.mcafeesecure.com/verify?host=freemius.com',
                    },
                    {
                      key: 'paypal',
                      src: badgePayPal,
                      alt: 'PayPal Verified Badge',
                    },
                    {
                      key: 'comodo',
                      src: badgeComodo,
                      alt: 'Comodo Secure SSL Badge',
                    },
                  ]}
                />
              </Section>
            </Section>
            {!Helper.isUndefinedOrNull(this.state.reviews) &&
              this.state.reviews.length > 0 && (
                <Section fs-section="testimonials">
                  <Testimonials />
                </Section>
              )}
            <Section fs-section="faq">
              <Faq toggleRefundPolicyModal={this.toggleRefundPolicyModal} />
            </Section>
          </main>
          {pricingData.isActivatingTrial && (
            <Loader title="Activating trial..." />
          )}
          {!pricingData.isActivatingTrial &&
            null !== pricingData.pendingConfirmationTrialPlan && (
              <TrialConfirmationModal
                cancelTrialHandler={() =>
                  this.setState({ pendingConfirmationTrialPlan: null })
                }
                startTrialHandler={this.startTrial}
              />
            )}
        </div>
      </FSPricingContext.Provider>
    );
  }
}

export default FreemiusPricingMain;
