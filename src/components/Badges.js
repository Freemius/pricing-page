import React, {Component} from 'react';

/**
 * @author Leo Fajardo
 */
class Badges extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <ul>
                {this.props.badges.map(badge => <li key={badge.key} className="fs-badge"><img src={badge.src} alt={badge.alt} /></li>)}
            </ul>
        );
    }
}

export default Badges;