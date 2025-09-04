import React from 'react';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isLoading = false }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-10 h-10 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}

      <div 
        className={`max-w-2xl px-5 py-3 rounded-2xl ${isUser ? 'bg-gray-200 text-black rounded-br-none' : 'bg-white border-2 border-gray-200 rounded-bl-none'}`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <p className="text-lg whitespace-pre-wrap leading-relaxed">{content}</p>
        )}
      </div>

      {isUser && (
        <div className="w-10 h-10 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
