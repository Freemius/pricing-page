export const Helper = (function() {
    return {
        isNumeric: function(n) {
            return (
                (null != n) &&
                ! isNaN(n) &&
                ('' !== n)
            );
        },
        isNonEmptyString: function (val) {
            return (
                (typeof val === 'string' || val instanceof String) && val.trim().length > 0
            );
        },
        formatNumber: function(num) {
            return num.toLocaleString(undefined, {maximumFractionDigits:2});
        },
        ucfirst: function(str) {
            return ('' != str) ?
                str.charAt(0).toUpperCase() + str.slice(1) :
                str;
        }
    };
})();