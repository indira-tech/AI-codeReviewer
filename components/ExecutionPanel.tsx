import React from 'react';

interface ExecutionPanelProps {
  language: string;
  sampleInput: string;
  setSampleInput: (input: string) => void;
  onRun: () => void;
  isLoading: boolean;
  output: string;
  error: string;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  language,
  sampleInput,
  setSampleInput,
  onRun,
  isLoading,
  output,
  error,
}) => {
  const isJsSelected = language === 'javascript' || language === 'auto';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-4 flex flex-col gap-4 h-full">
      <div className="border-b border-gray-700 pb-2">
        <h2 className="text-xl font-bold text-gray-300">Run Code</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="flex flex-col">
          <label htmlFor="sample-input" className="block text-sm font-medium text-gray-400 mb-2">
            Sample Input (available as 'input' variable)
          </label>
          <textarea
            id="sample-input"
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            placeholder="Provide any input for your code here..."
            className="w-full flex-grow bg-gray-900 text-gray-300 font-mono p-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 resize-y"
          />
        </div>
        <div className="flex flex-col">
           <label className="block text-sm font-medium text-gray-400 mb-2">
            Execution Output
          </label>
          <pre className="w-full flex-grow bg-gray-900 text-gray-300 font-mono p-2 rounded-md border border-gray-600 overflow-auto">
            {isLoading ? 'Executing...' : (error ? <span className="text-red-400">{error}</span> : output || <span className="text-gray-500">Output from console.log() or a return value will appear here...</span>)}
          </pre>
        </div>
      </div>
      <div className="flex justify-end items-center mt-auto pt-4 border-t border-gray-700">
        <div className="relative group">
           <button
            onClick={onRun}
            disabled={isLoading || !isJsSelected}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running</span>
              </>
            ) : (
               <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                </svg>
                <span>Run Code</span>
               </>
            )}
          </button>
          {!isJsSelected && (
             <div className="absolute bottom-full mb-2 w-max px-2 py-1 text-sm bg-gray-900 text-gray-200 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Execution is only supported for JavaScript.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionPanel;