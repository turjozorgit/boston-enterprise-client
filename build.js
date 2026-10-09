const fs = require('node:fs');
fs.rmSync('dist', { recursive: true, force: true });
fs.cpSync('public', 'dist', { recursive: true });
const adminPath = 'dist/admin.html';
if (fs.existsSync(adminPath)) {
  const admin = fs.readFileSync(adminPath, 'utf8');
  fs.writeFileSync(adminPath, admin.replace('</body>', '<script src="/admin-live.js"></script></body>'));
}
console.log('Built static site in dist/');
