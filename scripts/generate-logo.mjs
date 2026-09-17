// Build native vector paths from the supplied artwork. Requires Inkscape.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'takya-logo-'));
const outlined = process.argv[2] ?? join(directory, 'outlined.svg');
if (!process.argv[2])
    execFileSync('inkscape', [
        'assets/takya-full-logo.svg',
        '--export-text-to-path',
        '--export-plain-svg',
        `--export-filename=${outlined}`,
    ]);
const svg = readFileSync(outlined, 'utf8');
const paths = [...svg.matchAll(/<path\b[^>]*\/>/g)].map(([element]) => {
    const attribute = (name) => element.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    return {
        id: attribute('id'),
        d: attribute('d'),
        yellow: attribute('style')?.includes('#f7c702') ?? false,
    };
});
if (paths.length !== 11 || !paths.some((path) => path.id === 'text91'))
    throw new Error('Unexpected source logo structure');
writeFileSync(
    'src/components/Brand/logoPaths.ts',
    `// Generated from assets/takya-full-logo.svg by scripts/generate-logo.mjs.\n// Wordmark outlined to render consistently before fonts load.\nexport const logoPaths = ${JSON.stringify(paths, null, 4)} as const;\n`,
);

for (const [mode, ink] of [
    ['light', '#20251F'],
    ['dark', '#F3F4ED'],
]) {
    const destination = join(directory, `splash-${mode}.svg`);
    writeFileSync(
        destination,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 94.294677 119.45782"><g transform="translate(-3081.4359,671.749)">${paths.map((p) => `<path d="${p.d}" fill="${p.yellow ? '#F7C702' : ink}"/>`).join('')}</g></svg>`,
    );
    console.log(`rsvg-convert -w 462 -o assets/splash-${mode}.png ${destination}`);
}
