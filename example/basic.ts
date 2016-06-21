/// <reference path="./observ.d.ts" />

import { View, set, EventSet } from '../lib';
import { VNode, h } from 'virtual-dom';
import { IObservVarhash, IObservStruct, IVarhash, IObserv } from '../lib/interfaces';
import Observ = require('observ');
import ObservStruct = require('observ-struct');
import ObservVarhash = require('observ-varhash');
import uuid = require('uuid');
import $ = require('jquery');

declare module "virtual-dom" {
    export function h(selector: string): VNode;
    export function h(selector: string, attributes: any): VNode;
}

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

// TODO always remove items with empty title
interface ITodo {
    id?: string;
    title: string;
    completed?: boolean;
    editing?: boolean;
}

enum Filter {
    all = 0,
    active,
    completed,
}

interface IState {
    todos: IObservVarhash<ITodo, IObservStruct<ITodo>>;
    filter: IObserv<Filter>,
}

function forEach<T>(hash: IVarhash<T>, selector: (value: T, key: string) => void): void {
    const keys = Object.keys(hash);
    for (let i = 0; i < keys.length; i++) {
        selector(hash[keys[i]], keys[i]);
    }
}

class Todo extends View<ITodo> {
    events(): EventSet {
        return {
            'click .toggle': set<ITodo>(this.state, { prepare: completed => this.copy({ completed }) }),
            'click .destroy': () => this.set({ title: null }), // false-y will cause delete
			'dblclick label': () => this.set({ editing: true }), // FIXME focus
			'keypress .edit': 'updateOnEnter',
			'keydown .edit': 'revertOnEscape',
			'blur .edit': 'close',
        };
    }

    dom(state: ITodo) {
        let tag = 'li';
        if (state.editing) {
            tag += '.editing';
        }
        if (state.completed) {
            tag += '.completed';
        }

        return h(tag, { key: state.id }, [
            h('.view', [
                h('input.toggle', {
                    type: 'checkbox',
                    checked: state.completed,
                }),
                h('label', state.title),
                h('button.destroy', { dataset: { id: state.id } })
            ]),
            h('input.edit', {
                value: state.title,
                //autofocus: !!state.editing, // FIXME focus
            })
        ]);
    }

    // Close the `"editing"` mode, saving changes to the todo.
    close(e) {
        const title = $(e.target).val().trim();
        this.set({ title, editing: false });
    }

    // If you hit `enter`, we're through editing the item.
    updateOnEnter(e) {
        if (e.which === ENTER_KEY) {
            this.close(e);
        }
    }

    // If you're pressing `escape` we revert your change by simply leaving
    // the `editing` state.
    revertOnEscape(e) {
        if (e.which === ESCAPE_KEY) {
            this.set({ editing: false });
        }
    }

    private copy(val: any): ITodo {
        return (Object as any).assign({}, this.state(), val);
    }

    private set(val: any): void {
        this.state.set(this.copy(val));
    }
}

class App extends View<IState> {
    children: IVarhash<Todo> = {};

    constructor(state: IObservStruct<IState>) {
        super(state);
        forEach(state.todos(), (todo, key) => this.children[key] = new Todo(state.todos.get(key)));

        // watch for todos without titles and delete them
        state.todos(() => {
            forEach(this.state.todos(), (todo, key) => {
                if (!todo.title) {
                    this.deleteTodo(key);
                }
            });
        });
    }

    events(): EventSet {
        return {
            'keypress .new-todo': 'createOnEnter',
            'click .clear-completed': 'clearCompleted',
            'click .toggle-all': 'toggleAllComplete'
        };
    }

    dom(state: IState) {
        const keys = Object.keys(state.todos);
        const completed = keys.reduce((sum, key) => sum + (state.todos[key].completed ? 1 : 0), 0);
        const remaining = keys.length - completed;
        const any = keys.length || null;
        const currentFilter = state.filter as any as Filter; // :(
        const match =
            currentFilter === Filter.completed ? (child => child.state().completed ? child.tree() : null) :
            currentFilter === Filter.active ? (child => !child.state().completed ? child.tree() : null) :
            child => child.tree();
        const filter = (val, href: string, title: string) =>
            h('li',
                h(val === state.filter ? 'a.selected' : 'a', { href }, title));

        return h('section.todoapp', [
            h('header.header', [
                h('h1', 'todos'),
                h('input.new-todo', {
                    placeholder: 'What needs to be done?',
                    autofocus: true
                })
            ])
            /* This section should be hidden by default and shown when there are todos */,
            any && h('section.main', [
                h('input.toggle-all', { type: 'checkbox', checked: completed === keys.length }),
                h('label', { htmlFor: 'toggle-all' }, 'Mark all as complete'),
                h('ul.todo-list', Object.keys(state.todos).map(key => match(this.getChild(key))))
            ]),
            /* This footer should hidden by default and shown when there are todos */
            any && h('footer.footer', [
                /* This should be `0 items left` by default */,
                h('span.todo-count', [h('strong', remaining.toString()), remaining === 1 ? ' item left' : ' items left'])
                /* Remove this if you don't implement routing */,
                h('ul.filters', [
                    filter(Filter.all, '#/', 'All'),
                    filter(Filter.active, '#/active', 'Active'),
                    filter(Filter.completed, '#/completed', 'Completed'),
                ])
                /* Hidden if no completed items are left ↓ */,
                completed ? h('button.clear-completed', 'Clear completed') : null
            ])
        ])
    }

    getChild(key: string): Todo {
        let child = this.children[key];
        if (!child) {
            this.children[key] = child = new Todo(this.state.todos.get(key));
        }
        return child;
    }

    deleteTodo(id: string) {
        delete this.children[id];
        this.state.todos.delete(id);
    }

    // If you hit return in the main input field, create new **Todo**
    // FIXME persisting it to *localStorage*. 
    createOnEnter(e: any) {
        if (e.which !== ENTER_KEY) {
            return;
        }
        const $input = $(e.target);
        const title = $input.val().trim();
        if (title) {
            this.state.todos.put(uuid.v4(), { title, completed: false });
            $input.val('');
        }
    }

    // Clear all completed todo items, destroying their models.
    clearCompleted() {
        Object.keys(this.state.todos).forEach(key => {
            if (this.state.todos.get(key)().completed) {
                this.deleteTodo(key);
            }
        });

        return false;
    }

    toggleAllComplete(e) {
        const completed = e.target.checked;
        forEach<IObservStruct<ITodo>>(
            this.state.todos as any,
            todo => todo.set((Object as any).assign({}, todo(), { completed })));
    }

    changeFilter(fragment: string) {
        this.state.filter.set(
            fragment === '#/completed' ? Filter.completed :
            fragment === '#/active' ? Filter.active :
            Filter.all);
    }
}

declare const document: any;
(function(){
    const todos: IVarhash<ITodo> = { };
    todos[uuid.v4()] = {
        title: 'mehpif persistence',
        completed: true,
    };
    todos[uuid.v4()] = {
        title: 'Buy a dragon',
        completed: false,
    };
    const createValue = (todo: ITodo, id: string) => {
        if (!todo.id) {
            todo.id = id || uuid.v4();
        }
        return ObservStruct(todo);
    };

    const state = ObservStruct({
        todos: ObservVarhash<ITodo, IObservStruct<ITodo>>(todos, createValue),
        filter: Observ(Filter.all),
    });
    state(console.log.bind(console, 'state'));
    const f = new App(state);
    const changeFilter = () => f.changeFilter(location.hash);
    changeFilter();
    $(window).on('hashchange', changeFilter);
    document.body.insertBefore(f.host(), document.body.firstChild);
}());
