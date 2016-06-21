/// <reference path="./observ.d.ts" />

import { thunk, ThunkView, set, EventSet } from '../lib';
import { VNode, h } from 'virtual-dom';
import { IObservVarhash, IObservStruct, IVarhash } from '../lib/interfaces';
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

interface IState {
    todos: IObservVarhash<ITodo, IObservStruct<ITodo>>;
}

function map<T, TOut>(hash: IVarhash<T>, selector: (value: T, key: string) => TOut): TOut[] {
    return Object.keys(hash).map(key => selector(hash[key], key));
}

class Todo extends ThunkView<ITodo> {
    events(): EventSet {
        return {
            'click .toggle': set<ITodo>(this.state, { prepare: completed => this.copy({ completed }) }),
			'dblclick label': evt => {
                this.set({ editing: true });
                //debugger;
                //$(evt.target).closest('li').find('.edit').focus();
            },
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
                //autofocus: !!state.editing, // FIXME
            })
        ]);
    }

    private copy(val: any): ITodo {
        return (Object as any).assign({}, this.state(), val);
    }

    private set(val: any): void {
        this.state.set(this.copy(val));
    }


    // Switch this view into `"editing"` mode, displaying the input field.
    edit(e) {
        //this.$el.addClass('editing');
        //this.$input.focus();
    }

    // Close the `"editing"` mode, saving changes to the todo.
    close() {
        //var value = this.$input.val();
        //var trimmedValue = value.trim();

        //// We don't want to handle blur events from an item that is no
        //// longer being edited. Relying on the CSS class here has the
        //// benefit of us not having to maintain state in the DOM and the
        //// JavaScript logic.
        //if (!this.$el.hasClass('editing')) {
        //    return;
        //}

        //if (trimmedValue) {
        //    this.model.save({ title: trimmedValue });
        //} else {
        //    this.clear();
        //}

        //this.$el.removeClass('editing');
    }

    // If you hit `enter`, we're through editing the item.
    updateOnEnter(e) {
        //if (e.which === ENTER_KEY) {
        //    this.close();
        //}
    }

    // If you're pressing `escape` we revert your change by simply leaving
    // the `editing` state.
    revertOnEscape(e) {
        //if (e.which === ESC_KEY) {
        //    this.$el.removeClass('editing');
        //    // Also reset the hidden input back to the original value.
        //    this.$input.val(this.model.get('title'));
        //}
    }

    // Remove the item, destroy the model from *localStorage* and delete its view.
    clear() {
        //this.model.destroy();
    }
}

class App extends ThunkView<IState> {
    children: IVarhash<Todo> = {};

    constructor(state: IObservStruct<IState>) {
        super(state);
        Object.keys(state.todos()).forEach(key => this.children[key] = new Todo(state.todos.get(key)));
    }

    events(): EventSet {
        return {
            'click .destroy': (evt: any) => this.deleteTodo(evt.target.dataset.id),
            'keypress .new-todo': 'createOnEnter',
            'click .clear-completed': 'clearCompleted',
            'click .toggle-all': 'toggleAllComplete'
        };
    }

    dom(state: IState) {
        const keys = Object.keys(state.todos);
        const completed = keys.reduce((sum, key) => sum + (state.todos[key].completed ? 1 : 0), 0);
        const remaining = keys.length - completed;

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
                h('ul.todo-list', Object.keys(state.todos).map(key => this.getChild(key).tree()))
            ]),
            /* This footer should hidden by default and shown when there are todos */
            h('footer.footer', [
                /* This should be `0 items left` by default */,
                h('span.todo-count', [h('strong', remaining.toString()), remaining === 1 ? ' item left' : ' items left'])
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

    toggleAllComplete() {
        //var completed = this.allCheckbox.checked;

        //app.todos.each(function (todo) {
        //    todo.save({
        //        completed: completed
        //    });
        //});
    }
}

declare const document: any;
(function(){
    const todos: IVarhash<ITodo> = { };
    todos[uuid.v4()] = {
        title: 'Taste mehpif',
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
    });
    state(console.log.bind(console, 'state'));
    const f = new App(state);
    document.body.insertBefore(f.host(), document.body.firstChild);
}());
