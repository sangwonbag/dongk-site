const fs = require('fs');
const code = fs.readFileSync('scripts/build_materials_db.cjs', 'utf-8');
const testScript = code + "\nconsole.log(applyRules('장판', 'LX', '', 'test', 'test', 'id', 'code', 'LX하우시스_엑스컴포트_5.0T'));";
fs.writeFileSync('temp_run.cjs', testScript);
