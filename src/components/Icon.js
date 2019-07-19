import React, {Component} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Icon extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <span className="fs-icon">
                <FontAwesomeIcon {...this.props} />
            </span>
        );
    }
}

export default Icon;