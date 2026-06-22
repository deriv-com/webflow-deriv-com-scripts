const fs = require('fs');
const path = require('path');

const bundledPkgPath = path.resolve(__dirname, '../node_modules/npm/node_modules/undici/package.json');
if (!fs.existsSync(bundledPkgPath)) process.exit(0);

const { version } = JSON.parse(fs.readFileSync(bundledPkgPath, 'utf8'));
const [major, minor] = version.split('.').map(Number);
const isVulnerable = major < 6 || (major === 6 && minor < 27);
if (!isVulnerable) process.exit(0);

const topLevelUndici = path.resolve(__dirname, '../node_modules/undici');
if (!fs.existsSync(topLevelUndici)) {
  console.warn('[postinstall] undici not found at top level, skipping bundled patch');
  process.exit(0);
}

const bundledUndiciDir = path.resolve(__dirname, '../node_modules/npm/node_modules/undici');
fs.rmSync(bundledUndiciDir, { recursive: true, force: true });
fs.cpSync(topLevelUndici, bundledUndiciDir, { recursive: true });

const { version: newVersion } = JSON.parse(fs.readFileSync(bundledPkgPath, 'utf8'));
console.log(`[postinstall] Patched npm's bundled undici from ${version} to ${newVersion}`);
