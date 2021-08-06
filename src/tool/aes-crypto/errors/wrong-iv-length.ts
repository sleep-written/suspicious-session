export class WrongIvLengthError extends Error {
    constructor() {
        super('The length of the current IV isn\'t acording with the algorythm type.');
    }
}
