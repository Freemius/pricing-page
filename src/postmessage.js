import './nojquery.ba-postmessage';
import { Helper } from './Helper';

let _FS = null;

(function (undef) {
  let global = this || {};

  // Namespace.
  global.FS = global.FS || {};

  _FS = global.FS;

  if (null == global.FS.PostMessage) {
    global.FS.PostMessage = (function () {
      let _isChild = false,
        _isChildInitialized = false,
        // eslint-disable-next-line no-undef
        _postman = new NoJQueryPostMessageMixin(
          'postMessage',
          'receiveMessage'
        ),
        _callbacks = {},
        _baseUrl,
        _parentUrl,
        _parentSubdomain,
        _hasParent = false,
        _initParentUrl = function (parentUrl) {
          _parentUrl = parentUrl;
          _parentSubdomain = parentUrl.substring(
            0,
            parentUrl.indexOf(
              '/',
              'https://' === parentUrl.substring(0, 'https://'.length) ? 8 : 7
            )
          );
          _hasParent = '' !== parentUrl;
        },
        _init = function () {
          _postman.receiveMessage(function (e) {
            let data;

            try {
              if (
                null != e &&
                e.origin &&
                (e.origin.indexOf('js.stripe.com') > 0 ||
                  e.origin.indexOf('www.paypal.com') > 0)
              ) {
                return;
              }

              data = Helper.isNonEmptyString(e.data)
                ? JSON.parse(e.data)
                : e.data;

              if (_callbacks[data.type]) {
                for (let i = 0; i < _callbacks[data.type].length; i++) {
                  // Execute type callbacks.
                  _callbacks[data.type][i](data.data);
                }
              }
            } catch (err) {
              console.error('FS.PostMessage.receiveMessage', err.message);
              console.log(e.data);
            }
          }, _baseUrl);
        },
        _prevHeight = -1;

      let _isIframe = true;

      try {
        _isIframe = window.self !== window.top;
      } catch (e) {}

      if (_isIframe) {
        _initParentUrl(
          decodeURIComponent(document.location.hash.replace(/^#/, ''))
        );
      }

      return {
        init: function (url, iframes) {
          _baseUrl = url;

          _init();

          // Automatically receive forward messages.
          FS.PostMessage.receiveOnce('forward', function (data) {
            window.location = data.url;
          });

          iframes = iframes || [];

          if (iframes.length > 0) {
            window.addEventListener('scroll', function () {
              for (var i = 0; i < iframes.length; i++) {
                FS.PostMessage.postScroll(iframes[i]);
              }
            });
          }
        },
        /**
         * @param {string} [parentUrl]
         */
        init_child: function (parentUrl) {
          if (parentUrl) {
            _initParentUrl(parentUrl);
          }

          this.init(_parentSubdomain);

          _isChild = true;
          _isChildInitialized = true;

          // Post height of a child right after window is loaded.
          window.addEventListener('load', function () {
            FS.PostMessage.postHeight();

            // Post message that window was loaded.
            FS.PostMessage.post('loaded');
          });

          // Post height of a child on window resize.
          window.addEventListener('resize', function () {
            FS.PostMessage.postHeight();

            // Post message that window was loaded.
            FS.PostMessage.post('resize');
          });
        },
        hasParent: function () {
          return _hasParent;
        },
        getElementAbsoluteHeight: function (el) {
          let styles = window.getComputedStyle(el),
            margin =
              parseFloat(styles['marginTop']) +
              parseFloat(styles['marginBottom']);

          return Math.ceil(el.offsetHeight + margin);
        },
        postHeight: function (diff, wrapper) {
          // alert(wrapper);
          diff = diff || 0;
          wrapper = document.getElementById(
            wrapper || 'fs_pricing_page_container'
          );

          if (!wrapper) {
            wrapper = document.getElementsByTagName('html')[0];
          }

          var newHeight = diff + this.getElementAbsoluteHeight(wrapper);

          if (newHeight == _prevHeight) {
            // Don't post if height didn't change.
            return false;
          }

          this.post('height', {
            height: newHeight,
          });

          _prevHeight = newHeight;

          return true;
        },
        postScroll: function (iframe) {
          let html = window.getComputedStyle(
            document.getElementsByTagName('html')[0]
          );

          var doc = document.documentElement;
          var left =
            (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
          var top =
            (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

          this.post(
            'scroll',
            {
              top: top,
              height:
                window.innerHeight -
                parseFloat(html.getPropertyValue('padding-top')) -
                parseFloat(html.getPropertyValue('margin-top')),
            },
            iframe
          );
        },
        post: function (type, data, iframe) {
          console.debug('PostMessage.post', type);

          if (iframe) {
            // Post to iframe.
            _postman.postMessage(
              JSON.stringify({
                type: type,
                data: data,
              }),
              iframe.src,
              iframe.contentWindow
            );
          } else {
            // Post to parent.
            _postman.postMessage(
              JSON.stringify({
                type: type,
                data: data,
              }),
              _parentUrl,
              window.parent
            );
          }
        },
        receive: function (type, callback) {
          console.debug('PostMessage.receive', type);

          if (null == _callbacks[type]) _callbacks[type] = [];

          _callbacks[type].push(callback);
        },
        receiveOnce: function (type, callback, flush) {
          flush = undef === flush ? false : flush;

          if (flush) this.unset(type);

          if (this.is_set(type)) return;

          this.receive(type, callback);
        },
        // Check if any callbacks assigned to a specified message type.
        is_set: function (type) {
          return null != _callbacks[type];
        },
        /**
         * Removes callbacks assigned to a specified message type.
         *
         * @author Leo Fajardo
         *
         * @param {string} type
         */
        unset: function (type) {
          _callbacks[type] = null;
        },
        parent_url: function () {
          return _parentUrl;
        },
        parent_subdomain: function () {
          return _parentSubdomain;
        },
        isChildInitialized: function () {
          return _isChildInitialized;
        },
      };
    })();
  }
})();

export const FS = _FS;
