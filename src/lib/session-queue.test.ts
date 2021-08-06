import { resolve } from 'path';
import { v4 as uuidV4 } from 'uuid';
import * as fsPromises from 'fs/promises';

import { Options } from './interfaces';
import { SessionQueue } from './session-queue';
import { assert } from 'chai';

describe('Testing "./lib/session-queue"', () => {
    const options: Options = {
        maxAge: 500,
        path: resolve('./data')
    };

    before(async () => {
        await fsPromises.mkdir(options.path, { recursive: true });
    });

    after(async () => {
        await fsPromises.rm(options.path, { recursive: true, force: true });
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-128-ccm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-128-ccm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-128-gcm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-128-gcm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-192-ccm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-192-ccm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-192-gcm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-192-gcm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-256-ccm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-256-ccm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "aes-256-gcm"', () => {
        const queue = new SessionQueue({
            algorithm: 'aes-256-gcm',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Encrypt/Decrypt UUIDv4 -> "chacha20-poly1305"', () => {
        const queue = new SessionQueue({
            algorithm: 'chacha20-poly1305',
            ...options,
        });

        for (let i = 0; i < 20; i++) {
            const uuid = uuidV4();
            const enc = queue.uuid2hex(uuid);
            const dec = queue.hex2uuid(enc);
            assert.strictEqual(dec, uuid);
        }
    });

    it('Create a new session', () => new Promise<void>(async (resolve, reject) => {
        try {
            const queue = new SessionQueue(options);
            const curr = queue.new();
            curr.onDestroy = () => { resolve(); };
    
            const val = 'hello world';
            await curr.save(val);
            await new Promise(res => setTimeout(res, 250));
    
            const txt = await curr.load();
            assert.strictEqual(txt, val);
        } catch (err) {
            reject(err);
        }
    })).timeout(550);

    it('Create 2 new sessions', () => new Promise<void>(async (resolve, reject) => {
        try {
            const queue = new SessionQueue(options);
            const curr01 = queue.new();
    
            const val01 = { text: 'jajaja', value: 123456 };
            await curr01.save(val01);
    
            const txt01 = await curr01.load();
            assert.strictEqual(txt01.text, val01.text);
            assert.strictEqual(txt01.value, val01.value);
            
            await new Promise(res => setTimeout(res, options.maxAge / 2));
            const curr02 = queue.new();
            curr02.onDestroy = () => { resolve(); };
    
            const val02 = { text: 'hola', value: 111111 };
            await curr02.save(val02);
    
            const txt02 = await curr02.load();
            assert.strictEqual(txt02.text, val02.text);
            assert.strictEqual(txt02.value, val02.value);
        } catch (err) {
            reject(err);
        }
    })).timeout(800);
});