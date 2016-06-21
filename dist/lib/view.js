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
    return new SimpleView(state, { dom: dom, events: events });
}
exports.view = view;
var View = (function () {
    function View(state) {
        this.state = state;
        var events = prepareEvents(this.events(), this);
        this.eventSet = events && events.length ? events : null;
    }
    View.prototype.events = function () {
        return null;
    };
    /// createElement and re-render when `state` changes
    /// returns the element
    View.prototype.host = function () {
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
    View.prototype.tree = function () {
        return this.render(this.previousTree);
    };
    View.prototype.render = function (previous) {
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
    View.prototype.hook = function (node, propertyName, previousValue) {
        addListeners(node, this.eventSet);
        console.log(this, 'hook', node, propertyName, previousValue);
    };
    View.prototype.unhook = function (node, propertyName, previousValue) {
        // FIXME off stuff
        console.log(this, 'unhook', node, propertyName, previousValue);
    };
    View.prototype.dispose = function () {
        // FIXME more, better life-cycle
    };
    return View;
}());
exports.View = View;
var SimpleView = (function (_super) {
    __extends(SimpleView, _super);
    function SimpleView(state, options) {
        _super.call(this, state);
        this.options = options;
    }
    SimpleView.prototype.dom = function (state) {
        return this.options.dom(state);
    };
    SimpleView.prototype.events = function () {
        return this.options.events;
    };
    return SimpleView;
}(View));
//# sourceMappingURL=view.js.map