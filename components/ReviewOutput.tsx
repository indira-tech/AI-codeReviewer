import React, { useRef } from 'react';
import { Review } from '../App';
import Loader from './Loader';

declare const marked: any;
declare const DOMPurify: any;
declare const html2canvas: any;
declare const jspdf: any;

// SVG Icon Components
const BugIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-3-5v5m-3-8v8M9 20h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L15 12l-1.293-1.293a1 1 0 010-1.414L15 8l1.293 1.293a1 1 0 010 1.414L15 12m0 0l-2.293 2.293a1 1 0 01-1.414 0L9 12l2.293-2.293a1 1 0 011.414 0L15 12z" /></svg>);
const BeakerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>);
const InfoIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const CodeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
const ClockIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const sectionStyles: { [key: string]: { card: string; header: string; title: string; icon: React.ReactNode; } } = {
  'Identified Bugs and Errors': { card: 'bg-red-900/20 border-red-500/30', header: 'bg-red-500/10 border-b border-red-500/30', title: 'text-red-300', icon: <BugIcon /> },
  'Time Complexity Analysis': { card: 'bg-indigo-900/20 border-indigo-500/30', header: 'bg-indigo-500/10 border-b border-indigo-500/30', title: 'text-indigo-300', icon: <ClockIcon /> },
  'Actionable Improvements & Best Practices': { card: 'bg-violet-900/20 border-violet-500/30', header: 'bg-violet-500/10 border-b border-violet-500/30', title: 'text-violet-300', icon: <SparklesIcon /> },
  'Overall Score': { card: 'bg-sky-900/20 border-sky-500/30', header: 'bg-sky-500/10 border-b border-sky-500/30', title: 'text-sky-300', icon: <InfoIcon /> },
  'Unit Tests': { card: 'bg-green-900/20 border-green-500/30', header: 'bg-green-500/10 border-b border-green-500/30', title: 'text-green-300', icon: <BeakerIcon /> },
};
const defaultStyle = { card: 'bg-slate-700/20 border-slate-500/30', header: 'bg-slate-500/10 border-b border-slate-500/30', title: 'text-slate-300', icon: <CodeIcon /> };

interface ReviewOutputProps { review: Review | null; isLoading: boolean; error: string; }

const parseDetailedReview = (markdown: string) => {
    if (!markdown) return [];
    const sections = markdown.split(/(?=###\s)/g).filter(s => s.trim() !== '');
    return sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0].replace('###', '').trim();
        const content = lines.slice(1).join('\n').trim();
        return { id: index, title, content };
    }).filter(s => s.title && s.content);
};

const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error }) => {
  const getSanitizedHtml = (markdown: string): string => {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') return markdown;
    const rawHtml = marked.parse(markdown, { gfm: true, breaks: true });
    return DOMPurify.sanitize(rawHtml);
  };

  const handleExportPdf = async () => {
    if (!review || typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
      alert("PDF export functionality is not available or there is no review to export."); return;
    }
  
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px';
    reportContainer.style.width = '1024px';
    reportContainer.style.background = '#0f172a';
    document.body.appendChild(reportContainer);

    const detailedSections = parseDetailedReview(review.detailed);
    const reportHtml = `
    <div class="flex flex-col gap-4 p-12 text-slate-200 font-sans">
        <div class="text-center mb-8 border-b-2 border-slate-700 pb-6">
            <h1 class="text-4xl font-bold text-slate-100">AI Code Review Report</h1>
        </div>
        ${detailedSections.map(({ title, content }) => `
            <div class="mb-6 break-inside-avoid">
              <h2 class="text-2xl font-bold text-sky-400 mb-4 pb-2 border-b border-slate-700">${title}</h2>
              <div class="prose prose-invert max-w-none prose-base prose-pre:bg-slate-800 prose-pre:p-4 prose-pre:rounded-lg">
                ${getSanitizedHtml(content)}
              </div>
            </div>`).join('')}
    </div>`;

    reportContainer.innerHTML = reportHtml;
  
    try {
      const { jsPDF } = jspdf;
      const canvas = await html2canvas(reportContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight; let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`ai-code-review-report.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Sorry, there was an error exporting the PDF.");
    } finally {
      document.body.removeChild(reportContainer);
    }
  };

  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (error) {
      return (
        <div className="text-red-300 bg-red-900/20 p-4 rounded-md border border-red-700/50">
          <p className="font-bold">An Error Occurred</p><p className="mt-2 text-sm">{error}</p>
        </div>);
    }
    if (!review) {
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center text-slate-500">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-sky-500/10 rounded-full animate-pulse"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          <h3 className="mt-6 text-xl font-semibold text-slate-300">Ready for Review</h3>
          <p className="mt-2 max-w-sm">Enter your code in the editor, select the language, and click "Review Code" to let the AI analyze it for you.</p>
        </div>);
    }

    const detailedSections = parseDetailedReview(review.detailed);
    return (
      <div className="flex flex-col gap-6">
        <div className="border-b border-slate-700 pb-4 prose prose-invert max-w-none prose-lg" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(review.summary) }} />
        <div className="space-y-4">
            {detailedSections.map(({ id, title, content }) => {
                const styleKey = Object.keys(sectionStyles).find(key => title.includes(key));
                const style = styleKey ? sectionStyles[styleKey] : defaultStyle;
                return (
                    <div key={id} className={`rounded-lg overflow-hidden border ${style.card}`}>
                        <div className={`flex items-center gap-3 p-3 ${style.header}`}><span className={style.title}>{style.icon}</span><h3 className={`font-bold text-lg ${style.title}`}>{title}</h3></div>
                        <div className="p-4 prose prose-invert max-w-none prose-sm prose-pre:bg-slate-900/70 prose-pre:border prose-pre:border-slate-700 prose-pre:rounded-md" dangerouslySetInnerHTML={{ __html: getSanitizedHtml(content) }} />
                    </div>);
            })}
        </div>
      </div>);
  };

  return (
    <div className="bg-slate-800/40 rounded-lg border border-slate-700/80 shadow-lg flex flex-col">
       <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-slate-300">REVIEW</h2>
        {review && !isLoading && !error && (
          <div className="flex gap-2 flex-wrap">
              <button 
                onClick={handleExportPdf} 
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded-md text-sm transition-colors"
                title="Exports the full detailed report as a PDF"
              >
                Export PDF
              </button>
          </div>
        )}
      </div>
      <div className="p-6 min-h-[20rem]">{renderContent()}</div>
    </div>);
};

export default ReviewOutput;