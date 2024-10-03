import React, { Component } from 'react';
import { Helper } from '../../Helper';

import './style.scss';

/**
 * @author Leo Fajardo
 */
class Loader extends Component {
  constructor(props) {
    super(props);
  }

  getFSSdkLoaderBar() {
    return (
      <div className="fs-ajax-loader">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`fs-ajax-loader-bar fs-ajax-loader-bar-${i + 1}`}
          ></div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className="fs-modal fs-modal--loading" {...this.props}>
        <section className="fs-modal-content-container">
          <div className="fs-modal-content">
            {Helper.isNonEmptyString(this.props.title) && (
              <span>{this.props.title}</span>
            )}
            {this.props.isEmbeddedDashboardMode ? (
              this.getFSSdkLoaderBar()
            ) : (
              <i></i>
            )}
          </div>
        </section>
      </div>
    );
  }
}

export default Loader;
