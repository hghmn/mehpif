export interface IObserv<T> {
    (): T;
    (watch: ((value: T) => void)): (() => void);
}
export type IObservStruct<T> = IObserv<T> & T;
