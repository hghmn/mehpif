declare module "observ" {
    type remove = () => void;
    type watch<T> = (value: T) => void;

    interface IObserv<T> {
        (): T;
        (watch: watch<T>): remove;
        set(value: T): void;
    }

    function Observ<T>(value: T): IObserv<T>;
    export = Observ;
}

declare module "observ-struct" {
    type remove = () => void;
    type watch<T> = (value: T & { _diff: any }) => void;

    interface IObserv<T> {
        (): T;
        (watch: watch<T>): remove;
        set(value: T): void;
    }

    function ObservStruct<T>(value: T): IObserv<T> & T;
    export = ObservStruct;
}

declare module "observ-varhash" {
    interface IVarhash<T> {
        [key: string]: T;
    }

    interface IObservVarhash<T, TBefore> {
        (): IVarhash<T>;
        (watch: ((value: IVarhash<T>) => void)): (() => void);
        put(key: string, value: TBefore): this;
        get(key: string): T;
        delete(key: string): this;
    }

    function ObservStruct<T>(hash: IVarhash<T>):
        IObservVarhash<T, T>;
    function ObservStruct<TValue, TBefore>(hash: IVarhash<TBefore>, createValue: (value: TBefore, key: string) => TValue):
        IObservVarhash<TValue, TBefore>;

    export = ObservStruct;
}
