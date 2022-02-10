import React, {Component} from 'react';
import Icon from "./Icon";

/**
 * @author Leo Fajardo
 */
class Tooltip extends Component {
    constructor (props) {
        super(props);
    }

    /**
     * @author Xiaheng Chen
     * 
     * @returns {string}
     */
    tooltipPositionClass() {
        const direction = this.props.direction;

        return direction ? `fs-tooltip-message--${direction}` : 'fs-tooltip-message--right';
    }

    render() {
        return (
            <span className="fs-tooltip">
                <Icon icon="question-circle"/>
                <span className={`fs-tooltip-message ${this.tooltipPositionClass()}`}>{this.props.children}</span>
            </span>
        );
    }
}

export default Tooltip;