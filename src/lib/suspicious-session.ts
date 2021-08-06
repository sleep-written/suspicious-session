import { Middleware, Options } from './interfaces';
import { CookieManager } from '../tool/cookie-manager';
import { SessionManager } from './session-manager';
import { SessionQueue } from './session-queue';
import { accessSync, mkdirSync } from 'fs';

/**
 * ## sus-session
 * A __middleware__ for __express.js__ to manage sessions stored in
 * encrypted files. Uses UUIDv4 for connection identificacion, and
 * encrypts the UUID before inserting as cookie at the `Response`.
 * 
 * @param options An object with the options for configure the
 * behavior of `sus-session`.
 */
export function suspiciousSession(options: Options): Middleware {
    const sessionQueue = new SessionQueue(options);
    const path = sessionQueue.options.path;

    // Create the folder
    try {
        accessSync(path);
    } catch (err) {
        if (err.code === 'ENOENT') {
            mkdirSync(path);
        } else {
            throw err;
        }
    }
    
    // Return the middleware
    return async (req, res, nxt) => {
        const cookieManager = new CookieManager(req, res);
        req.session = new SessionManager(
            cookieManager,
            sessionQueue
        );

        nxt();
    };
}