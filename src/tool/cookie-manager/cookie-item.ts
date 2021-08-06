import { Cookie, ResponseForCookies } from './interfaces';
import { CookieOptions } from 'express';

export class CookieItem<T = string> implements Cookie<T> {
    private _resp: ResponseForCookies;

    private _name: string;
    public get name(): string {
        return this._name;
    }

    private _value: T;
    public get value(): T {
        return this._value;
    }
    public set value(v: T) {
        this._value = v;
    }

    constructor(resp: ResponseForCookies, name: string, value?: string) {
        this._resp = resp;
        this._name = name;

        if (value) {
            let txt = decodeURIComponent(value);
            if (txt.match(/^j:/gi)) {
                txt = txt.replace(/^j:/g, '');
                this._value = JSON.parse(txt);
            } else {
                this._value = txt as any;
            }
        }
    }

    save(options?: CookieOptions): void {
        let value: string;
        if (typeof this._value === 'string') {
            value = encodeURIComponent(this._value);
        } else {
            const json = JSON.stringify(this._value);
            value = encodeURIComponent(`j:${json}`);
        }

        this._resp.cookie(this._name, value, options);
    }

    kill(options?: CookieOptions): void {
        this._resp.clearCookie(this._name, options);
    }
}
