import React, {Component} from 'react';
import Icon from "./Icon";

/**
 * @author Leo Fajardo
 */
class Tooltip extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <span className="fs-tooltip">
                <Icon icon="question-circle"/>
                <span className="fs-tooltip-message">{this.props.children}</span>
            </span>
        );
    }
}

export default Tooltip;