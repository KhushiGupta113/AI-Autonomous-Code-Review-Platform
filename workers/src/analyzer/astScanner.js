const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const HARDCODED_CREDENTIALS_REGEX = /(password|secret|key|token|api_key)\s*[:=]\s*['"][a-zA-Z0-9\-_]{5,}['"]/i;

function parseCode(code, filePath) {
  const issues = [];
  const lines = code.split('\n');
  
  // 6. Large files (>300 lines)
  if (lines.length > 300) {
    issues.push({
      type: 'maintainability',
      file: filePath,
      line: 0,
      description: `Large file detected: ${lines.length} lines. Consider breaking it down.`
    });
  }

  // 5. Hardcoded credentials regex check
  code.split('\n').forEach((line, index) => {
    if (HARDCODED_CREDENTIALS_REGEX.test(line)) {
      issues.push({
        type: 'security',
        file: filePath,
        line: index + 1,
        description: 'Potential hardcoded credential detected.'
      });
    }
  });

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    traverse(ast, {
      // 1. Functions longer than 50 lines
      Function(path) {
        const startLine = path.node.loc.start.line;
        const endLine = path.node.loc.end.line;
        if (endLine - startLine > 50) {
          issues.push({
            type: 'complexity',
            file: filePath,
            line: startLine,
            description: `Function is too long (${endLine - startLine} lines). Keep functions under 50 lines.`
          });
        }
      },
      // 2. Nested loops > depth 3
      Loop(path) {
        let depth = 1;
        let parent = path.parentPath;
        while (parent) {
          if (parent.isLoop()) depth++;
          parent = parent.parentPath;
        }
        if (depth > 3) {
          issues.push({
            type: 'performance',
            file: filePath,
            line: path.node.loc.start.line,
            description: `Highly nested loop detected (depth: ${depth}). This may impact performance.`
          });
        }
      },
      // 4. Unused variables (basic naive check to show concept)
      VariableDeclarator(path) {
        // A full scope check requires more advanced traversal, simplified for prototype
        if (path.node.id.type === 'Identifier') {
           const binding = path.scope.getBinding(path.node.id.name);
           if (binding && !binding.referenced && binding.kind !== 'param') {
              issues.push({
                type: 'bug',
                file: filePath,
                line: path.node.loc.start.line,
                description: `Unused variable detected: '${path.node.id.name}'`
              });
           }
        }
      }
    });
    
    // Note: 3. Duplicate code blocks - implemented by hashing AST nodes in a real app,
    // omitted here for brevity as it's complex, will be supplemented by LLM analysis.

  } catch (err) {
    // Ignore files that fail to parse
    console.error(`Failed to parse ${filePath}: ${err.message}`);
  }

  return issues;
}

module.exports = { parseCode };
