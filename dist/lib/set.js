/// <reference path="../typings/tsd.d.ts" />
"use strict";
var $ = require('jquery');
function set(state, options) {
    var val = options && options.val;
    var prepare = options && options.prepare;
    var prevent = options && options.prevent;
    var compare = options && options.compare;
    return function (evt) {
        var node = evt.currentTarget || evt.target;
        var value = val ? val(node) : typeof node.checked === 'boolean' ? node.checked : $(node).val();
        var parsed = prepare ? prepare(value) : value;
        if (prevent && prevent(parsed)) {
            evt.preventDefault();
        }
        else if (!compare || parsed !== state()) {
            state.set(parsed);
        }
    };
}
exports.set = set;
//# sourceMappingURL=set.js.map