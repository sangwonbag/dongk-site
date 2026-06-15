const { execSync } = require('child_process');

try {
    const files = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
    const filtered = files.filter(f => {
        const decoded = f.replace(/\\(\d{3})/g, (match, octal) => {
            return String.fromCharCode(parseInt(octal, 8));
        });
        const name = Buffer.from(decoded, 'binary').toString('utf8');
        return name.includes('제일') || name.includes('DID') || name.includes('jeil') || name.includes('did');
    });
    console.log('Filtered Jeil/DID files count:', filtered.length);
    filtered.forEach(f => {
        const decoded = f.replace(/\\(\d{3})/g, (match, octal) => {
            return String.fromCharCode(parseInt(octal, 8));
        });
        console.log(Buffer.from(decoded, 'binary').toString('utf8'));
    });
} catch (e) {
    console.error(e);
}
