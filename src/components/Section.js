import React, {Component} from 'react';

class Section extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <section className={`fs-section fs-section-${this.props['fs-section']}`}>{this.props.children}</section>
        );
    }
}

export default Section;