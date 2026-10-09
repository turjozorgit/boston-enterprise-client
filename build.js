const fs = require('node:fs');
fs.rmSync('dist', { recursive: true, force: true });
fs.cpSync('public', 'dist', { recursive: true });
console.log('Built static site in dist/');
