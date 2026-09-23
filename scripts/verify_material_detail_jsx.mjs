import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/pages/MaterialDetail/MaterialDetail.jsx');
const code = fs.readFileSync(filePath, 'utf8');

console.log('Parsing MaterialDetail.jsx AST...');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

const declaredGlobals = new Set([
  'window', 'document', 'navigator', 'console', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'Math', 'String', 'Number', 'Boolean', 'Array',
  'Object', 'Date', 'RegExp', 'Error', 'TypeError', 'ReferenceError', 'Promise',
  'JSON', 'encodeURIComponent', 'decodeURIComponent', 'parseInt', 'parseFloat',
  'Set', 'Map', 'sessionStorage', 'localStorage', 'alert', 'confirm', 'prompt',
  'import', 'process'
]);

const scopeStack = [new Set(declaredGlobals)];

function currentScope() {
  return scopeStack[scopeStack.length - 1];
}

const undeclaredUsed = new Set();

traverse(ast, {
  Scope: {
    enter(path) {
      const newScope = new Set();
      for (const name in path.scope.bindings) {
        newScope.add(name);
      }
      scopeStack.push(newScope);
    },
    exit() {
      scopeStack.pop();
    }
  },
  Identifier(path) {
    // Check if it is a variable usage
    if (
      !path.isReferencedIdentifier()
    ) return;

    const name = path.node.name;

    // Check if declared in any enclosing scope
    let found = false;
    for (let i = scopeStack.length - 1; i >= 0; i--) {
      if (scopeStack[i].has(name)) {
        found = true;
        break;
      }
    }

    if (!found) {
      undeclaredUsed.add(name);
    }
  },
  JSXIdentifier(path) {
    if (path.parent.type === 'JSXOpeningElement' && path.parent.name === path.node) {
      const name = path.node.name;
      if (/^[A-Z]/.test(name)) {
        let found = false;
        for (let i = scopeStack.length - 1; i >= 0; i--) {
          if (scopeStack[i].has(name)) {
            found = true;
            break;
          }
        }
        if (!found) {
          undeclaredUsed.add(name);
        }
      }
    }
  }
});

console.log('\n=== UNDECLARED IDENTIFIERS FOUND IN MaterialDetail.jsx ===');
if (undeclaredUsed.size === 0) {
  console.log('NONE! All identifiers are declared!');
} else {
  undeclaredUsed.forEach(name => console.log('UNDECLARED:', name));
}
