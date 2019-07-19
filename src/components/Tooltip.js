import React, {Component} from 'react';
import Icon from "./Icon";

class Tooltip extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <span className="fs-tooltip">
                <Icon icon="question-circle"/>
            </span>
        );
    }
}

export default Tooltip;