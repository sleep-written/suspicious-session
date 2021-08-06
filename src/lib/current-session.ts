import { resolve } from 'path';
import * as fsPromises from 'fs/promises';

import { Current, Options } from './interfaces';
import { AESCrypto } from '../tool/aes-crypto';
import { FileCorruptedError } from './errors';

export class CurrentSession<T = any> implements Current<T> {
    private _aes: AESCrypto;
    private _path: string;
    private _clock: NodeJS.Timeout;
    
    private _uuid: string;
    public get uuid(): string {
        return this._uuid;
    }

    private _maxAge: number;
    public get maxAge(): number {
        return this._maxAge;
    }

    private _onDestroy: (uuid?: string) => void | Promise<void>;
    public get onDestroy(): (uuid?: string) => void | Promise<void> {
        return this._onDestroy;
    }
    public set onDestroy(v: (uuid?: string) => void | Promise<void>) {
        this._onDestroy = v;
    }

    constructor(
        aes: AESCrypto,
        uuid: string,
        options: Pick<Options, 'path' | 'maxAge'>
    ) {
        this._aes = aes;
        this._uuid = uuid;
        this._maxAge = options.maxAge ?? 30000;
        
        this._path = resolve(options.path, `${uuid}.sus`);
        this._clock = setTimeout(this.destroy.bind(this), options.maxAge);
    }

    async exists(): Promise<boolean> {
        try {
            // Check file permissions
            await fsPromises.access(this._path);
            return true;
        } catch (err) {
            if (err.code === 'ENOENT') {
                // Path doesn't exist
                return false;
            } else {
                // Another kind of error
                throw err;
            }
        }
    }

    async load(): Promise<T> {
        if (!this._clock) {
            // The file has already destroyed
            return null;
        } else if (!await this.exists()) {
            // The file doesn't exists
            return null;
        }

        try {
            // Read the file
            const raw = await fsPromises.readFile(this._path);
            const iv = raw.slice(0, this._aes.ivLength);
            const data = raw.slice(this._aes.ivLength);
    
            // Decrypt the content
            const decr = this._aes.decrypt(iv, data);
            const text = decr.toString('utf-8');
            return JSON.parse(text);
        } catch (err) {
            throw new FileCorruptedError(err.message);
        }
    }

    async save(value: T): Promise<void> {
        // The file has already destroyed
        if (!this._clock) {
            return;
        }

        try {
            // Convert the data
            const text = JSON.stringify(value, null, '    ');
            const byte = Buffer.from(text, 'utf-8');
            
            // Encrypt the file
            const encr = this._aes.encrypt(byte);
            const data = Buffer.concat([ encr.iv, encr.data ]);
            return fsPromises.writeFile(this._path, data);
        } catch (err) {
            throw new FileCorruptedError(err.message);
        }
    }

    async destroy(): Promise<void> {
        // The file has already destroyed
        if (!this._clock) {
            return null;
        }

        // Clear the timer
        clearTimeout(this._clock);
        this._clock = null;

        // Destroy the file
        if (await this.exists()) {
            await fsPromises.rm(this._path);
        }

        // Execute the callback
        if (this._onDestroy) {
            this._onDestroy(this._uuid);
        }
    }

    rewind(): void {
        clearTimeout(this._clock);
        this._clock = setTimeout(this.destroy.bind(this), this._maxAge);
    }
}
