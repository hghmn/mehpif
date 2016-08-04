/// <reference path="../typings/tsd.d.ts" />

import $ = require('jquery');

export interface ISetOptions<T> {
    /// get value from dom node
    val?: (node: any) => any;
    /// prepare value into suitable form
    prepare?: (value: any) => T;
    /// prevent event
    prevent?: (value: T) => boolean;
    /// only invoke set when new value is not strictly equal to old value
    compare?: boolean;
}

export function set<T>(state: { set: (value: T) => void, (): T }, options?: ISetOptions<T>) {
    const val = options && options.val;
    const prepare = options && options.prepare;
    const prevent = options && options.prevent;
    const compare = options && options.compare;

    return function(evt: any) {
        const node = evt.currentTarget || evt.target;
        const value = val ? val(node) : node.type === 'checkbox' ? node.checked : $(node).val();
        const parsed = prepare ? prepare(value) : value;
        if (prevent && prevent(parsed)) {
            evt.preventDefault();
        } else if (!compare || parsed !== state()) {
            state.set(parsed);
        }
    };
}
