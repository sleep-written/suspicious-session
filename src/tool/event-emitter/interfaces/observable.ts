import { Callback } from './callback';
import { Subscription } from './subscription';

export interface Observable<T> {
    subscribe(func: Callback<T>, fail?: Callback<Error>): Subscription;
    destroyAll(): void;
}
