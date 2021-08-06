import { InternalError } from '../interfaces';

export class DispatchedEventFailed extends Error implements InternalError {
    public get code(): string {
        return 'DISPFAIL';
    }

    constructor(err?: Error) {
        super(`The event dispatched throws an error during its async execution`);
        if (err) {
            this.message += `:\n${err.message}`;
        }
    }
}
