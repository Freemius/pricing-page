import {RequestManager} from "./RequestManager";

/**
 * @author Leo Fajardo
 */
let _instance = null;

function getInstance() {
    if (null !== _instance) {
        return _instance;
    }

    _instance = {
        redirect: function(baseUrl, params) {
            if (params) {
                if (-1 === baseUrl.indexOf('?')) {
                    baseUrl += '?';
                } else {
                    baseUrl += '&';
                }

                baseUrl += RequestManager.getInstance().buildQueryString(params);
            }

            window.location.href = baseUrl;
        }
    };

    return _instance;
}

export const PageManager = {
    getInstance: function() {
        return getInstance();
    }
};