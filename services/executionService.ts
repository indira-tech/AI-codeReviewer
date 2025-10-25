// This service uses a Web Worker to execute user code in a sandboxed environment.

const workerCode = `
  self.onmessage = function(e) {
    const { code, input } = e.data;
    const output = [];
    
    // Keep a reference to the original console.log
    const originalConsoleLog = console.log;

    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular Reference]";
          }
          seen.add(value);
        }
        return value;
      };
    };

    // Override console.log to capture output
    console.log = (...args) => {
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, getCircularReplacer(), 2);
          } catch (e) {
            return '[Unserializable Object]';
          }
        }
        return String(arg);
      });
      output.push(formattedArgs.join(' '));
    };

    // --- SECURITY HARDENING: Disable network access from the worker ---
    const networkAccessDisabledError = new Error("Security: Network access is disabled in this execution environment.");
    self.fetch = () => Promise.reject(networkAccessDisabledError);
    self.XMLHttpRequest = function() { throw networkAccessDisabledError; };
    self.importScripts = function() { throw new Error("Security: importScripts is disabled."); };
    // ---

    try {
      let finalCode = code.trim();
      
      if (finalCode) {
        const lines = finalCode.split('\\n');
        const lastLine = lines[lines.length - 1].trim();
        
        const statementKeywords = [
          'var', 'let', 'const', 'return', 'if', 'for', 'while', 'switch', 
          'function', 'class', 'console.', 'throw', 'try', 'catch', 'debugger', 'import', 'export'
        ];
        
        const isLikelyExpression = 
          lastLine &&
          !statementKeywords.some(kw => lastLine.startsWith(kw)) &&
          !lastLine.endsWith('{') &&
          !lastLine.endsWith('}') &&
          !lastLine.endsWith(';');

        if (isLikelyExpression) {
          lines[lines.length - 1] = \`return (\${lastLine})\`;
          finalCode = lines.join('\\n');
        }
      }
      
      const userFunction = new Function('input', finalCode);
      const result = userFunction(input);

      if (result !== undefined) {
         try {
            output.push('Return value: ' + JSON.stringify(result, getCircularReplacer(), 2));
         } catch (e) {
            output.push('Return value: [Unserializable Object]');
         }
      }
    } catch (error) {
      if (error instanceof Error) {
        output.push('Error: ' + error.message);
      } else {
        output.push('An unknown error occurred during execution.');
      }
    } finally {
      // Restore original console.log
      console.log = originalConsoleLog;
      // Send the captured output back to the main thread
      self.postMessage(output.join('\\n'));
    }
  };
`;

export function executeJavaScript(code: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('Execution timed out after 5 seconds. This might be due to an infinite loop.'));
    }, 5000);

    worker.onmessage = (e: MessageEvent<string>) => {
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(e.data);
    };

    worker.onerror = (e: ErrorEvent) => {
      clearTimeout(timeoutId);
      worker.terminate();
      reject(new Error('An error occurred in the execution worker: ' + e.message));
    };

    worker.postMessage({ code, input });
  });
}