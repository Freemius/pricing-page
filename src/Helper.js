export const Helper = (function () {
  return {
    inArray: function (val, arr) {
      return -1 !== arr.indexOf(val);
    },
    isNumeric: function (n) {
      return null != n && !isNaN(parseFloat(n)) && '' !== n;
    },
    isNonEmptyString: function (val) {
      return (
        (typeof val === 'string' || val instanceof String) &&
        val.trim().length > 0
      );
    },
    isUndefinedOrNull: function (val) {
      return typeof val === 'undefined' || val === null;
    },
    formatNumber: function (num, locale) {
      return num.toLocaleString(locale ? locale : undefined, {
        maximumFractionDigits: 2,
      });
    },
    ucfirst: function (str) {
      return '' != str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
    },
    formatFraction: function (num) {
      if (!num) return '00';

      if (num.toString().length >= 2) return num;

      return num + '0';
    },
  };
})();
