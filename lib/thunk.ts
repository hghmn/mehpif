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

export function thunk<T>(state: IObservStruct<T>, dom: (state: T) => VTree, events?: EventSet) {
    throw new Error('unimplemented');
}

export type EventSet = {
    [evt: string]: Function | string;
};

export abstract class ThunkView<T> {
    private previousState: T;
    private previousTree: { vnode: VTree };
    private eventSet: IEvent[];

    constructor(public state: IObservStruct<T>) {
        const events = prepareEvents(this.events(), this);
        this.eventSet = events && events.length ? events : null;
    }

    abstract dom(state: T): VTree;
    events(): EventSet {
        return null;
    }

    /// createElement and re-render when `state` changes
    /// returns the element
    host() {
        let animationFrameToken = 0;
        let tree = this.render(null);
        const el = createElement(tree as any, null);

        const render = () => {
            animationFrameToken = 0;
            const newTree = this.render({ vnode: tree });
            const patches = diff(tree, newTree);
            patch(el as any, patches);
            tree = newTree;
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

    tree(): VTree {
        return this.render(this.previousTree);
    }


    private render(previous: { vnode: VTree }): VTree {
        const currentState = this.state();
        if (previous && previous.vnode && this.previousState === currentState) {
            //console.log('previous value is still good');
            return previous.vnode;
        }

        const result = this.dom(currentState);

        if (this.eventSet) {
            (result as any).properties['thunk-view-hook'] = this;
        }

        // please don't make this necessary
        // ASSUMPTION: any (bad, very bad) changes to `state` during render are reflected in returned VTree
        this.previousState = this.state();
        this.previousTree = { vnode: result };

        return result;
    }

    private hook(node: any, propertyName: any, previousValue: any): void {
        addListeners(node, this.eventSet);
        console.log(this, 'hook', node, propertyName, previousValue);
    }

    private unhook(node: any, propertyName: any, previousValue: any): void {
        // FIXME off stuff
        console.log(this, 'unhook', node, propertyName, previousValue);
    }

    public dispose() {
        // FIXME more, better life-cycle
    }
}
