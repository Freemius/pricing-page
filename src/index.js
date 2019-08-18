import './public-path'
import React from 'react';
import ReactDOM from 'react-dom';
import {FSPricingProvider} from "./FSPricingContext";
import FreemiusPricing from './PricingPage';
import uniqueid from 'uniqueid';

let FreemiusLib = null;

export default {
    config: function(config) {
        FreemiusLib = config;
    },
    widgets: {
        pricing: {
            new: (config) => {
                let uid = uniqueid('widget_freemius_');

                console.log("wconfig", config);

                return {
                    render: (args) => {
                        ReactDOM.render(
                            <FSPricingProvider value={config.pricing}>
                                <FreemiusPricing
                                    pricing_endpoint_url={config.pricing_endpoint_url}
                                />,
                            </FSPricingProvider>,
                            document.querySelector(config.selector)
                        );
                    }
                }
            }
        }
    }
}