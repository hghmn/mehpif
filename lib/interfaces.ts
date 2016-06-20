export interface IObserv<T> {
    (): T;
    (watch: ((value: T) => void)): (() => void);
}
export type IObservStruct<T> = IObserv<T> & T;


interface IVarhash<T> {
    [key: string]: T;
}

export interface IObservVarhash<T, TBefore> {
    (): IVarhash<T>;
    (watch: ((value: IVarhash<T>) => void)): (() => void);
    put(key: string, value: TBefore): this;
    get(key: string): T;
    delete(key: string): this;
}
