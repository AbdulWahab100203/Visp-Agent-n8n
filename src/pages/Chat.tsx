import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';

const Chat: React.FC = () => {
  return (
    <ChatProvider>
      <div className="h-screen flex bg-chat-background">
        {/* Sidebar */}
        <ChatSidebar />
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatArea />
          <ChatInput />
        </div>
      </div>
    </ChatProvider>
  );
};

export default Chat;