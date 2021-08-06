export class InvalidAlgorithmTypeError extends Error {
    constructor()
    constructor(type: string)
    constructor(type?: string) {
        super();
        if (type) {
            this.message = `The algorythm "${type}" given it's invalid.`;
        } else {
            this.message = `The algorythm given it's invalid.`;
        }
    }
}