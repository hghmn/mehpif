import { IObservStruct } from './interfaces';
export declare type VTree = any;
export declare function view<T>(state: IObservStruct<T>, dom: (state: T) => VTree, events?: EventSet): View<T>;
export declare type EventSet = {
    [evt: string]: Function | string;
};
export declare abstract class View<T> {
    state: IObservStruct<T>;
    private previousState;
    private previousTree;
    private eventSet;
    constructor(state: IObservStruct<T>);
    abstract dom(state: T): VTree;
    events(): EventSet;
    host(): Text;
    tree(): VTree;
    private render(previous);
    private hook(node, propertyName, previousValue);
    private unhook(node, propertyName, previousValue);
    dispose(): void;
}
