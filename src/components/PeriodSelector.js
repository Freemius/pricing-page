import React, { Component } from 'react';
import FSPricingContext from '../FSPricingContext';
import { Helper } from '../Helper';
import { BillingCycleString } from '../entities/Pricing';

/**
 * @author Leo Fajardo
 */
class PeriodSelector extends Component {
  static contextType = FSPricingContext;

  constructor(props) {
    super(props);
  }

  /**
   * @return {string} Returns a string that is appended to the annual billing cycle label, e.g.: `(up to 19% off)`.
   */
  annualDiscountLabel() {
    if (!(this.context.annualDiscount > 0)) {
      return '';
    }

    return `(up to ${this.context.annualDiscount}% off)`;
  }

  render() {
    return (
      <ul className="fs-billing-cycles">
        {this.context.billingCycles.map(billingCycle => {
          let label =
            BillingCycleString.ANNUAL === billingCycle
              ? 'Annually'
              : Helper.ucfirst(billingCycle);

          return (
            <li
              className={
                `fs-period--${billingCycle}` +
                (this.context.selectedBillingCycle === billingCycle
                  ? ' fs-selected-billing-cycle'
                  : '')
              }
              key={billingCycle}
              data-billing-cycle={billingCycle}
              onClick={this.props.handler}
            >
              {label}{' '}
              {BillingCycleString.ANNUAL === billingCycle && (
                <span>{this.annualDiscountLabel()}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }
}

export default PeriodSelector;
