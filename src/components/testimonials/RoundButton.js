import React, { Component } from 'react';

/**
 * @author Leo Fajardo
 */
class Section extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <button
        className="fs-round-button"
        type="button"
        role="button"
        tabIndex="0"
      >
        <span></span>
      </button>
    );
  }
}

export default Section;
