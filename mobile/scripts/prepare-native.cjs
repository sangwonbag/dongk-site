/**
 * Create Capacitor Android/iOS projects and branded store artwork.
 * Orders, products, profiles, checkout all live on https://dkfloor.co.kr.
 */
const { existsSync, mkdirSync } = require('node:fs');
const { join, resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');
const platform = process.argv[2];
if (!['android', 'ios'].includes(platform)) {
  console.error('Usage: node scripts/prepare-native.cjs android|ios');
  process.exit(2);
}
const cwd = resolve(__dirname, '..');
const root = resolve(cwd, '..');
const assets = join(cwd, 'assets');
const icon = join(root, 'public', 'dk-app-icon-512.png');
function run(cmd, args, dir = cwd) {
  execFileSync(cmd, args, { cwd: dir, stdio: 'inherit' });
}
async function prepare() {
  run(process.execPath, [join(root, 'scripts', 'generate-pwa-icons.cjs')], root);
  if (!existsSync(icon)) throw Error('DK Floor icon missing: ' + icon);
  mkdirSync(assets, { recursive: true });
  const branded = await sharp(icon).resize(1024,1024)
    .flatten({ background: '#171717' }).png().toBuffer();
  for (const name of ['icon-only.png','icon-foreground.png']) {
    await sharp(branded).toFile(join(assets, name));
  }
  await sharp({create:{width:1024,height:1024,channels:4,background:'#171717'}})
    .png().toFile(join(assets,'icon-background.png'));
  const small = await sharp(icon).resize(520,520).png().toBuffer();
  for (const [name,bg] of [['splash.png','#ffffff'],['splash-dark.png','#171717']]) {
    await sharp({create:{width:2732,height:2732,channels:4,background:bg}})
      .composite([{input:small,left:1106,top:1106}])
      .png().toFile(join(assets,name));
  }
  if (!existsSync(join(cwd,platform))) run('npx',['cap','add',platform]);
  run('npx',['cap','sync',platform]);
  run('npx',['capacitor-assets','generate','--'+platform]);
  console.log('DK Floor '+platform+' native project prepared.');
}
prepare().catch(err => {console.error(err);process.exit(1)});
