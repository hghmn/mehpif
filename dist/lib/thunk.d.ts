import { IObservStruct } from './interfaces';
export declare type VTree = any;
export declare function thunk<T>(state: IObservStruct<T>, dom: (state: T) => VTree, events?: EventSet): void;
export declare type EventSet = {
    [evt: string]: Function;
};
export declare abstract class ThunkView<T> {
    state: IObservStruct<T>;
    private previousState;
    private previousTree;
    private type;
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
