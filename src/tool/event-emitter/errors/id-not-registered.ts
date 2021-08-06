import { InternalError } from '../interfaces';

export class IdNotRegistered extends Error implements InternalError {
    public get code(): string {
        return 'IDNOTREG';
    }

    constructor(id?: number) {
        super();
        if (typeof id === 'number') {
            this.message =  `The id "${id}" isn't registered, please use "this.generateId();" `
                        +   `to get a valid id and allocate memory`;
        } else {
            this.message =  `The id given isn't registered, please use "this.generateId();" `
                        +   `to get a valid id and allocate memory`;
        }
    }
}
