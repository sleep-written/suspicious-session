export class EmptyKeyError extends Error {
    constructor() {
        super(
                `The current Aes instance doesn\'t has a key setted. Before to encrypt `
            +   `or decrypt, execute "this.generateKey();" method, or provide a `
            +   `valid key into the constructor.`
        );
    }
}
