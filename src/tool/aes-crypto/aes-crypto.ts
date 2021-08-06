import { randomBytes, createCipheriv, CipherCCMOptions, CipherGCMOptions } from 'crypto';

import { AESResult, AESAlgorithm } from './interfaces';
import {
    InvalidAlgorithmTypeError, WrongKeyLengthError,
    WrongIvLengthError, EmptyKeyError
} from './errors';

export class AESCrypto {
    private _algorythm: AESAlgorithm;
    /**
     * Gets the current cipher algorithm to use.
     */
    public get algorythm(): AESAlgorithm {
        return this._algorythm;
    }

    private _keyLength: number;
    /**
     * Gets the expected length of the key, according with the selected algorithm.
     */
    public get keyLength(): number {
        return this._keyLength;
    }

    private _ivLength: number;
    /**
     * Gets the expected length of the iv, according with the selected algorithm.
     */
    public get ivLength(): number {
        return this._ivLength;
    }

    private _key: Buffer;
    /**
     * Gets or sets the current private key to be used to the AES cipher.
     */
    public get key(): Buffer {
        return this._key;
    }
    /**
     * Gets or sets the current private key to be used to the AES cipher.
     */
    public set key(v: Buffer) {
        if (v.length === this._keyLength) {
            this._key = v;
        } else {
            throw new WrongKeyLengthError();
        }
    }

    constructor(type: AESAlgorithm);
    constructor(type: AESAlgorithm, key: Buffer);
    constructor(type: AESAlgorithm, key?: Buffer) {
        // Get the byte length of the key
        this._algorythm = type;
        switch (type) {
            case 'aes-128-ccm':
            case 'aes-128-gcm':
                this._keyLength = 16;
                this._ivLength = 12;
                break;
            case 'aes-192-ccm':
            case 'aes-192-gcm':
                this._keyLength = 24;
                this._ivLength = 12;
                break;
            case 'aes-256-ccm':
            case 'aes-256-gcm':
                this._keyLength = 32;
                this._ivLength = 12;
                break;
            case 'chacha20-poly1305':
                this._keyLength = 32;
                this._ivLength = 12;
                break;
            default:
                throw new InvalidAlgorithmTypeError(type);
        }

        // Build Key
        if (key) {
            if (key.length !== this._keyLength) {
                throw new WrongKeyLengthError();
            } else {
                this._key = key;
            }
        }
    }

    generateKey() {
        this._key = randomBytes(this._keyLength);
    }

    encrypt(input: Buffer, iv?: Buffer): AESResult {
        // Check the key
        if (!this._key) {
            throw new EmptyKeyError();
        } else if (this._key.length !== this._keyLength) {
            throw new WrongKeyLengthError();
        }

        // Build a random iv
        if (iv) {
            if (iv.length !== this._ivLength) {
                throw new WrongIvLengthError();
            }
        } else {
            iv = randomBytes(this._ivLength);
        }

        // Prepare cipher
        const cipher = createCipheriv(
            this._algorythm,
            this._key,
            iv,
            {
                authTagLength: 16
            } as CipherCCMOptions | CipherGCMOptions
        );

        // Encrypt
        const data = Buffer.concat([
            cipher.update(input),
            cipher.final()
        ]);

        // Return result
        return { iv, data };
    }

    decrypt({ iv, data }: AESResult): Buffer
    decrypt(iv: Buffer, data: Buffer): Buffer;
    decrypt(aaa: AESResult | Buffer, bbb?: Buffer): Buffer {
        // Check the key
        if (!this._key) {
            throw new EmptyKeyError();
        } else if (this._key.length !== this._keyLength) {
            throw new WrongKeyLengthError();
        }

        // Get iv
        let iv: Buffer;
        if (Buffer.isBuffer(aaa)) {
            iv = aaa;
        } else if (Buffer.from(aaa?.iv)) {
            iv = aaa.iv;
        }
        
        // Check iv
        if (iv.length !== this._ivLength) {
            throw new WrongIvLengthError();
        }

        // Get data
        let data: Buffer;
        if (Buffer.isBuffer(bbb)) {
            data = bbb;
        } else if (Buffer.from((aaa as AESResult)?.data)) {
            data = (aaa as AESResult).data;
        }

        // Prepare cipher
        const cipher = createCipheriv(
            this._algorythm,
            this._key,
            iv,
            {
                authTagLength: 16
            } as CipherCCMOptions | CipherGCMOptions
        );

        // Decrypt
        return Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);
    }
}
