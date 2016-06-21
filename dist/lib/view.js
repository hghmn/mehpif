/// <reference path="../typings/tsd.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
function view(state, dom, events) {
    return new SimpleView(state, events, dom);
}
exports.view = view;
var View = (function () {
    function View(state, eventsOverride) {
        this.state = state;
        var events = prepareEvents(eventsOverride || this.events(), this);
        this.eventSet = events && events.length ? events : null;
        this.needsHook = !!(this.eventSet ||
            this.onHook !== View.prototype.onHook ||
            this.onUnhook !== View.prototype.onUnhook);
    }
    View.prototype.events = function () {
        return null;
    };
    /// createElement and re-render when `state` changes
    /// returns the element
    View.prototype.host = function () {
        var _this = this;
        var animationFrameToken = 0;
        var el = createElement(this.render(), null);
        var render = function () {
            animationFrameToken = 0;
            var previousTree = _this.previousTree;
            var newTree = _this.render();
            var patches = diff(previousTree, newTree);
            patch(el, patches);
            _this.onAfterPatch();
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
    View.prototype.onAfterPatch = function () {
    };
    View.prototype.onHook = function (node) {
    };
    View.prototype.onUnhook = function (node) {
    };
    View.prototype.render = function () {
        var currentState = this.state();
        var previous = this.previousTree;
        if (previous && this.previousState === currentState) {
            //console.log('previous value is still good');
            return previous;
        }
        var result = this.dom(currentState);
        if (this.needsHook) {
            var hooks = result.hooks;
            if (!hooks) {
                result.hooks = hooks = {};
            }
            // monkey patch ourself into VNode hooks
            // virtual-dom expects hooks to already be present in properties passed to h/VNode#constructor
            hooks.mehpif = this;
            result.properties.mehpif = this;
        }
        // please don't make this necessary
        // ASSUMPTION: any (bad, very bad) changes to `state` during render are reflected in returned VTree
        this.previousState = this.state();
        this.previousTree = result;
        return result;
    };
    View.prototype.hook = function (node, propertyName, previousValue) {
        addListeners(node, this.eventSet);
        this.onHook(node);
        //console.log(this, 'hook', node, propertyName, previousValue);
    };
    View.prototype.unhook = function (node, propertyName, previousValue) {
        // FIXME off stuff
        this.onUnhook(node);
        //console.log(this, 'unhook', node, propertyName, previousValue);
    };
    View.prototype.dispose = function () {
        // FIXME more, better life-cycle
    };
    return View;
}());
exports.View = View;
var SimpleView = (function (_super) {
    __extends(SimpleView, _super);
    function SimpleView(state, eventsOverride, dom) {
        _super.call(this, state, eventsOverride);
        this.dom = dom;
    }
    SimpleView.prototype.dom = function (state) {
        return null;
    };
    return SimpleView;
}(View));
//# sourceMappingURL=view.js.map