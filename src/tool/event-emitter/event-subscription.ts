import { DispatchedEventFailed, DisposeFuncNotSetted } from './errors';
import { Callback, Subscription } from './interfaces';

export class EventSubscription<T> implements Subscription {
    private _func: Callback<T>;
    private _fail: Callback<Error>;
    private _dispose: (id?: number) => void;

    private _id: number;
    public get id(): number {
        return this._id;
    }

    constructor(id: number, func: Callback<T>, fail?: Callback<Error>) {
        this._id = id;
        this._func = func;
        this._fail = fail;
    }

    showError(err1: Error) {
        if (!this._fail) {
            const err = new DispatchedEventFailed(err1);
            console.error(err);
        } else {
            try {
                const resp = this._fail(err1);
                if (resp instanceof Promise) {
                    resp.catch(err2 => {
                        const err = new DispatchedEventFailed(err2);
                        console.error(err);
                    });
                }
            } catch (err2) {
                const err = new DispatchedEventFailed(err2);
                console.error(err);
            }
        }
    }

    dispatch(value: T): void {
        try {
            const resp = this._func(value);
            if (resp instanceof Promise) {
                resp.catch(this.showError.bind(this));
            }
        } catch (err) {
            this.showError(err);
        }
    }

    setDisposeFunc(func: (id?: number) => void): void {
        this._dispose = func;
    }

    destroy(): void {
        if (!this._dispose) {
            throw new DisposeFuncNotSetted();
        } else {
            this._dispose(this._id);
        }
    }
}
