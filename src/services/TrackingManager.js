import { Helper } from '../Helper';

/**
 * @author Leo Fajardo
 */
let _instance = null,
  _config = [],
  _ga = null;

function getInstance(config) {
  if (null !== _instance) {
    return _instance;
  }

  _config = config;

  _instance = {
    /**
     * Create path for tracking.
     *
     * @param {string} action
     *
     * @returns {string}
     */
    getTrackingPath: function (action) {
      let path =
        '/' +
        (_config.isProduction ? '' : 'local/') +
        // Page
        'pricing/' +
        // Page mode (dashboard, page).
        _config.pageMode +
        '/' +
        // plugin or theme.
        _config.type +
        '/' +
        // Module ID.
        _config.pluginID +
        '/' +
        (_config.isTrialMode && !_config.isPaidTrial
          ? ''
          : // Plan ID.
            'plan/all/' +
            // Billing cycle (monthly, annual, lifetime).
            'billing/' +
            _config.billingCycle +
            '/' +
            // Multi-site licenses quota.
            'licenses/all/');

      if (_config.isTrialMode) {
        path += (_config.isPaidTrial ? 'paid-trial' : 'trial') + '/';
      } else {
        path += 'buy/';
      }

      return path + action + '.html';
    },
    /**
     * Track pageview.
     *
     * @param {string} action
     */
    track: function (action) {
      if (Helper.isUndefinedOrNull(window.ga)) {
        return;
      }

      if (null === _ga) {
        _ga = window.ga;
        _ga('create', 'UA-59907393-2', 'auto');

        if (null !== _config.uid) {
          _ga('set', '&uid', _config.uid.toString());
        }
      }

      try {
        if (Helper.isNumeric(_config.userID)) {
          // Set user ID.
          _ga('set', 'userId', _config.userID);
        }

        _ga('send', {
          hitType: 'pageview',
          page: this.getTrackingPath(action),
        });
      } catch (error) {
        console.log(error);
      }
    },
  };

  return _instance;
}

export const TrackingManager = {
  getInstance: function (config) {
    return getInstance(config);
  },
};
