import React, {Component} from 'react';
import {Helper} from "../Helper";

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
                {this.props.badges.map(
                    badge => {
                        let img = <img src={badge.src} alt={badge.alt} />;

                        if (Helper.isNonEmptyString(badge.link)) {
                            img = <a href={badge.link} target="_blank">{img}</a>;
                        }

                        return <li key={badge.key} className="fs-badge">{img}</li>;
                    }
                )}
            </ul>
        );
    }
}

export default Badges;