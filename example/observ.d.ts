
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
