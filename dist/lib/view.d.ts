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
    private needsHook;
    constructor(state: IObservStruct<T>, eventsOverride?: EventSet);
    abstract dom(state: T): VTree;
    events(): EventSet;
    host(): Text;
    protected onAfterPatch(): void;
    protected onHook(node: any): void;
    protected onUnhook(node: any): void;
    render(): VTree;
    private hook(node, propertyName, previousValue);
    private unhook(node, propertyName, previousValue);
    dispose(): void;
}
