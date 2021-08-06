import { Options } from './interfaces';
import { AESCrypto } from '../tool/aes-crypto';
import { CurrentSession } from './current-session';
import { v4 as uuidV4 } from 'uuid';
import { WrongUuidProvidedError } from './errors';
import { resolve } from 'path';

export class SessionQueue {
    private _aes: AESCrypto;
    private _memory: Record<string, CurrentSession>;

    private _options: Options;
    public get options(): Options {
        return this._options;
    }
    
    constructor(options: Options) {
        // Set default values
        this._options = options;
        this._options.path = resolve(this._options.path);
        if (!this._options.name) {
            this._options.name = 'session-id';
        }
        if (!this._options.algorithm) {
            this._options.algorithm = 'aes-128-ccm';
        }

        this._aes = new AESCrypto(options.algorithm);
        this._aes.generateKey();
        this._memory = {};
    }

    private _handleDestroy(uuid: string): void {
        delete this._memory[uuid];
    }

    new<T = any>(): CurrentSession<T> {
        // Generate a new UUID
        let uuid: string;
        do {
            uuid = uuidV4();
        } while (!!this._memory[uuid]);

        // Create a new instance
        const obj = new CurrentSession<T>(this._aes, uuid, this._options);
        obj.onDestroy = this._handleDestroy.bind(this);

        // Add into the cache
        this._memory[uuid] = obj;
        return obj;
    }
    
    uuid2hex(uuid: string): string {
        const bytes = uuid
            .split('-')
            .map(x => Buffer.from(x, 'hex'));

        // Check format
        if (
            (bytes.length !== 5) ||
            (bytes[0]?.length !== 4) ||
            (bytes[1]?.length !== 2) ||
            (bytes[2]?.length !== 2) ||
            (bytes[3]?.length !== 2) ||
            (bytes[4]?.length !== 6)
        ) {
            throw new WrongUuidProvidedError();
        }

        // Encrypt
        const encr = this._aes.encrypt(Buffer.concat(bytes));
        const resp = Buffer.concat([ encr.iv, encr.data ]);
        return resp.toString('hex');
    }

    hex2uuid(hex: string): string {
        // Convert to buffer
        const raw = Buffer.from(hex, 'hex');
        if (raw.length !== (this._aes.ivLength + 16)) {
            throw new WrongUuidProvidedError();
        }
        
        // Get parts
        const iv = raw.slice(0, this._aes.ivLength);
        const data = raw.slice(this._aes.ivLength);

        // Decript data
        const resp = this._aes.decrypt(iv, data);
        if (resp.length !== 16) {
            throw new WrongUuidProvidedError();
        }

        // Subdivide all in sections
        const part = [
            resp.slice(0, 4),
            resp.slice(4, 6),
            resp.slice(6, 8),
            resp.slice(8, 10),
            resp.slice(10, 16),
        ];

        // Make the output value
        let out = '';
        for (const byte of part) {
            out += ((out) ? '-' : '') + byte.toString('hex');
        }
        return out;
    }

    findByHex(hex: string): CurrentSession {
        const uuid = this.hex2uuid(hex);
        return this._memory[uuid] ?? null;
    }

    findByUuid(uuid: string): CurrentSession {
        return this._memory[uuid];
    }
}
