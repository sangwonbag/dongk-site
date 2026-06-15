const { execSync } = require('child_process');

try {
    const output = execSync('git log --all --name-only --format=', { encoding: 'utf8' });
    const lines = output.split('\n');
    console.log('Total lines in log:', lines.length);
    const matches = new Set();
    lines.forEach(f => {
        const decoded = f.replace(/\\(\d{3})/g, (match, octal) => {
            return String.fromCharCode(parseInt(octal, 8));
        });
        const name = Buffer.from(decoded, 'binary').toString('utf8');
        if (name.includes('제일') || name.includes('DID') || name.includes('jeil') || name.includes('did')) {
            matches.add(name);
        }
    });
    console.log('Matched files in git history:', Array.from(matches));
} catch (e) {
    console.error(e);
}
