import React, {Component} from 'react';

class Section extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <button className="fs-circle-button" type="button" role="button" tabIndex="0">
                <span></span>
            </button>
        );
    }
}

export default Section;