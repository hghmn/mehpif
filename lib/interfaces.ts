export interface IObserv<T> {
    (): T;
    (watch: ((value: T) => void)): (() => void);
}
export interface IObservStruct_<T> {
    (): T;
    (watch: ((value: T) => void)): (() => void);
    set(value: T): void;
}
export type IObservStruct<T> = IObservStruct_<T> & T;


export interface IVarhash<T> {
    [key: string]: T;
}

export interface IObservVarhash<TBefore, T> {
    (): IVarhash<T>;
    (watch: ((value: IVarhash<T>) => void)): (() => void);
    put(key: string, value: TBefore): this;
    get(key: string): T;
    delete(key: string): this;
}
