import { EventObservable } from './event-observable';
import { Observable } from './interfaces';

export class EventEmitter<T = any> {
    private _observable: EventObservable<T>;

    constructor() {
        this._observable = new EventObservable<T>();
    }

    observable(): Observable<T> {
        return this._observable;
    }

    emit(value?: T): void {
        return this._observable.dispatch(value);
    }
}