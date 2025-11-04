import React, { Component } from 'react';
import { Helper } from '../Helper';

/**
 * @author Leo Fajardo
 */
class Badges extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ul className="fs-badges">
        {this.props.badges.map(badge => {
          let img = (
            <img
              src={badge.src}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
            />
          );

          if (Helper.isNonEmptyString(badge.link)) {
            img = (
              <a href={badge.link} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            );
          }

          return (
            <li key={badge.key} className="fs-badges__item">
              {img}
            </li>
          );
        })}
      </ul>
    );
  }
}

export default Badges;
