/// <reference path="../typings/tsd.d.ts" />

import diff = require('virtual-dom/diff')
import createElement = require('virtual-dom/create-element')
import patch = require('virtual-dom/patch')
import { IObservStruct } from './interfaces';
import $ = require('jquery');

// punt :(
export type VTree = any;

function addListeners(node: any, events: IEvent[]) {
    var $el = $(node);
    events.forEach(e => {
        $el.on(e.events as any, e.selector, e.handler);
    });
}


function prepareHandler(handler: any, context: any): Function {
    // support "method" names
    if (typeof handler === 'string' && context && typeof context[handler] === 'function') {
        return context[handler].bind(context);
    }

    return handler;
}

interface IEvent {
    events: string;
    selector: string;
    handler: Function;
}


function prepareEvents(eventSet: EventSet, context: any): IEvent[] {
    return eventSet && Object.keys(eventSet).map(key => {
        const ix = key.indexOf(' ');
        let events = key;
        let selector: string = null;
        if (ix > 0) {
            events = key.substr(0, ix);
            selector = key.substr(ix + 1);
        }
        return {
            events,
            selector,
            handler: prepareHandler(eventSet[key], context),
        };
    });
}

export function view<T>(state: IObservStruct<T>, dom: (state: T) => VTree, events?: EventSet): View<T> {
    return new SimpleView<T>(state, events, dom);
}

export type EventSet = {
    [evt: string]: Function | string;
};

export abstract class View<T> {
    private previousState: T;
    private previousTree: VTree;
    private eventSet: IEvent[];
    private needsHook: boolean;

    constructor(public state: IObservStruct<T>, eventsOverride?: EventSet) {
        const events = prepareEvents(eventsOverride || this.events(), this);
        this.eventSet = events && events.length ? events : null;
        this.needsHook = !!(
            this.eventSet ||
            this.onHook !== View.prototype.onHook ||
            this.onUnhook !== View.prototype.onUnhook);
    }

    abstract dom(state: T): VTree;
    events(): EventSet {
        return null;
    }

    /// createElement and re-render when `state` changes
    /// returns the element
    host() {
        let animationFrameToken = 0;
        const el = createElement(this.render(), null);

        const render = () => {
            animationFrameToken = 0;
            const previousTree = this.previousTree;
            const newTree = this.render();
            const patches = diff(previousTree, newTree);
            patch(el as any, patches);
            this.onAfterPatch();
        };

        const queueRender = () => {
            if (animationFrameToken) {
                return;
            }
            animationFrameToken = window.requestAnimationFrame(render);
        };

        this.dispose = this.state(queueRender);

        return el;
    }

    protected onAfterPatch(): void {
    }

    protected onHook(node: any): void {
    }

    protected onUnhook(node: any): void {
    }

    render(): VTree {
        const currentState = this.state();
        const previous = this.previousTree;
        if (previous && this.previousState === currentState) {
            //console.log('previous value is still good');
            return previous;
        }

        const result: any = this.dom(currentState);

        if (this.needsHook) {
            let hooks = result.hooks;
            if (!hooks) {
                result.hooks = hooks = {};
            }

            // monkey patch ourself into VNode hooks
            // virtual-dom expects hooks to already be present in properties passed to h/VNode#constructor
            hooks.mehpif = this;
            result.properties.mehpif = this;

            // TODO try to live without this one
            //result.descendantHooks = true;
        }

        // please don't make this necessary
        // ASSUMPTION: any (bad, very bad) changes to `state` during render are reflected in returned VTree
        this.previousState = this.state();
        this.previousTree = result;

        return result;
    }

    private hook(node: any, propertyName: any, previousValue: any): void {
        addListeners(node, this.eventSet);
        this.onHook(node);
        //console.log(this, 'hook', node, propertyName, previousValue);
    }

    private unhook(node: any, propertyName: any, previousValue: any): void {
        // FIXME off stuff
        this.onUnhook(node);
        //console.log(this, 'unhook', node, propertyName, previousValue);
    }

    public dispose() {
        // FIXME more, better life-cycle
    }
}

class SimpleView<T> extends View<T> {
    constructor (state: IObservStruct<T>, eventsOverride: EventSet, dom: (state: T) => VTree) {
        super(state, eventsOverride);
        this.dom = dom;
    }
    dom(state: T): VTree {
        return null;
    }
}
