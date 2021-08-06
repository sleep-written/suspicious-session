import express, { json } from 'express';
import { rmSync } from 'fs';

import { suspiciousSession } from '.';
const app = express();

app.use(json({
    strict: false,
    limit: 2048
}));

app.use(suspiciousSession({
    name: 'i-see-you',
    path: './data',
    maxAge: 15000,
    algorithm: 'aes-256-ccm',
}));

app.get('/create', async (req, res) => {
    let text: string;
    if (!req.session.current()) {
        text = 'Sessión creada correctamente';
    } else {
        text = 'Sessión reseteada correctamente';
    }

    await req.session.create();
    await req.session.current().save({
        text: 'Este es un objeto que será encriptado',
        value: new Date().toTimeString()
    });
    res.json(text);
});

app.get('/rewind', async (req, res) => {
    const curr = req.session.current();
    if (!curr) {
        res.json('No se ha encontrado la sesión activa');
    } else {
        req.session.rewind();
        res.json('Sessión actualizada correctamente');
    }
});

app.get('/read', async (req, res) => {
    const curr = req.session.current();
    if (!curr) {
        res.json('No se ha encontrado la sesión activa');
    } else {
        const data = await curr.load();
        res.json(data);
    }
});

app.get('/clear', async (req, res) => {
    const curr = req.session.current();
    if (!curr) {
        res.json('No se ha encontrado la sesión activa');
    } else {
        await req.session.destroy();
        res.json('Sessión eliminada correctamente');
    }
});

app.listen(80, () => {
    console.clear();
    console.log('Listening...');
});

process.on('exit', () => {
    rmSync('./data', { recursive: true, force: true });
});

process.on('SIGINT', () => {
    process.exit();
});
