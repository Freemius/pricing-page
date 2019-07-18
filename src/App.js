import React, { Component } from 'react';
import FreemiusPricingMain from './components/FreemiusPricingMain';
import { Route } from 'react-router-dom';

class App extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <Route path="/" component={FreemiusPricingMain} />
        );
    }
}

export default App;
