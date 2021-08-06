import { AESAlgorithm } from '../../tool/aes-crypto/interfaces';

export interface Options {
    /**
     * The path of the folder in where `session-crossover` will adds the new sessions to be created.
     * If the folder doesn't exists, the library will be create the folder while implements the
     * middleware in the `express` instance.
     */
    path: string;

    /**
     * The name of the cookie which the session's encrypted UUID will be stored in the client. By default
     * the name it's `"session-id"`.
     */
    name?: string;

    /**
     * The lifetime duration (in milliseconds) of every session created. By default it's setted to
     * 30 mins of duration.
     */
    maxAge?: number;

    /**
     * The AES-Algorithm to be used for encrypt the data and the cookie value. By default, the algorithm
     * used is `"aes-128-ccm"`.
     */
    algorithm?: AESAlgorithm;
}