export interface ISetOptions<T> {
    val: (node: any) => any;
    parse: (value: any) => T;
    prevent: (value: T) => boolean;
    compare: boolean;
}
export declare function set<T>(state: {
    set: (value: T) => void;
    (): T;
}, options?: ISetOptions<T>): (evt: any) => void;
