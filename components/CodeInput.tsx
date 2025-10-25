import React, { useEffect, useRef } from 'react';
import { LANGUAGES, LanguageOption } from '../constants';
import { EXAMPLES } from '../examples';

declare const ace: any;

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onReview: () => void;
  onAddComments: () => void;
  isLoading: boolean;
  isCommenting: boolean;
  isOffline: boolean;
}

const EXTENSION_MAP: { [key: string]: string } = {
  js: 'javascript', mjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', java: 'java', cs: 'csharp', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp',
  go: 'go', rs: 'rust', rb: 'ruby', php: 'php', html: 'html', htm: 'html', css: 'css',
  sql: 'sql', sh: 'shell', bash: 'shell', zsh: 'shell', json: 'json', yml: 'yaml',
  yaml: 'yaml', md: 'markdown',
};

const CodeInput: React.FC<CodeInputProps> = ({
  code, setCode, language, setLanguage, onReview, onAddComments,
  isLoading, isCommenting, isOffline,
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof ace !== 'undefined' && !editorRef.current) {
      const editor = ace.edit(containerRef.current);
      editor.setTheme("ace/theme/twilight");
      editor.session.setMode("ace/mode/javascript");
      editor.setValue(code, -1);
      
      editor.on("change", () => {
        if (editor.getValue() !== code) {
            setCode(editor.getValue());
        }
      });
      editorRef.current = editor;
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const newMode = language === 'auto' ? 'javascript' : language;
      editorRef.current.session.setMode(`ace/mode/${newMode}`);
      if (editorRef.current.getValue() !== code) {
          const cursorPos = editorRef.current.getCursorPosition();
          editorRef.current.setValue(code, -1);
          editorRef.current.moveCursorToPosition(cursorPos);
      }
    }
  }, [language, code]);

  const handleLoadExample = () => {
    if (language !== 'auto' && EXAMPLES[language]) setCode(EXAMPLES[language]);
  };
  
  const handleFileButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCode(text);
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && EXTENSION_MAP[extension]) setLanguage(EXTENSION_MAP[extension]);
    };
    reader.onerror = () => alert("Error: Could not read the selected file.");
    reader.readAsText(file);
    event.target.value = ''; 
  };

  return (
    <div className="bg-slate-800/40 rounded-lg border border-slate-700/80 shadow-lg p-6 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-300">Enter Your Code</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="language-select" className="text-sm font-medium text-slate-400">Language:</label>
          <select
            id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block p-2">
            {LANGUAGES.map((lang: LanguageOption) => (<option key={lang.value} value={lang.value}>{lang.label}</option>))}
          </select>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={Object.keys(EXTENSION_MAP).map(e => `.${e}`).join(',')} />
          <button onClick={handleFileButtonClick} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm">Upload File</button>
          <button onClick={handleLoadExample} disabled={language === 'auto'} className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm">Load Example</button>
        </div>
      </div>
      <div ref={containerRef} className="w-full h-96 rounded-md border border-slate-600 focus-within:ring-2 focus-within:ring-sky-500" />
      <div className="flex justify-end items-center gap-3">
        <button
          onClick={onAddComments}
          disabled={isLoading || isCommenting || !code.trim() || isOffline}
          className="bg-gray-600 hover:bg-gray-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-300 flex items-center space-x-2"
          title={isOffline ? "Commenting is disabled in offline mode" : ""}
        >
          {isCommenting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Commenting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <span>Add Comments</span>
            </>
          )}
        </button>
        <button
          onClick={onReview}
          disabled={isLoading || isCommenting || !code.trim()}
          className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>Reviewing...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 15m0 0l-.813-.904M9.813 15.904L10.627 15m-1.627.904c1.296.867 3.03.867 4.326 0m-2.163-.904c1.296-.867 3.03-.867 4.326 0m-2.163.904V18m0-3.375c.345-.23.636-.508.875-.813M12 18c-3.142 0-6-2.583-6-5.75s2.858-5.75 6-5.75 6 2.583 6 5.75-2.858 5.75-6 5.75z" /></svg>
              <span>{isOffline ? 'Run Offline Analysis' : 'Review Code'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CodeInput;