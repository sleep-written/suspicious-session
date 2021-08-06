import { assert } from 'chai';
import { CookieOptions } from 'express';
import { CookieManager } from './cookie-manager';
import { RequestWithCookies, ResponseForCookies } from './interfaces';

/**
 * Fake class for request simulations
 */
 class FakeRequ implements RequestWithCookies {
    private _headers: { cookie?: string; };
    public get headers(): { cookie?: string; } {
        return this._headers;
    }

    constructor(data: { name: string; value?: string }[]) {
        let cookie = '';
        data.forEach((x, i) => {
            const name = x.name.replace(/;.*$/gi, '');
            if (x.name !== name) {
                delete x.value;
            }

            cookie += `${i ? '; ' : ''}${name}`;
            if (Object.keys(x).some(x => x === 'value')) {
                cookie += '=' + encodeURIComponent(x.value);
            }
        });

        this._headers = { cookie };
    }
}

/**
 * Fake class for response simulations
 */
class FakeResp implements ResponseForCookies {
    private _rawName: string;
    public get rawName(): string {
        return this._rawName;
    }

    private _rawValue: string;
    public get rawValue(): string {
        return this._rawValue;
    }

    cookie(name: string, val: string, options: CookieOptions): this {
        this._rawName = name;
        this._rawValue = val;
        return this;
    }

    clearCookie(name: string, options: CookieOptions): this {
        return this;
    }
}

describe('Testing "./tool/cookie-manager/cookie-item"', () => {
    const res = new FakeResp();
    const req = new FakeRequ([
        { name: 'cookie-a', value: 'hola mundo' },
        { name: 'cookie-b', value: `j:${JSON.stringify({ text: "joder", value: 555 })}` },
    ]);
    const manager = new CookieManager(req, res);

    it('Get "cookie-a" value: "hola mundo"', () => {
        const obj = manager.get('cookie-a');
        assert.strictEqual(obj.name, 'cookie-a');
        assert.strictEqual(obj.value, 'hola mundo');
    });

    it('Get "cookie-b" value: { text: "joder", value: 555 }', () => {
        const obj = manager.get<{ text: string, value: number; }>('cookie-b');
        assert.strictEqual(obj.name, 'cookie-b');
        assert.hasAllKeys(obj.value ?? { }, [ 'text', 'value' ]);
        assert.strictEqual(obj.value?.text, 'joder');
        assert.strictEqual(obj.value?.value, 555);
    });

    it('Set "cookie-a" value', () => {
        const obj = manager.get('cookie-a');
        obj.value = {
            id: 666,
            cod: 'RTX3090TI',
            descript: 'GPU w/ ray tracing'
        };
        obj.save();

        const raw = 'j%3A%7B%22id%22%3A666%2C%22cod%22%3A%22RTX3090TI%22%2C%22descript%22%3A%22GPU%20w%2F%20ray%20tracing%22%7D';
        assert.strictEqual(res.rawValue, raw);
    });

    it('Set "cookie-c" value (not exists)', () => {
        const obj = manager.new('cookie-c');
        obj.value = 'ajajajaja';
        obj.save();
        assert.strictEqual(res.rawValue, 'ajajajaja');
    });

    it('Set "cookie-d" value (not exists)', () => {
        const obj = manager.new('cookie-d');
        obj.value = {
            text: 'joder',
            value: 666
        };
        obj.save();

        const raw = 'j%3A%7B%22text%22%3A%22joder%22%2C%22value%22%3A666%7D';
        assert.strictEqual(res.rawValue, raw);
    });
});
