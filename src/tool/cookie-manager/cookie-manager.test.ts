import { RequestWithCookies, ResponseForCookies } from './interfaces';
import { CookieManager } from './cookie-manager';
import { CookieOptions } from 'express';
import { assert } from 'chai';

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
    cookie(name: string, val: string, options: CookieOptions): FakeResp {
        return this;
    }

    clearCookie(name: string, options: CookieOptions): ResponseForCookies {
        return this;
    }
}

/** Unit tests */
describe('Testing "./tool/cookie-manager"', () => {
    it('Get cookie instances 01', () => {
        const req = new FakeRequ([
            { name: 'cookie-a', value: '1111' },
            { name: 'cookie-b', value: '2222' },
            { name: 'cookie-c', value: '3333' },
        ]);
        
        const res = new FakeResp();
        const man = new CookieManager(req, res);
        const arr = man.getAll();

        assert.strictEqual(arr.length, 3);
        assert.isTrue(arr.some(x => x.name === 'cookie-a'));
        assert.isTrue(arr.some(x => x.name === 'cookie-b'));
        assert.isTrue(arr.some(x => x.name === 'cookie-c'));
        assert.isFalse(arr.some(x => x.name === 'cookie-d'));
    });

    it('Get cookie instances 02', () => {
        const req = new FakeRequ([
            { name: 'cookie a', value: '1111' },
            { name: 'cookie b', value: '2222' },
            { name: 'cookie c', value: '3333' },
        ]);
        
        const res = new FakeResp();
        const man = new CookieManager(req, res);
        const arr = man.getAll();

        assert.strictEqual(arr.length, 3);
        assert.isTrue(arr.some(x => x.name === 'cookie a'));
        assert.isTrue(arr.some(x => x.name === 'cookie b'));
        assert.isTrue(arr.some(x => x.name === 'cookie c'));
        assert.isFalse(arr.some(x => x.name === 'cookie d'));
    });
});