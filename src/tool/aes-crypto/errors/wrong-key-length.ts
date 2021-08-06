export class WrongKeyLengthError extends Error {
    constructor() {
        super('The length of the current key isn\'t acording with the algorythm type.');
    }
}
