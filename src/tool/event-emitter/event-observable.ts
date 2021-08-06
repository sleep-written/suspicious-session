import { EventSubscription } from './event-subscription';
import { Callback, Observable, Subscription } from './interfaces';

export class EventObservable<T> implements Observable<T> {
    protected _tail: number[] = [];
    protected _memory: EventSubscription<T>[] = [];

    constructor() { }

    destroyAll(): void {
        this._tail = [];
        this._memory = [];
    }

    subscribe(func: Callback<T>, fail?: Callback<Error>): Subscription {
        // Set the id
        let id: number;
        if (this._tail.length > 0) {
            id = this._tail.shift();
        } else {
            id = this._memory.length;
        }

        // Create the subscription
        const sub = new EventSubscription<T>(id, func, fail);
        sub.setDisposeFunc(() => {
            delete this._memory[id];
            this._tail.push(id);
        });

        // Return the element
        this._memory[id] = sub;
        return sub;
    }

    dispatch(value?: T): void {
        for (const func of this._memory) {
            if (func) {
                func.dispatch(value);
            }
        }
    }
}
