// Local visual QA of the actual native screen components using synthetic data.
import { context } from 'esbuild';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const compiler = await context({
    entryPoints: ['scripts/preview/app.jsx'],
    bundle: true,
    write: false,
    jsx: 'automatic',
    platform: 'browser',
    mainFields: ['browser', 'module', 'main'],
    resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: { 'react-native': 'react-native-web' },
    define: { 'process.env.NODE_ENV': '"development"', 'process.env': '{}', __DEV__: 'true' },
});
const html = await readFile('scripts/preview/index.html');
createServer(async (req, res) => {
    if (req.url === '/app.js') {
        const result = await compiler.rebuild();
        res.setHeader('Content-Type', 'text/javascript');
        res.end(result.outputFiles[0].contents);
        return;
    }
    if (/^\/fonts\/[\w-]+\.(otf|ttf)$/.test(req.url ?? '')) {
        try {
            res.end(await readFile(resolve('assets', req.url.slice(1))));
        } catch {
            res.writeHead(404);
            res.end();
        }
        return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
}).listen(4173, '127.0.0.1', () => console.log('Takya visual QA: http://127.0.0.1:4173'));
