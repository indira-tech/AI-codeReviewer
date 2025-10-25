import { Review } from "../App";

export function analyzeCodeOffline(code: string, language: string): Review {
  const syntaxErrors = findSyntaxErrors(code);
  const staticIssues = findStaticIssues(code, language);
  const advancedErrors = checkAdvancedErrors(code, language);
  const complexityAnalysis = analyzeComplexity(code);
  const unitTestScaffold = generateUnitTestScaffold(code, language);

  const allErrors = [syntaxErrors, staticIssues, advancedErrors].filter(Boolean);
  const issuesFound = allErrors.length;
  
  let detailed = "### Offline Analysis\nThis is a basic analysis performed while offline. For a comprehensive review, please connect to the internet.\n\n";
  
  if (issuesFound > 0) {
    detailed += `### Identified Issues\n${allErrors.join('\n\n')}\n`;
  }
  
  if (complexityAnalysis) detailed += `### Time Complexity Analysis\n${complexityAnalysis}\n`;
  if (unitTestScaffold) detailed += unitTestScaffold;

  if (issuesFound === 0 && !unitTestScaffold) {
    detailed += "\nYour code looks good based on this basic offline check.";
  }
  
  // Build the richer summary
  let summary = `📝 **Code Purpose:** An offline analysis was performed on this snippet.\n`;
  summary += `- 🐞 **Critical Issues:** ${issuesFound} potential issue(s) found.\n`;
  summary += `- ⏳ **Complexity:** ${complexityAnalysis.split('\n')[0].replace('- **Time Complexity:**','').trim()}`;
  

  return { summary, detailed };
}

