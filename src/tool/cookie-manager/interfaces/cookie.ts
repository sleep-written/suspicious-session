import { CookieOptions } from 'express';

export interface Cookie<T = any> {
    get name(): string;

    get value(): T;
    set value(v: T);

    save(options?: CookieOptions): void;
    kill(options?: CookieOptions): void;
}
