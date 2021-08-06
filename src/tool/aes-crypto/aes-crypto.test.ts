import { assert } from 'chai';
import { randomBytes } from 'crypto';

import { AESCrypto } from './aes-crypto';
import { AESResult, AESAlgorithm } from './interfaces';

/**
 * Execute a cycle of encryptions and decryptions, reading an array of strings.
 * @param algorythm The cipher algorithm to be used for the current test.
 * @param input The data which the test will be encrypt and decrypt.
 */
function execute(algorythm: AESAlgorithm, input: string[]): void {
    const aes = new AESCrypto(algorythm);
    const mem = [] as AESResult[];
    aes.generateKey();

    // Encrypt
    for (const item of input) {
        const byte = Buffer.from(item, 'utf-8');
        const resp = aes.encrypt(byte);
        mem.push(resp);
    }

    // Decrypt
    let i = 0;
    for (const resp of mem) {
        const byte = aes.decrypt(resp);
        const text = byte.toString('utf-8');
        
        const item = input[i++];
        assert.strictEqual(text, item);
    }
}

describe('Testing "./tool/aes-crypto"', () => {
    let reference: string[] = [];
    beforeEach(() => {
        // Create a new Array of random strings
        for (let i = 0; i < 100; i++) {
            const rand = 10 + Math.round(Math.random() * 10);
            const byte = randomBytes(rand);
            reference.push(byte.toString('hex'));
        }
    });

    afterEach(() => {
        reference = [];
    });

    it('Using "aes-128-ccm" algorithm', () => {
        execute('aes-128-ccm', reference);
    });

    it('Using "aes-128-gcm" algorithm', () => {
        execute('aes-128-gcm', reference);
    });

    it('Using "aes-192-ccm" algorithm', () => {
        execute('aes-192-ccm', reference);
    });

    it('Using "aes-192-gcm" algorithm', () => {
        execute('aes-192-gcm', reference);
    });

    it('Using "aes-256-ccm" algorithm', () => {
        execute('aes-256-ccm', reference);
    });

    it('Using "aes-256-gcm" algorithm', () => {
        execute('aes-256-gcm', reference);
    });

    it('Using "chacha20-poly1305" algorithm', () => {
        execute('chacha20-poly1305', reference);
    });
});
