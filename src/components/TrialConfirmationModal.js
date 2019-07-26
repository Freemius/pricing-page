import React, {Component} from 'react';
import FSPricingContext from "../FSPricingContext";

class TrialConfirmationModal extends Component {
    static contextType = FSPricingContext;

    constructor (props) {
        super(props);
    }

    render() {
        let plan   = this.context.pendingConfirmationTrialPlan,
            plugin = this.context.plugin;

        return (
            <div className="fs-modal fs-modal--trial-confirmation">
                <section className="fs-modal-content-container">
                    <header className="fs-modal-header">
                        <h3>Start Free Trial</h3>
                    </header>
                    <div className="fs-modal-content">
                        <p><strong>You are 1-click away from starting your {plan.trial_period}-day free trial of the {plan.title} plan.</strong></p>
                        <p>For compliance with the WordPress.org guidelines, before we start the trial we ask that you opt in with your user and non-sensitive site information, allowing the {plugin.type} to periodically send data to <a href="https://freemius.com" target="_blank">freemius.com</a> to check for version updates and to validate your trial.</p>
                    </div>
                    <div className="fs-modal-footer">
                        <button className="fs-button fs-button--close" onClick={this.props.cancelTrialHandler}>Cancel</button>
                        <button className="fs-button fs-button--primary fs-button--approve-trial" onClick={() => this.props.startTrialHandler(plan.id)}>Approve & Start Trial</button>
                    </div>
                </section>
            </div>
        );
    }
}

export default TrialConfirmationModal;