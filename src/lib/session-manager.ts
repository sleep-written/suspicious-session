import { Cookie, CookieManager } from '../tool/cookie-manager';

import { Current, Manager, Options } from './interfaces';
import { CurrentSession } from './current-session';
import { SessionQueue } from './session-queue';

export class SessionManager implements Manager {
    private _cookieManager: CookieManager;
    private _cookieName: string;
    private _cookie: Cookie;

    private _sessionQueue: SessionQueue;
    private _current: CurrentSession;

    constructor(
        cookieManager: CookieManager,
        sessionQueue: SessionQueue
    ) {
        // Set session queue params
        this._sessionQueue = sessionQueue;
        
        // Set cookie management
        this._cookieManager = cookieManager;
        this._cookieName = sessionQueue.options.name;

        // Search for current cookie
        this._cookie = this._cookieManager.get(this._cookieName);
        if (this._cookie) {
            try {
                // Assign as current session
                this._current = this
                    ._sessionQueue
                    .findByHex(this._cookie.value);

            } catch {
                // Clear the current session
                this._current = null;
                this._cookie.kill({
                    httpOnly: true,
                    secure: true,
                    path: '/'
                });
            }
        } else {
            // Cookie not found
            this._current = null;
        }
    }

    current<T = any>(): Current<T> {
        return this._current;
    }

    async create(): Promise<void> {
        // Destroy the actual session
        if (this._current) {
            this._current.destroy();
        }

        // New session
        this._current = this
            ._sessionQueue
            .new();

        // Encrypt the uuid
        const value = this
            ._sessionQueue
            .uuid2hex(this._current.uuid);

        // Create the cookie
        this._cookie = this
            ._cookieManager
            .new(this._cookieName, value);

        // Save the cookie
        this._cookie.save({
            httpOnly: true,
            maxAge: this._current.maxAge,
            secure: true,
            path: '/'
        });
    }
    
    async destroy(): Promise<void> {
        // Clear the session instance
        if (this._current) {
            await this._current.destroy();
            this._current = null;
        }
        
        // Clear the cookie session
        if (this._cookie) {
            this._cookie.kill({
                httpOnly: true,
                secure: true,
                path: '/'
            });
            this._cookie = null;
        }
    }

    rewind(): void {
        // Rewind the current session
        if (this._current) {
            this._current.rewind();
        }

        // Save the cookie
        if (this._cookie) {
            this._cookie.save({
                httpOnly: true,
                maxAge: this._current.maxAge,
                secure: true,
                path: '/'
            });
        }
    }
}
