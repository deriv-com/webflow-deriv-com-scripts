const fs = require('fs');
const path = require('path');

const MINIMUM_UNDICI = [6, 29, 1];

function isOlderThan(version, minimum) {
  const parts = String(version).split('.').map((part) => Number.parseInt(part, 10));
  for (let index = 0; index < minimum.length; index += 1) {
    const current = Number.isFinite(parts[index]) ? parts[index] : 0;
    if (current !== minimum[index]) return current < minimum[index];
  }
  return false;
}

function patchBundledUndici() {
  const bundledPkgPath = path.resolve(__dirname, '../node_modules/npm/node_modules/undici/package.json');
  if (!fs.existsSync(bundledPkgPath)) return;

  const { version } = JSON.parse(fs.readFileSync(bundledPkgPath, 'utf8'));
  if (!isOlderThan(version, MINIMUM_UNDICI)) return;

  const topLevelUndici = path.resolve(__dirname, '../node_modules/undici');
  if (!fs.existsSync(topLevelUndici)) {
    console.warn('[postinstall] undici not found at top level, skipping bundled patch');
    return;
  }

  const bundledUndiciDir = path.resolve(__dirname, '../node_modules/npm/node_modules/undici');
  fs.rmSync(bundledUndiciDir, { recursive: true, force: true });
  fs.cpSync(topLevelUndici, bundledUndiciDir, { recursive: true });

  const { version: newVersion } = JSON.parse(fs.readFileSync(bundledPkgPath, 'utf8'));
  console.log(`[postinstall] Patched npm's bundled undici from ${version} to ${newVersion}`);
}

function patchShiftaiSimpleGit() {
  const hookPath = path.resolve(
    __dirname,
    '../node_modules/@deriv-com/shiftai-cli/lib/commands/hook.js'
  );
  if (!fs.existsSync(hookPath)) return;

  const source = fs.readFileSync(hookPath, 'utf8');
  const updated = source.replaceAll("require('simple-git')()", "require('simple-git').simpleGit()");
  if (updated === source) return;

  fs.writeFileSync(hookPath, updated);
  console.log('[postinstall] Updated ShiftAI for the simple-git 4 export');
}

patchBundledUndici();
patchShiftaiSimpleGit();
