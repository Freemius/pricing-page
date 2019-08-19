import React, {Component, Fragment} from 'react';
import FSPricingContext from "../../FSPricingContext";
import Section from "../Section";
import {BillingCycle} from "../../entities/Pricing";
import {RefundPolicyType} from "../../entities/Plugin";
import {Helper} from "../../Helper";
import {PageManager} from "../../services/PageManager";

class Faq extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);
    }

    render() {
        let context = this.context;

        if ( ! context || ! context.plugin || ! Helper.isNumeric(context.plugin.id)) {
            return null;
        }

        let faq                   = [],
            faqSupportAnswer      = '',
            isBlockingAnnually    = false,
            isBlockingMonthly     = false,
            hasAnnualCycle        = context.hasAnnualCycle,
            hasLifetimePricing    = context.hasLifetimePricing,
            hasMonthlyCycle       = context.hasMonthlyCycle,
            moduleLabel           = context.plugin.moduleLabel();

        if (context.hasEmailSupportForAllPlans) {
            faqSupportAnswer = 'Yes! Top-notch customer support is key for a quality product, so we\'ll do our very best to resolve any issues you encounter via our support page.';
        } else if (context.hasEmailSupportForAllPaidPlans) {
            faqSupportAnswer = 'Yes! Top-notch customer support for our paid customers is key for a quality product, so we\'ll do our very best to resolve any issues you encounter via our support page.';
        } else if (context.hasAnyPlanWithSupport) {
            faqSupportAnswer = 'Yes! Top-notch customer support is key for a quality product, so we\'ll do our very best to resolve any issues you encounter. Note, each plan provides a different level of support.';
        } else if (context.plugin.hasWordPressOrgVersion()) {
            faqSupportAnswer = <Fragment>You can post your questions in our <a href={"https://wordpress.org/support/plugin/" + context.plugin.slug} target="_blank">WordPress Support Forum</a> to get help from the community. Unfortunately extra support is currently not provided.</Fragment>
        }

        if (context.hasPremiumVersion) {
            faq.push({
                'q': 'Is there a setup fee?',
                'a': 'No. There are no setup fees on any of our plans.',
            });
        }

        if (null !== context.firstPaidPlan) {
            isBlockingMonthly  = context.firstPaidPlan.isBlockingMonthly();
            isBlockingAnnually = context.firstPaidPlan.isBlockingAnnually();
        }

        let isBlocking    = (isBlockingMonthly && isBlockingAnnually),
            isNonBlocking = ( ! isBlockingMonthly && ! isBlockingAnnually);

        faq.push({
            'q': 'Can I cancel my account at any time?',
            'a': `Yes, if you ever decide that ${context.plugin.title} isn't the best ${moduleLabel} for your business, simply cancel your account from your Account panel.` +
                (
                    isBlocking ?
                        '' :
                        (
                            isNonBlocking ?
                                " You'll" :
                                ' If you cancel ' + ( ! isBlockingAnnually ? 'an annual' : 'a monthly') + " subscription, you'll"
                        ) + ` still be able to use the ${moduleLabel} without updates or support.`
                )
        });

        if (hasMonthlyCycle || hasAnnualCycle) {
            let answer = '';

            if (hasMonthlyCycle && hasAnnualCycle && hasLifetimePricing)
                answer = 'All plans are month-to-month unless you subscribe for an annual or lifetime plan.';
            else if (hasMonthlyCycle && hasAnnualCycle)
                answer = 'All plans are month-to-month unless you subscribe for an annual plan.';
            else if (hasMonthlyCycle && hasLifetimePricing)
                answer = 'All plans are month to month unless you purchase a lifetime plan.';
            else if (hasAnnualCycle && hasLifetimePricing)
                answer = 'All plans are year-to-year unless you purchase a lifetime plan.';
            else if (hasMonthlyCycle)
                answer = 'All plans are month-to-month.';
            else if (hasAnnualCycle)
                answer = 'All plans are year-to-year.';

            faq.push({
                'q': "What's the time span for your contracts?",
                'a': answer,
            });
        }

        if (context.annualDiscount > 0) {
            faq.push({
                'q': 'Do you offer any discounted plans?',
                'a': `Yes, we offer up to ${context.annualDiscount}% discount on an annual plans, when they are paid upfront.`,
            });
        }

        if (hasAnnualCycle && context.plugin.hasRenewalsDiscount(BillingCycle.ANNUAL)) {
            faq.push({
                'q': 'Do you offer a renewals discount?',
                'a': `Yes, you get ${context.plugin.getFormattedRenewalsDiscount(BillingCycle.ANNUAL)} discount for all annual plan automatic renewals. The renewal price will never be increased so long as the subscription is not cancelled.`,
            });
        }

        if (context.plansCount > 1) {
            faq.push({
                'q': 'Can I change my plan later on?',
                'a': 'Absolutely! You can upgrade or downgrade your plan at any time.',
            });
        }

        faq.push({
            'q': 'What payment methods are accepted?',
            'a': (context.isPayPalSupported ?
                    'We accept all major credit cards including Visa, Mastercard, American Express, as well as PayPal payments.' :
                    <Fragment>We accept all major credit cards including Visa, Mastercard and American Express.<br />Unfortunately, due to regulations in your country related to PayPal’s subscriptions, we won’t be able to accept payments via PayPal.</Fragment>)
        });

        let refundAnswer = `We don't offer refunds, but we do offer a free version of the ${moduleLabel} (the one you are using right now).`;

        if (context.plugin.hasRefundPolicy()) {
            if (RefundPolicyType.STRICT !== context.plugin.refund_policy) {
                refundAnswer = <Fragment><a className="message-trigger" onClick={evt => this.props.toggleRefundPolicyModal(evt)} href="#">Yes we do!</a> We stand behind the quality of our product and will refund 100% of your money if you are unhappy with the plugin.</Fragment>
            } else {
                refundAnswer = <Fragment><a className="message-trigger" onClick={evt => this.props.toggleRefundPolicyModal(evt)} href="#">Yes we do!</a> We stand behind the quality of our product and will refund 100% of your money if you experience an issue that makes the plugin unusable and we are unable to resolve it.</Fragment>
            }
        }

        faq.push({
            'q': 'Do you offer refunds?',
            'a': refundAnswer,
        });

        if (context.hasPremiumVersion) {
            faq.push({
                'q': `Do I get updates for the premium ${moduleLabel}?`,
                'a': `Yes! Automatic updates to our premium ${moduleLabel} are available free of charge as long as you stay our paying customer.` +
                    (
                        isBlocking ?
                            '' :
                            ' If you cancel your ' +
                            (
                                isNonBlocking ?
                                    'subscription' :
                                    (
                                        ! isBlockingAnnually ?
                                            'annual subscription' :
                                            'monthly subscription'
                                    )
                            ) + `, you'll still be able to use our ${moduleLabel} without updates or support.`
                    )
            });
        }

        if ('' !== faqSupportAnswer) {
            faq.push({
                'q': 'Do you offer support if I need help?',
                'a': faqSupportAnswer,
            });
        }

        faq.push({
            'q': 'I have other pre-sale questions, can you help?',
            'a':  <Fragment>Yes! You can ask us any question through our <a className="contact-link" href={PageManager.getInstance().getContactUrl(this.context.plugin, 'pre_sale_question')}>support page</a>.</Fragment>
        });

        let faqElements = [];

        for (let i = 0; i < faq.length; i ++) {
            faqElements.push(
                <Section key={i} fs-section="faq-item"><h3>{faq[i]['q']}</h3><p>{faq[i]['a']}</p></Section>
            );
        }

        return (
            <Fragment>
                <header className="fs-section-header"><h2>Frequently Asked Questions</h2></header>
                <Section fs-section="faq-items">{faqElements}</Section>
            </Fragment>
        );
    }
}

export default Faq;