function findSyntaxErrors(code: string): string {
    let errors: string[] = [];
    const lines = code.split('\n');

    const stack: { char: string; line: number }[] = [];
    const bracketPairs: { [key: string]: string } = { '(': ')', '[': ']', '{': '}' };
    lines.forEach((line, index) => {
        for (const char of line) {
            if (bracketPairs[char]) stack.push({ char, line: index + 1 });
            else if (Object.values(bracketPairs).includes(char)) {
                if (stack.length === 0) errors.push(`- Unmatched closing bracket \`${char}\` on line ${index + 1}.`);
                else {
                    const lastOpen = stack.pop();
                    if (lastOpen && bracketPairs[lastOpen.char] !== char) errors.push(`- Mismatched bracket: \`${lastOpen.char}\` on line ${lastOpen.line} closed by \`${char}\` on line ${index + 1}.`);
                }
            }
        }
    });
    if (stack.length > 0) errors.push(`- Unclosed opening bracket \`${stack[stack.length - 1].char}\` from line ${stack[stack.length-1].line}.`);

    lines.forEach((line, index) => {
        if ((line.match(/'/g) || []).length % 2 !== 0) errors.push(`- Potentially unterminated single-quoted string on line ${index + 1}.`);
        if ((line.match(/"/g) || []).length % 2 !== 0) errors.push(`- Potentially unterminated double-quoted string on line ${index + 1}.`);
    });

    return errors.length > 0 ? `**Syntax Errors Detected**\n${errors.join('\n')}`: '';
}

function findStaticIssues(code: string, language: string): string {
    let issues: string[] = [];
    code.split('\n').forEach((line, i) => {
        if (line.length > 120) issues.push(`- Line ${i + 1} is longer than 120 characters.`);
        if (['javascript', 'typescript', 'auto'].includes(language) && /console\.log/.test(line)) issues.push(`- Debug statement \`console.log\` found on line ${i + 1}.`);
        if (/\/\/\s*TODO/i.test(line) || /#\s*TODO/i.test(line)) issues.push(`- TODO comment found on line ${i + 1}.`);
    });
    return issues.length > 0 ? `**Static Issues Found**\n${issues.join('\n')}`: '';
}

function generatePlausibleInput(param: string, language: string): string {
    param = param.toLowerCase().trim().replace(/_/g, ''); // Normalize snake_case
    const isPython = language === 'python';

    // Specific keywords first
    if (param.includes('email')) return '"test@example.com"';
    if (param.includes('url') || param.includes('uri')) return '"https://example.com"';
    if (param.includes('password')) return '"s3cr3tP@ssw0rd!"';
    if (param.includes('date')) return '"2024-01-01"';
    if (param.includes('name')) return '"Alice"';
    if (param.includes('age')) return '30';
    if (param.includes('count') || param.includes('limit') || param.includes('length')) return '10';
    if (param.includes('id')) return '123';
    
    // General types based on keywords or prefixes/suffixes
    if (param.includes('arr') || param.includes('list') || param.endsWith('s')) {
        return isPython ? '[1, 2, 3]' : '[1, 2, 3]';
    }
    if (param.includes('str') || param.includes('text') || param.includes('message')) return '"sample string"';
    if (param.includes('num') || param.includes('value')) return '42';
    if (param.includes('user') || param.includes('obj') || param.includes('data') || param.includes('config')) {
        return isPython ? '{"id": 1, "name": "test"}' : '{ id: 1, name: "test" }';
    }
    if (param.includes('bool') || param.startsWith('is') || param.startsWith('has')) {
        return isPython ? 'True' : 'true';
    }
    
    // Default fallback
    return isPython ? '"some_value"' : 'someValue';
}

function generateEdgeCaseInput(param: string, language: string): string {
    param = param.toLowerCase().trim().replace(/_/g, ''); // Normalize snake_case
    const isPython = language === 'python';
    
    // Specific keywords first
    if (param.includes('email') || param.includes('url') || param.includes('str') || param.includes('text') || param.includes('name') || param.includes('password')) return '""';
    if (param.includes('age') || param.includes('count')) return '0';
    if (param.includes('limit') || param.includes('length')) return '-1'; // Negative or invalid number
    if (param.includes('id') || param.includes('date')) return isPython ? 'None' : 'null';

    // General types
    if (param.includes('arr') || param.includes('list') || param.endsWith('s')) return '[]';
    if (param.includes('num') || param.includes('value')) return '0';
    if (param.includes('user') || param.includes('obj') || param.includes('data') || param.includes('config')) {
        return isPython ? 'None' : 'null';
    }
    if (param.includes('bool') || param.startsWith('is') || param.startsWith('has')) {
        return isPython ? 'False' : 'false';
    }
    
    // Default fallback
    return isPython ? 'None' : 'null';
}

function generatePlaceholderOutput(funcName: string, language: string): string {
    const fn = funcName.toLowerCase();
    const isPython = language === 'python';

    if (fn.startsWith('is') || fn.startsWith('has') || fn.startsWith('should')) {
        return isPython ? 'True' : 'true';
    }
    if (fn.includes('sum') || fn.includes('count') || fn.includes('calculate') || fn.includes('total')) {
        return '100'; // A sample number
    }
    if (fn.includes('get') || fn.includes('find')) {
        return isPython ? '{"id": 1, "name": "test_user"}' : '{ id: 1, name: "test_user" }';
    }
    if (fn.includes('create') || fn.includes('add')) {
        return isPython ? '{"status": "success"}' : '{ status: "success" }';
    }
    if (fn.includes('string') || fn.includes('name') || fn.includes('greet')) {
        return '"expected_string"';
    }
    return '"expected_output"';
}

function generateUnitTestScaffold(code: string, language: string): string {
    const jsTsRegex = /(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*(?:=|\()\s*\(([^)]*)\)/g;
    const pythonRegex = /def\s+(\w+)\s*\(([^)]*)\):/g;
    const regex = language === 'python' ? pythonRegex : jsTsRegex;
    const functions = [...code.matchAll(regex)].slice(0, 3);

    if (functions.length === 0) return "";
    let testCases = '';
    const isPython = language === 'python';

    functions.forEach((match, index) => {
        const funcName = match[1];
        const params = match[2].split(',').map(p => p.trim().split('=')[0]).filter(Boolean); // handle default params
        const plausibleInputs = params.map(p => generatePlausibleInput(p, language)).join(', ');
        const edgeCaseInputs = params.map(p => generateEdgeCaseInput(p, language)).join(', ');

        const placeholderOutput = generatePlaceholderOutput(funcName, language);
        let edgePlaceholder: string;
        if (placeholderOutput === (isPython ? 'True' : 'true')) {
            edgePlaceholder = isPython ? 'False' : 'false';
        } else if (placeholderOutput === '100') {
            edgePlaceholder = '0';
        } else if (placeholderOutput.startsWith('{')) {
            edgePlaceholder = isPython ? 'None' : 'null';
        } else {
            edgePlaceholder = '"expected_for_edge_case"';
        }

        switch (language) {
            case 'python':
                if (index === 0) testCases += `import unittest\n\nclass TestMyCode(unittest.TestCase):\n`;
                testCases += `    def test_${funcName}_basic_case(self):\n        # TODO: Verify the expected output\n        self.assertEqual(${funcName}(${plausibleInputs}), ${placeholderOutput})\n\n`;
                testCases += `    def test_${funcName}_edge_case(self):\n        # TODO: Verify the expected output for edge cases\n        self.assertEqual(${funcName}(${edgeCaseInputs}), ${edgePlaceholder})\n\n`;
                break;
            default: // JS/TS
                testCases += `describe('${funcName}', () => {\n`;
                testCases += `  test('should handle a basic case correctly', () => {\n    // TODO: Verify the expected output\n    const expectedOutput = ${placeholderOutput}; \n    expect(${funcName}(${plausibleInputs})).toBe(expectedOutput);\n  });\n\n`;
                testCases += `  test('should handle an edge case', () => {\n    // TODO: Verify the expected output for edge cases\n    const expectedOutput = ${edgePlaceholder}; \n    expect(${funcName}(${edgeCaseInputs})).toBe(expectedOutput);\n  });\n});\n\n`;
                break;
        }
    });
    if (language === 'python' && testCases) testCases += `if __name__ == '__main__':\n    unittest.main()`;
    return `### Unit Tests\nHere is a basic scaffold to get you started with unit testing. For complete, AI-generated tests, please use the online mode.\n\n\`\`\`${language}\n${testCases.trim()}\n\`\`\``;
}

function analyzeComplexity(code: string): string {
    let maxNesting = 0; let currentNesting = 0; let hasRecursion = false;
    const functionNameRegex = /(?:function\s+|def\s+)(\w+)\s*\(/;
    const functionNames = code.split('\n').map(line => line.match(functionNameRegex)?.[1]).filter(Boolean);
    if (functionNames.length > 0) {
        for (const name of functionNames) {
            if ((code.match(new RegExp(`\\b${name}\\s*\\(`, 'g')) || []).length > 1) { hasRecursion = true; break; }
        }
    }
    code.split('\n').forEach(line => {
        if (/\s*(for|while)\s*\(/.test(line)) currentNesting++;
        if (line.includes("}")) currentNesting = Math.max(0, currentNesting - (line.match(/}/g) || []).length);
        maxNesting = Math.max(maxNesting, currentNesting);
    });

    let complexity = "O(1)";
    if (hasRecursion) complexity = "Potentially O(2^n) or O(n) (recursion)";
    else if (maxNesting > 0) complexity = `O(n^${maxNesting}) (loop nesting)`;
    else if (code.length > 100 && ['.map(', '.filter(', '.reduce(', '.forEach(', '.sort('].some(m => code.includes(m))) complexity = "O(n) or O(n log n) (array methods)";
    
    return `- **Time Complexity:** ${complexity}\n- **Space Complexity:** Hard to estimate offline; depends on input size.`;
}

function inferType(value: string, knownTypes: Map<string, string>): string {
    value = value.trim();
    if (knownTypes.has(value)) return knownTypes.get(value)!;
    if (/^".*"$/.test(value) || /^'.*'$/.test(value) || /^`.*`$/.test(value)) return 'string';
    if (!isNaN(parseFloat(value)) && isFinite(Number(value))) return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    if (value === 'null' || value === 'undefined') return 'null';
    if (/^\{.*\}$/.test(value) || /^\[.*\]$/.test(value)) return 'object';
    if (/^\(.*\)\s*=>/.test(value) || value.startsWith('function')) return 'function';
    return 'any';
}

function checkAdvancedErrors(code: string, language: string): string {
    if (!['javascript', 'typescript', 'auto'].includes(language)) return '';
    const errors: string[] = [];
    const functionSignatures = new Map<string, number>();
    const variableTypes = new Map<string, string>();
    const lines = code.split('\n');

    lines.forEach(line => {
        let match = line.match(/(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*(?:=|\()\s*\(([^)]*)\)/);
        if (match) {
            const name = match[1]; const params = match[2];
            functionSignatures.set(name, params.trim() ? params.split(',').length : 0);
            variableTypes.set(name, 'function');
        }
        match = line.match(/(?:let|const|var)\s+(\w+)\s*=\s*(.+)/);
        if (match && !/=>/.test(line)) {
            const name = match[1];
            if (!variableTypes.has(name)) variableTypes.set(name, inferType(match[2].replace(';', '').trim(), variableTypes));
        }
    });

    lines.forEach((line, index) => {
        const callMatches = line.matchAll(/(?<!\bif|\bfor|\bwhile|\bswitch|\bcatch|\breturn)\b(\w+)\s*\(([^)]*)\)/g);
        for (const callMatch of callMatches) {
            const name = callMatch[1];
            if (functionSignatures.has(name)) {
                const args = callMatch[2].trim() ? callMatch[2].split(',').length : 0;
                const expectedArgs = functionSignatures.get(name)!;
                if (args !== expectedArgs) errors.push(`- Line ${index + 1}: \`${name}\` called with ${args} arguments, but expected ${expectedArgs}.`);
            }
        }
        const assignMatch = line.match(/^\s*(\w+)\s*=\s*(.+)/);
        if (assignMatch) {
            const name = assignMatch[1];
            const value = assignMatch[2].replace(';', '').trim();
            if (variableTypes.has(name)) {
                const originalType = variableTypes.get(name)!;
                const newType = inferType(value, variableTypes);
                if (originalType !== 'any' && newType !== 'any' && originalType !== newType) {
                    errors.push(`- Line ${index + 1}: \`${name}\` type changed from \`${originalType}\` to \`${newType}\`.`);
                }
                variableTypes.set(name, newType);
            }
        }
    });

    return errors.length > 0 ? `**Potential Logic Errors**\n${errors.join('\n')}` : '';
}