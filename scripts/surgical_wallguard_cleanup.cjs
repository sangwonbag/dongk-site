const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'data', 'materials.db.js');
const backupPath = filePath + '.bak';

try {
    const code = fs.readFileSync(filePath, 'utf8');
    fs.writeFileSync(backupPath, code);
    console.log('Backup created at ' + backupPath);

    const listNames = [
        'LIST_SHINHAN_IRIS',
        'LIST_SHINHAN_PINEHEIM',
        'LIST_SHINHAN_SKETCH',
        'LIST_SHINHAN_LIVING',
        'LIST_SHINHAN_FACADE',
        'LIST_SHINHAN_FIRE_RETARDANT'
    ];

    let newCode = code;

    listNames.forEach(name => {
        // Correcting regex to use standard escapes in regex literal
        const regex = new RegExp('(const|let|var|export\\s+const)\\s+' + name + '\\s*=\\s*\\[([\\s\\S]*?)\\];', 'g');
        newCode = newCode.replace(regex, (match, prefix, content) => {
            const items = content.split('},').map(s => s.trim()).filter(s => s.length > 0);
            
            const filteredItems = items.filter(item => {
                const isWallguard = /id\s*:\s*["']W\d+/i.test(item) || /code\s*:\s*["']W\d+/i.test(item);
                if (isWallguard) {
                    // console.log(`Removing Wallguard from ${name}: ${item.substring(0, 50)}...`);
                    return false;
                }
                return true;
            });

            if (filteredItems.length === items.length) return match;

            console.log(`Cleaned ${items.length - filteredItems.length} Wallguard items from ${name}`);
            const reconstructedContent = filteredItems.map(item => '  ' + item + '}').join(',\n');
            return `${prefix} ${name} = [\n${reconstructedContent}\n];`;
        });
    });

    // Ensure LIST_SHINHAN_WALLGUARD has materialType: "실크"
    const wallguardRegex = /(const|let|var|export\s+const)\s+LIST_SHINHAN_WALLGUARD\s*=\s*\[([\s\S]*?)\];/g;
    newCode = newCode.replace(wallguardRegex, (match, prefix, content) => {
        const items = content.split('},').map(s => s.trim()).filter(s => s.length > 0);
        const fixedItems = items.map(item => {
            if (item.includes('materialType:')) {
                return item.replace(/materialType\s*:\s*["'][^"']+["']/, 'materialType: "실크"');
            }
            return item;
        });
        const reconstructedContent = fixedItems.map(item => '  ' + item + '}').join(',\n');
        return `${prefix} LIST_SHINHAN_WALLGUARD = [\n${reconstructedContent}\n];`;
    });

    fs.writeFileSync(filePath, newCode);
    console.log('materials.db.js has been surgically cleaned.');

} catch (err) {
    console.error('Error during surgical fix:');
    console.error(err);
    process.exit(1);
}
