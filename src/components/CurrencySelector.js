import React, {Component} from 'react';
import FSPricingContext from "../FSPricingContext";

/**
 * @author Leo Fajardo
 */
class CurrencySelector extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);
    }

    render() {
        return (
            <select className="fs-currencies" onChange={this.props.handler} value={this.context.selectedCurrency}>
                {
                    this.context.currencies.map(
                        ( currency ) => {
                            return <option key={currency} value={currency}>{this.context.currencySymbols[currency]} - {currency.toUpperCase()}</option>
                        }
                    )
                }
            </select>
        );
    }
}

export default CurrencySelector;