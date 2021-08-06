import { Current } from './current';

export interface Manager {
    /**
     * Returns the __current session object__ in case when the session exists, otherwise, return `null`.
     */
    current<T = any>(): Current<T>;

    /**
     * Creates a new session for the current connection. The new session created will be available
     * through `this.current();` method.
     */
    create(): Promise<void>;

    /**
     * Destroys the session assigned to this connection deleting the client's cookie and remove the
     * file associated to the current session.
     */
    destroy(): Promise<void>;

    /**
     * Resets the expiration time of the current session.
     */
    rewind(): void;
}
