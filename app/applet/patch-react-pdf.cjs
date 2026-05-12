const fs = require('fs');

function replaceInFile(file, replacements) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        for (const [search, replace] of replacements) {
            content = content.replace(search, replace);
        }
        fs.writeFileSync(file, content);
    }
}

const textkitFiles = [
    'node_modules/@react-pdf/textkit/lib/textkit.js',
    'node_modules/@react-pdf/textkit/lib/textkit.browser.cjs.js',
    'node_modules/@react-pdf/textkit/lib/textkit.browser.es.js'
];
textkitFiles.forEach(file => {
    replaceInFile(file, [
        [/font\.unitsPerEm !== lastFont(?:\?)?\.unitsPerEm/g, 'font?.unitsPerEm !== lastFont?.unitsPerEm'],
        [/lastFontSize \/ lastFont\.unitsPerEm/g, 'lastFontSize / (lastFont?.unitsPerEm || 1000)'],
        [/fontSize \/ lastFont\.unitsPerEm/g, 'fontSize / (lastFont?.unitsPerEm || 1000)'],
        [/if \(lastIndex < string\.length\) \{\n        const fontSize = getFontSize\(last\(runs\)\);\n        res\.push\(\{\n            start: lastIndex,\n            end: string\.length,\n            attributes: \{\n                font: \[lastFont\],\n                scale: fontSize \/ \(lastFont\?\.unitsPerEm \|\| 1000\),\n            \},\n        \}\);\n    \}/g,
            `if (lastIndex < string.length && lastFont) {\n        const fontSize = getFontSize(last(runs));\n        res.push({\n            start: lastIndex,\n            end: string.length,\n            attributes: {\n                font: [lastFont],\n                scale: fontSize / (lastFont?.unitsPerEm || 1000),\n            },\n        });\n    }`],
        [/if \(addedGlyphs\.has\(glyph\.id\)\)/g, 'if (!glyph || addedGlyphs.has(glyph.id))']
    ]);
});

const pdfkitFiles = [
    'node_modules/@react-pdf/pdfkit/lib/pdfkit.js',
    'node_modules/@react-pdf/pdfkit/lib/pdfkit.browser.es.js',
    'node_modules/@react-pdf/pdfkit/lib/pdfkit.browser.cjs.js',
    'node_modules/@react-pdf/pdfkit/lib/pdfkit.browser.js'
];
pdfkitFiles.forEach(file => {
    replaceInFile(file, [
        [/this\.scale = 1000 \/ this\.font\.unitsPerEm;/g, 'this.scale = 1000 / (this.font?.unitsPerEm || 1000);'],
        [/const gid = this\.subset\.includeGlyph\(glyph\.id\);/g, 'if (!glyph) continue;\n      const gid = this.subset.includeGlyph(glyph.id);']
    ]);
});

const renderFiles = [
    'node_modules/@react-pdf/render/lib/index.js',
    'node_modules/@react-pdf/render/lib/render.browser.es.js',
    'node_modules/@react-pdf/render/lib/render.browser.cjs.js'
];
renderFiles.forEach(file => {
    replaceInFile(file, [
        [/const unitsPerEm = ctx\._font\.font\.unitsPerEm \|\| 1000;/g, 'const unitsPerEm = ctx._font?.font?.unitsPerEm || 1000;'],
        [/const gid = font\.subset\.includeGlyph\(glyph\.id\);/g, 'if (!glyph) continue;\n            const gid = font.subset.includeGlyph(glyph.id);'],
        [/res\.push\(\`00\$\{glyph\.id\.toString\(16\)\}\`\.slice\(-2\)\);/g, 'if (!glyph) continue;\n        res.push(`00${glyph.id.toString(16)}`.slice(-2));'],
        [/if \(glyph\.id === objectReplacement\.id/g, 'if (glyph && objectReplacement && glyph.id === objectReplacement.id']
    ]);
});

console.log('Patched correctly!');
