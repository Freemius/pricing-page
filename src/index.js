import './public-path'
import React from 'react';
import ReactDOM from 'react-dom';
import FreemiusPricingMain from './components/FreemiusPricingMain';
import './assets/js/fontawesome';

let FSConfig = null,
    pricing  = {
        new: (config) => {
            FSConfig = config;

            ReactDOM.render(
                <FreemiusPricingMain />,
                document.querySelector(config.selector)
            );
        }
    };

export {pricing, FSConfig};