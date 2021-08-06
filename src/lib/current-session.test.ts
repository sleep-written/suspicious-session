import { assert } from 'chai';
import { resolve } from 'path';
import { v4 as uuidV4 } from 'uuid';
import * as fsPromises from 'fs/promises';

import { AESCrypto } from '../tool/aes-crypto';
import { CurrentSession } from './current-session';

interface Data {
    text: string;
    value: number;
}

describe('Testing "./lib/current-session"', () => {
    const folderPath = resolve('./data');
    const aes = new AESCrypto('aes-256-ccm');

    before(async () => {
        aes.generateKey();
        await fsPromises.mkdir(folderPath, { recursive: true });
    });

    after(async () => {
        await fsPromises.rm(folderPath, { recursive: true });
    });

    it('instances: 1; maxAge: 500 ms; offset: 0 ms', () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // Create the current session
                const obj = new CurrentSession<Data>(aes, uuidV4(), {
                    path: folderPath,
                    maxAge: 500
                });
                obj.onDestroy = () => resolve();
    
                // Save the data in a encripted file
                const ref: Data = {
                    text: 'ajajajaja',
                    value: 123
                };
                await obj.save(ref);

                // Load the encrypted data
                const out = await obj.load();
                assert.isObject(out);
                assert.strictEqual(out.text, ref.text);
                assert.strictEqual(out.value, ref.value);
            } catch (err) {
                reject(err);
            }
        });
    });

    it('instances: 2; maxAge: 500 ms; offset: 250 ms', () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // The data of the both sessions
                const ref01: Data = {
                    text: 'ajajajaja',
                    value: 123
                };
                const ref02: Data = {
                    text: 'lmaooo',
                    value: 543
                };

                // Create a session 01
                let obj01: CurrentSession<Data>;
                setImmediate(async () => {
                    try {
                        obj01 = new CurrentSession<Data>(aes, uuidV4(), {
                            path: folderPath,
                            maxAge: 500
                        });
                        obj01.onDestroy = async () => {
                            // Session data was destroyed
                            const out = await obj01.load();
                            assert.isNull(out);
                        };
                        
                        // Save session 01 data
                        await obj01.save(ref01);
                    } catch(err02) {
                        reject(err02);
                    }
                });
                
                // Create a session 02
                let obj02: CurrentSession<Data>;
                setTimeout(async () => {
                    try {
                        obj02 = new CurrentSession<Data>(aes, uuidV4(), {
                            path: folderPath,
                            maxAge: 500
                        });
                        obj02.onDestroy = async () => {
                            // Session data was destroyed
                            const out = await obj02.load();
                            assert.isNull(out);
                            resolve();
                        };
                        
                        // Save session 02 data
                        await obj02.save(ref02);
                    } catch (err02) {
                        reject(err02);
                    }
                }, 250);

                // Check both sessions
                setTimeout(async () => {
                    try {
                        const out01 = await obj01.load();
                        assert.isObject(out01);
                        assert.hasAllKeys(out01, [ 'text', 'value' ]);
                        assert.strictEqual(out01.text, ref01.text);
                        assert.strictEqual(out01.value, ref01.value);
    
                        const out02 = await obj02.load();
                        assert.isObject(out02);
                        assert.hasAllKeys(out02, [ 'text', 'value' ]);
                        assert.strictEqual(out02.text, ref02.text);
                        assert.strictEqual(out02.value, ref02.value);
                    } catch (err02) {
                        reject(err02);
                    }
                }, 400);
            } catch (err01) {
                reject(err01);
            }
        });
    });

    it('instances: 1; maxAge: 10000ms; destroyedAt: 500ms', () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // Create the session
                const obj = new CurrentSession(aes, uuidV4(), {
                    path: folderPath,
                    maxAge: 10000
                });
                const them = Date.now();

                obj.onDestroy = async () => {
                    try {
                        // File has been destroyed
                        const exist = await obj.exists();
                        assert.isFalse(exist);
                        resolve();
                    } catch (err02) {
                        reject(err02);
                    }
                };

                // Save data
                await obj.save('hello world');
                const exist = await obj.exists();
                assert.isTrue(exist);

                // Destroy the session
                setTimeout(() => obj.destroy(), 500);
            } catch (err01) {
                reject(err01);
            }
        });
    }).timeout(550);

    it('instances: 1; maxAge: 500 ms; exists() = false', () => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                // A new Session
                const obj = new CurrentSession<Data>(aes, uuidV4(), {
                    path: folderPath,
                    maxAge: 500
                });
                obj.onDestroy = () => resolve();

                // File doesn't exists
                const data01 = await obj.load();
                assert.isNull(data01);

                // Create file
                await obj.save({ text: 'malditoos', value: 666 });
                const data02 = await obj.load();
                assert.isNotNull(data02);
            } catch (err01) {
                reject(err01);
            }
        });
    }).timeout(550);

    it('instances: 1; maxAge: 500 ms; rewind() x 5', () => new Promise<void>(async (resolve, reject) => {
        try {
            // Create the instance
            const obj = new CurrentSession(aes, uuidV4(), {
                path: folderPath,
                maxAge: 500,
            });
    
            // Trigger end of process
            obj.onDestroy = () => resolve();
    
            // Save data
            await obj.save({
                text: 'no veas nada',
                value: 827369
            });
    
            // Rewind the session
            let count = 0;
            const clock = setInterval(() => {
                try {
                    if (count >= 5) {
                        // Destroy the clock
                        clearInterval(clock);
                    } else {
                        // Reset the internal clock
                        obj.rewind();
                        count++;
                    }
                } catch (err) {
                    reject(err);
                }
            }, obj.maxAge / 2);
        } catch (err) {
            reject(err);
        }
    })).timeout(1900);
});