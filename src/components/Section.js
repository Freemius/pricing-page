import React, {Component} from 'react';

/**
 * @author Leo Fajardo
 */
class Section extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <section className={`fs-section fs-section--${this.props['fs-section']}` + (this.props.className ? ' ' + this.props.className : '')}>{this.props.children}</section>
        );
    }
}

export default Section;