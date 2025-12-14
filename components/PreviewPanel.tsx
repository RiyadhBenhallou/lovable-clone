import React, { useState, useEffect, useRef } from 'react';
import { ViewMode } from '../types';
import { Code, Eye, Monitor, Smartphone, Tablet, Copy, Check, Terminal } from 'lucide-react';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/plugins/html';

// Add type declaration for global Prism
declare global {
  interface Window {
    Prism: any;
  }
}

interface PreviewPanelProps {
  code: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ code }) => {
  const [mode, setMode] = useState<ViewMode>(ViewMode.PREVIEW);
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const [key, setKey] = useState(0); // To force iframe refresh
  const [copied, setCopied] = useState(false);
  const [formattedCode, setFormattedCode] = useState('');
  const codeRef = useRef<HTMLElement>(null);

  // Format code whenever input code changes
  useEffect(() => {
    const formatCode = async () => {
      if (!code) {
        setFormattedCode('');
        return;
      }
      try {
        const formatted = await prettier.format(code, {
          parser: 'html',
          plugins: [parserHtml],
          printWidth: 80,
          tabWidth: 2,
        });
        setFormattedCode(formatted);
      } catch (err) {
        // Fallback to raw code if formatting fails
        console.warn("Prettier formatting failed:", err);
        setFormattedCode(code);
      }
    };

    formatCode();
  }, [code]);

  // Syntax Highlighting
  useEffect(() => {
    if (mode === ViewMode.CODE && formattedCode) {
       // Use global Prism instance from script tags
       if (window.Prism && codeRef.current) {
         // Tiny timeout ensures React has updated the DOM with the new code string
         setTimeout(() => {
             if (codeRef.current) {
                // highlightElement is specific and efficient
                window.Prism.highlightElement(codeRef.current);
             }
         }, 0);
       }
    }
  }, [mode, formattedCode]);

  const handleCopy = async () => {
    const contentToCopy = formattedCode || code;
    if (!contentToCopy) return;
    try {
        await navigator.clipboard.writeText(contentToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
        <div className="flex items-center bg-gray-800 p-0.5 rounded-lg border border-gray-700">
          <button
            onClick={() => setMode(ViewMode.PREVIEW)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === ViewMode.PREVIEW 
                ? 'bg-gray-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setMode(ViewMode.CODE)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === ViewMode.CODE 
                ? 'bg-gray-700 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        {mode === ViewMode.PREVIEW && (
          <div className="flex items-center gap-2 bg-gray-800 p-0.5 rounded-lg border border-gray-700 hidden sm:flex">
             <button
               onClick={() => setViewportWidth('100%')}
               className={`p-1.5 rounded hover:bg-gray-700 ${viewportWidth === '100%' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
               title="Desktop"
             >
               <Monitor className="w-4 h-4" />
             </button>
             <button
               onClick={() => setViewportWidth('768px')}
               className={`p-1.5 rounded hover:bg-gray-700 ${viewportWidth === '768px' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
               title="Tablet"
             >
               <Tablet className="w-4 h-4" />
             </button>
             <button
               onClick={() => setViewportWidth('375px')}
               className={`p-1.5 rounded hover:bg-gray-700 ${viewportWidth === '375px' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
               title="Mobile"
             >
               <Smartphone className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden flex justify-center bg-gray-950">
        {mode === ViewMode.PREVIEW ? (
          <div 
            className="h-full transition-all duration-300 ease-in-out border-x border-gray-800/50 bg-white shadow-2xl"
            style={{ width: viewportWidth }}
          >
            {code ? (
              <iframe
                key={key}
                srcDoc={code}
                title="Preview"
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800">
                        <Eye className="w-8 h-8 opacity-50" />
                    </div>
                    <p>Generating your preview...</p>
                </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
             {/* Code Editor Header */}
             <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-700 mx-1"></div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-mono bg-gray-800/50 px-2 py-1 rounded">
                        <Terminal className="w-3 h-3" />
                        <span>index.html</span>
                    </div>
                </div>
                
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
             </div>

             {/* Code Area */}
             <div className="flex-1 overflow-auto bg-[#282c34] custom-scrollbar">
               <pre className="!m-0 !bg-transparent language-html h-full">
                 <code ref={codeRef} className="language-html">{formattedCode || code}</code>
               </pre>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};