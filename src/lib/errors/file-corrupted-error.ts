export class FileCorruptedError extends Error {
    private _details: string;
    public get details() {
        return this._details;
    }

    constructor(details?: string) {
        super('The session file cannot be read because its internal data has been corrupted');
        this._details = details;
    }
}