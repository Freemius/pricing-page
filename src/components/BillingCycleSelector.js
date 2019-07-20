import React, {Component} from 'react';
import FSPricingContext from "../FSPricingContext";
import {Helper} from "../Helper";

/**
 * @author Leo Fajardo
 */
class BillingCycleSelector extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);
    }

    render() {
        return (
            <ul className="fs-billing-cycles">
                {this.context.billingCycles.map(
                    billingCycle => {
                        let label = ('annual' === billingCycle) ?
                            'Annually' :
                            Helper.ucfirst(billingCycle);

                        return (
                            <li
                                className={this.context.selectedBillingCycle === billingCycle ? 'fs-selected-billing-cycle' : ''}
                                key={billingCycle} data-billing-cycle={billingCycle}
                                onClick={this.props.handler}>
                                {label} <span>{this.props.billingCycleDescription(billingCycle)}</span>
                            </li>
                        );
                    }
                )}
            </ul>
        );
    }
}

export default BillingCycleSelector;