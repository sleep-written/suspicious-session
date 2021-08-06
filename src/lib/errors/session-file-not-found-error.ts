export class SessionFileNotFoundError extends Error {
    constructor();
    constructor(name: string);
    constructor(name?: string) {
        super();

        if (name) {
            this.message = `The session file with name "${name}" requested wasn't found.`;
        } else {
            this.message = 'The session file requested wasn\'t found.';
        }
    }
}
