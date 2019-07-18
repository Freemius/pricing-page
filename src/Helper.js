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
        ucfirst: function(str) {
            return ('' != str) ?
                str.charAt(0).toUpperCase() + str.slice(1) :
                str;
        }
    };
})();