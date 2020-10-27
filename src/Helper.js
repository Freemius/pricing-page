export const Helper = (function() {
    return {
        inArray: function(val, arr) {
            return (-1 !== arr.indexOf(val));
        },
        isNumeric: function(n) {
            return (
                (null != n) &&
                ! isNaN(parseFloat(n)) &&
                ('' !== n)
            );
        },
        isNonEmptyString: function (val) {
            return (
                (typeof val === 'string' || val instanceof String) && val.trim().length > 0
            );
        },
        isUndefinedOrNull: function(val) {
            return (typeof val === 'undefined' || val === null);
        },
        formatNumber: function(num, countryCode) {
            return num.toLocaleString(countryCode ? countryCode : undefined, {maximumFractionDigits:2});
        },
        ucfirst: function(str) {
            return ('' != str) ?
                str.charAt(0).toUpperCase() + str.slice(1) :
                str;
        }
    };
})();