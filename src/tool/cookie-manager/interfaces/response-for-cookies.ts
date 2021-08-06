import { CookieOptions } from 'express';

export interface ResponseForCookies {
    cookie(name: string, val: string, options: CookieOptions): ResponseForCookies;
    clearCookie(name: string, options: CookieOptions): ResponseForCookies;
}
