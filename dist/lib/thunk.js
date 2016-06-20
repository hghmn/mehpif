/// <reference path="../typings/tsd.d.ts" />
"use strict";
var diff = require('virtual-dom/diff');
var createElement = require('virtual-dom/create-element');
var patch = require('virtual-dom/patch');
var $ = require('jquery');
function addListeners(node, events) {
    var $el = $(node);
    events.forEach(function (e) {
        $el.on(e.events, e.selector, e.handler);
    });
}
function prepareHandler(handler, context) {
    // support "method" names
    if (typeof handler === 'string' && context && typeof context[handler] === 'function') {
        return context[handler].bind(context);
    }
    return handler;
}
function prepareEvents(eventSet, context) {
    return eventSet && Object.keys(eventSet).map(function (key) {
        var ix = key.indexOf(' ');
        var events = key;
        var selector = null;
        if (ix > 0) {
            events = key.substr(0, ix);
            selector = key.substr(ix + 1);
        }
        return {
            events: events,
            selector: selector,
            handler: prepareHandler(eventSet[key], context),
        };
    });
}
function thunk(state, dom, events) {
    throw new Error('unimplemented');
}
exports.thunk = thunk;
var ThunkView = (function () {
    function ThunkView(state) {
        this.state = state;
        var events = prepareEvents(this.events(), this);
        this.eventSet = events && events.length ? events : null;
    }
    ThunkView.prototype.events = function () {
        return null;
    };
    /// createElement and re-render when `state` changes
    /// returns the element
    ThunkView.prototype.host = function () {
        var _this = this;
        var animationFrameToken = 0;
        var tree = this.render(null);
        var el = createElement(tree, null);
        var render = function () {
            animationFrameToken = 0;
            var newTree = _this.render({ vnode: tree });
            var patches = diff(tree, newTree);
            patch(el, patches);
            tree = newTree;
        };
        var queueRender = function () {
            if (animationFrameToken) {
                return;
            }
            animationFrameToken = window.requestAnimationFrame(render);
        };
        this.dispose = this.state(queueRender);
        return el;
    };
    ThunkView.prototype.tree = function () {
        return this.render(this.previousTree);
    };
    ThunkView.prototype.render = function (previous) {
        var currentState = this.state();
        if (previous && previous.vnode && this.previousState === currentState) {
            //console.log('previous value is still good');
            return previous.vnode;
        }
        var result = this.dom(currentState);
        if (this.eventSet) {
            result.properties['thunk-view-hook'] = this;
        }
        // please don't make this necessary
        // ASSUMPTION: any (bad, very bad) changes to `state` during render are reflected in returned VTree
        this.previousState = this.state();
        this.previousTree = { vnode: result };
        return result;
    };
    ThunkView.prototype.hook = function (node, propertyName, previousValue) {
        addListeners(node, this.eventSet);
        console.log(this, 'hook', node, propertyName, previousValue);
    };
    ThunkView.prototype.unhook = function (node, propertyName, previousValue) {
        // FIXME off stuff
        console.log(this, 'unhook', node, propertyName, previousValue);
    };
    ThunkView.prototype.dispose = function () {
        // FIXME more, better life-cycle
    };
    return ThunkView;
}());
exports.ThunkView = ThunkView;
ThunkView.prototype.type = 'Thunk';
//# sourceMappingURL=thunk.js.map