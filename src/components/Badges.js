import React, {Component} from 'react';

class Badges extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        return (
            <ul>
                {this.props.badges.map(badge => <li key={badge.key} className="fs-badge"><img src={badge.url} alt={badge.alt} /></li>)}
            </ul>
        );
    }
}

export default Badges;