try {
    const db = await import('./src/data/materials.db.js');
    console.log('Keys in db:', Object.keys(db));
    console.log('materials count:', db.materials ? db.materials.length : 'undefined');
    if (db.materials && db.materials.length > 0) {
        // console.log('First material:', JSON.stringify(db.materials[0], null, 2));
    } else {
        console.error('materials array is empty or undefined!');
    }
} catch (err) {
    console.error('IMPORT ERROR:', err);
    process.exit(1);
}
