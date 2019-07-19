export const Helper = (function() {
    return {
        isNumeric: function(n) {
            return (
                (null != n) &&
                ! isNaN(n) &&
                ('' !== n)
            );
        },
        isString: function (val) {
            return (typeof val === 'string' || val instanceof String);
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