import { Helper } from '../Helper';
import { FSConfig } from '../index';
import { PageManager } from './PageManager';

/**
 * @author Leo Fajardo
 */
let _instance = null;

function getInstance() {
  if (null !== _instance) {
    return _instance;
  }

  _instance = {
    /**
     * @param {object} data
     *
     * @return {string} e.g.: param1=value1&param2=value2.
     */
    buildQueryString: function (data) {
      const params = [];

      for (let key in data) {
        if (!data.hasOwnProperty(key)) {
          continue;
        }

        params.push(
          encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
        );
      }

      return params.join('&');
    },
    /**
     * @param {string} url
     * @param {object} data
     *
     * @return {Promise}
     */
    request: function (url, data) {
      data = { ...data, ...FSConfig };

      return fetch(PageManager.getInstance().addQueryArgs(url, data), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => {
        // Parse JSON response into native JavaScript object.
        let jsonResponse = response.json();

        if (
          jsonResponse.success &&
          Helper.isNonEmptyString(jsonResponse.next_page)
        ) {
          // If the next page's URL is returned, redirect to that page.
          window.location.href = jsonResponse.next_page;
        }

        return jsonResponse;
      });
    },
  };

  return _instance;
}

export const RequestManager = {
  getInstance: function () {
    return getInstance();
  },
};
