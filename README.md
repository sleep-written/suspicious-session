# Suspicious Session

This is a package to manage sessions stored in __encrypted__ files (with AES), using __UUIDv4__ for client identification for [Express.js](https://expressjs.com/). This package it's a newer version writted from zero based of [session-crossover](https://www.npmjs.com/package/session-crossover) package _(now deprecated)._ This package is developed with [typescript](https://www.typescriptlang.org/) and contains all required `*.d.ts` definitions inside it.


## Implementation

- First install this package in your project:
```console
npm install --save suspicious-session
```

- Then create a new `express();` instance, and use the middleware as follows:
```ts
import express from 'express';
import { suspiciousSession } from 'suspicious-session';

// Create the express instance
const app = express();

// Use the middleware
app.use(suspiciousSession({
    path: './data',           // Where the sessions will be stored
    name: 'i-see-you',        // [ default = 'session-id' ] Name of the cookie to create
    maxAge: 15,               // [ default = 30 ] Time of session duration (in minutes)
    algorithm: 'aes-256-ccm', // [ default = 'aes-128-ccm' ] AES algorithm do you want to use
    
    /** An optional object in case if you want to change the way
     * of the library creates the cookies.
     */
    cookieOptions: {
        secure: false
    }
}));
```


## Basic Usage

The core of the package resides in `req.session`, which contains the necessary methods to manage the current sessions. All operations about sessions are available in that object. These are some examples of usage:

- Create a new session, and save inside an object:
```ts
app.get('/create', async (req, res) => {
    // Create a new session
    await req.session.create();

    // Add inside an object
    await req.session.current().save({
        id: 543,
        nick: 'nadja',
        typeUser: 4
    });

    // Ends the request
    res.end();
});
```

- Rewind the expiration time of the current session:
```ts
app.get('/rewind', async (req, res) => {
    // Get if this connection has an active sesion
    const exist = !!req.session.current();

    // Rewind the expiration time
    if (exist) {
        req.session.rewind();
    }

    // Ends the request
    res.end();
});
```

- Destroy the current session:
```ts
app.get('/destroy', async (req, res) => {
    // Get if this connection has an active sesion
    const exist = !!req.session.current();

    // Destroy the current session
    if (exist) {
        await req.session.destroy();
    }

    // Ends the request
    res.end();
});
```

- Read data from a session:
```ts
app.get('/read', async (req, res) => {
    // Get the current active session
    const current = req.session.current();

    if (current) {
        // Read the session content
        const data = await current.load();
        res.json(data);
    } else {
        // Return null
        res.json(null);
    }
});
```

## Configuration

The configuration of the library it's simple, but quite flexible. As you see at the top, the parameters are just the necesary for simple implementations, but considerates some cases when you could need an specific behavior. The options are according to this interface:


```ts
export interface Options {
    /**
     * The path of the folder in where `session-crossover` will adds the new sessions to be created.
     * If the folder doesn't exists, the library will be create the folder while implements the
     * middleware in the `express` instance.
     */
    path: string;

    /**
     * The name of the cookie which the session's encrypted UUID will be stored in the client. By default
     * the name it's `"session-id"`.
     */
    name?: string;

    /**
     * The lifetime duration (in minutes) of every session created. By default it's setted to
     * 30 mins of duration.
     */
    maxAge?: number;

    /**
     * The AES-Algorithm to be used for encrypt the data and the cookie value. By default, the algorithm
     * used is `"aes-128-ccm"`.
     */
    algorithm?: AESAlgorithm;

    /**
     * An optional object with a custom configuration of the cookie generated, in case if you need to
     * set an specific parameter. 
     */
    cookieOptions?: CookieOptions;
}
```



## About `this.algorithm`:

This parameter tells to the library which __AES encryption__ algorithm do you want to use for encrypt the sessions. By default, use `"aes-128-ccm"`, but if you want to use another algorithm, these are the available:
- `"aes-128-ccm"`
- `"aes-128-gcm"`
- `"aes-192-ccm"`
- `"aes-192-gcm"`
- `"aes-256-ccm"`
- `"aes-256-gcm"`
- `"chacha20-poly1305"`

## About `this.cookieOptions`:

In certain cases, it's probably that you want to create the cookies with a different settings than the default used by the library. The default values are:

```ts
const cookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/',
};
```

If you want to override some values, simply you can add only the parameter do you want to change (keeping the default values intact). For example, in case when you only need to change the `"secure"` parameter to `false`, then:
```ts
app.use(suspiciousSession({
    path: './data',
    maxAge: 15,
    cookieOptions: {
        /**
         * This override the default value
         * "secure: true" to "false".
         */
        secure: false
    }
}));
```

...or in other cases when you need to add a parameter without a default value, simply you can add that value as follows:

```ts
app.use(suspiciousSession({
    path: './data',
    maxAge: 15,
    cookieOptions: {
        /**
         * The parameter "signed" doesn't has a
         * default value assigned.
         */
        signed: true
    }
}));
```

The available values to set are _(see the [express.js](http://expressjs.com/en/4x/api.html#res.cookie) for details)_:

Property | Type                  | Description
---------|-----------------------|------------
domain   | `string`              | Domain name for the cookie. Defaults to the domain name of the app.
encode   | `function`            | A synchronous function used for cookie value encoding. Defaults to `encodeURIComponent`.
httpOnly | `boolean`             | Flags the cookie to be accessible only by the web server.
path     | `string`              | Path for the cookie. Defaults to `"/"`.
secure   | `boolean`             | Marks the cookie to be used with __HTTPS__ only.
signed   | `boolean`             | Indicates if the cookie should be signed.
sameSite | `boolean` or `string` | Value of the “SameSite” Set-Cookie attribute. More information at [here](https://tools.ietf.org/html/draft-ietf-httpbis-cookie-same-site-00#section-4.1.1)