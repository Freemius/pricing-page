import React, { Component } from 'react';
import PricingPage from './PricingPage';
import { Route } from 'react-router-dom';

class App extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <Route path="/" component={PricingPage} />
        );
    }
}

export default App;
