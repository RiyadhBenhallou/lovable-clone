import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { generateAppCode } from '../services/gemini';
import { Message } from '../types';

export const Builder: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const initialPrompt = location.state?.initialPrompt;

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await generateAppCode(content, messages, code);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setCode(response.html);
    } catch (error) {
      console.error("Error generating code:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while building your app. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-100 hidden sm:block">Project Builder</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={handleDownload}
                disabled={!code}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Code</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Fixed width on desktop, hidden on mobile if needed (not implementing toggle for simplicity) */}
        <div className="w-[350px] lg:w-[400px] hidden md:flex flex-col h-full border-r border-gray-800">
           <ChatPanel 
             messages={messages} 
             onSendMessage={handleSendMessage} 
             isLoading={isLoading} 
           />
        </div>

        {/* Mobile Chat View Overlay (Simplification: On mobile we just stack or switch, but for this generic builder let's keep side-by-side logic or just preview first. 
           In a real Lovable clone, the chat is usually a side drawer or split pane. 
           Let's use a responsive grid where Chat is hidden or minimal on mobile, but since this is a dev tool, let's assume Tablet/Desktop focus)
        */}
        
        {/* Preview Panel - Flex grow */}
        <div className="flex-1 h-full min-w-0">
           <PreviewPanel code={code} />
        </div>
      </div>
    </div>
  );
};