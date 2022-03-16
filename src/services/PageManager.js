import { RequestManager } from './RequestManager';
import { Helper } from '../Helper';
import { FSConfig } from '../index';
import { FS } from '../postmessage';

/**
 * @author Leo Fajardo
 */
let _instance = null;

function getInstance() {
  if (null !== _instance) {
    return _instance;
  }

  _instance = {
    addQueryArgs: function (baseUrl, params) {
      if (!Helper.isNonEmptyString(baseUrl)) {
        return baseUrl;
      }

      if (params) {
        if (-1 === baseUrl.indexOf('?')) {
          baseUrl += '?';
        } else {
          baseUrl += '&';
        }

        baseUrl += RequestManager.getInstance().buildQueryString(params);
      }

      return baseUrl;
    },
    getContactUrl(plugin, topic) {
      let contactUrl = Helper.isNonEmptyString(FSConfig.contact_url)
        ? FSConfig.contact_url
        : FS.PostMessage.parent_url();

      if (!Helper.isNonEmptyString(contactUrl)) {
        let isProduction =
          -1 === ['3000', '8080'].indexOf(window.location.port);

        contactUrl =
          (isProduction
            ? 'https://wp.freemius.com'
            : 'http://wp.freemius:8080') +
          `/contact/?page=${plugin.slug}-contact&plugin_id=${plugin.id}&plugin_public_key=${plugin.public_key}`;
      }

      return this.addQueryArgs(contactUrl, { topic: topic });
    },
    getQuerystringParam: function (url, key) {
      // Parse anchor.
      let anchor = '';
      let anchor_pos = url.indexOf('#');

      if (-1 < anchor_pos) {
        anchor = url.substr(anchor_pos);
        url = url.substr(0, anchor_pos);
      }

      // Parse query string.
      let query = '';
      let query_pos = url.indexOf('?');

      if (-1 < query_pos) {
        query = url.substr(query_pos + 1);
        url = url.substr(0, query_pos);
      }

      if ('' !== query) {
        let query_params = query.split('&');

        for (let i = 0, len = query_params.length; i < len; i++) {
          let param = query_params[i].split('=', 2);

          if (param.length > 0) {
            if (key == param[0]) {
              return param[1];
            }
          }
        }
      }

      return null;
    },
    redirect: function (baseUrl, params) {
      window.location.href = this.addQueryArgs(baseUrl, params);
    },
  };

  return _instance;
}

export const PageManager = {
  getInstance: function () {
    return getInstance();
  },
};
