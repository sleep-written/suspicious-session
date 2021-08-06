export class SessionNotFoundError extends Error {
    constructor();
    constructor(hash: string);
    constructor(hash?: string) {
        super();
        if (hash) {
            this.message = `The session with id "${hash}" doesn't exists.`;
        } else {
            this.message = `The current session doesn't exists.`;
        }
    }
}