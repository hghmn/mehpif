/// <reference path="./observ.d.ts" />
import { thunk, ThunkView } from '../lib/thunk';
import { VNode, h } from 'virtual-dom';
import { IObservVarhash, IObservStruct } from '../lib/interfaces';
import ObservStruct = require('observ-struct');
import ObservVarhash = require('observ-varhash');

declare module "virtual-dom" {
    export function h(selector: string): VNode;
    export function h(selector: string, attributes: any): VNode;
}

interface ITodo {
    id: string;
    title: string;
    completed: boolean;
}

interface IState {
    todos: IObservVarhash<ITodo, IObservStruct<ITodo>>;
}

class From extends ThunkView<IState> {
    dom(state: IState) {
        return h('section.todoapp', [
            h('header.header', [
                h('h1', 'todos'),
                h('input.new-todo', {
                    placeholder: 'What needs to be done?',
                    autofocus: true
                })
            ])
            /* This section should be hidden by default and shown when there are todos */,
            h('section.main', [
                h('input.toggle-all', {
                    type: 'checkbox',
                }),
                h('label', {
                    htmlFor: 'toggle-all'
                }, 'Mark all as complete'),
                h('ul.todo-list', [
                    /* These are here just to show the structure of the list items */
                    /* List items should get the class 'editing' when editing and 'completed' when marked as completed */,
                    h('li.completed', [
                        h('.view', [
                            h('input.toggle', {
                                type: 'checkbox',
                                checked: true
                            }),
                            h('label', 'Taste JavaScript'),
                            h('button.destroy')
                        ]),
                        h('input.edit', {
                            value: 'Create a TodoMVC template',
                        })
                    ]),
                    h('li', [
                        h('.view', [
                            h('input.toggle', { type: 'checkbox' }),
                            h('label', 'Buy a unicorn'),
                            h('button.destroy')
                        ]),
                        h('input.edit', { value: 'Rule the web' })
                    ])
                ])
            ]),
            /* This footer should hidden by default and shown when there are todos */
            h('footer.footer', [
                /* This should be `0 items left` by default */,
                h('span.todo-count', [h('strong', '1'), ' item left'])
                /* Remove this if you don't implement routing */,
                h('ul.filters', [
                    h('li', [
                        h('a.selected', { href: '#/' }, 'All')
                    ]),
                    h('li', [
                        h('a', { href: '#/active' }, 'Active')
                    ]),
                    h('li', [
                        h('a', { href: '#/completed' }, 'Completed')
                    ])
                ])
                /* Hidden if no completed items are left ↓ */,
                h('button.clear-completed', 'Clear completed')
            ])
        ])
    }
}

declare const document: any;
(function(){
    const state: IState = {
        todos: ObservVarhash<ITodo, IObservStruct<ITodo>>({ }, ObservStruct),
    };
    const f = new From(ObservStruct(state));
    document.body.insertBefore(f.host(), document.body.firstChild);
}());
