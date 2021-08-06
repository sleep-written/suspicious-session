export class WrongUuidProvidedError extends Error {
    constructor() {
        super(
                `The UUID provided is invalid. A correct UUID must contains `
            +   `5 groups of bytes in following order: 4 bytes; 2 bytes; `
            +   `2 bytes; 2 bytes; 6 bytes, respectively.`
        );
    }
}