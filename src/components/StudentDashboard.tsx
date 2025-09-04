import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { askAgent } from '../services/openai';
import { LogOut, Send, Bot } from 'lucide-react';
import ChatMessage from './ChatMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const StudentDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await askAgent(input);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'Error processing your question. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-black p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Lumen AI Assistant</h1>
              <p className="text-md text-gray-600">Welcome, {user?.name} / مرحباً {user?.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <Bot size={64} className="mx-auto text-gray-300" />
              <h2 className="mt-4 text-3xl font-bold text-gray-700">How can I help you today?</h2>
              <p className="mt-2 text-lg text-gray-500">Ask me anything! Your answer will be in the same language as your question.</p>
            </div>
          )}
          {messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <ChatMessage role="assistant" content="Thinking..." isLoading={true} />
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="bg-white border-t-2 border-black p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumen anything... / اسأل لومين أي شيء..."
              className="w-full text-lg pl-4 pr-16 py-4 border-2 border-black rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
