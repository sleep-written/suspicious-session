import { RequestWithCookies, ResponseForCookies, Cookie } from './interfaces';
import { CookieItem } from './cookie-item';
import { parse } from 'cookie';

export class CookieManager {
    private _mem: { [key: string]: string; };
    private _res: ResponseForCookies;

    constructor(
        req: RequestWithCookies,
        res: ResponseForCookies
    ) {
        this._mem = parse(req.headers?.cookie ?? '');
        this._res = res;
    }

    get<T = any>(name: string): Cookie<T> {
        const value = this._mem[name];
        if (typeof value === 'string') {
            return new CookieItem(this._res, name, value);
        } else {
            return null;
        }
    }

    getAll(): Cookie<any>[] {
        const keys = Object.keys(this._mem);
        const data: Cookie[] = [];

        for (const key of keys) {
            const obj = new CookieItem(this._res, key, this._mem[key]);
            data.push(obj);
        }

        return data;
    }

    new<T = any>(name: string, value?: T): Cookie<T> {
        const item = new CookieItem<T>(this._res, name);
        if (value) {
            item.value = value;
        }
        return item;
    }
}
