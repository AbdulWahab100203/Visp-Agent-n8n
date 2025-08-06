import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import ChatMessage from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatArea: React.FC = () => {
  const { currentConversation, createNewConversation, isTyping } = useChatContext();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages, isTyping]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">Welcome to AI Chat</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Start a conversation with our AI assistant. Ask questions, get help with tasks, 
            or just have a friendly chat.
          </p>
          
          <Button 
            onClick={createNewConversation}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Start New Chat
          </Button>
          
          <div className="mt-8 text-sm text-muted-foreground">
            <p className="mb-2">Try asking:</p>
            <div className="space-y-1">
              <div className="bg-muted/50 rounded-lg p-2">"Explain quantum computing"</div>
              <div className="bg-muted/50 rounded-lg p-2">"Help me write a Python function"</div>
              <div className="bg-muted/50 rounded-lg p-2">"What's the weather like today?"</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-background">
      {/* Chat Header */}
      <div className="border-b border-chat-border p-4 bg-chat-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-semibold truncate">{currentConversation.title}</h1>
          <p className="text-sm text-muted-foreground">
            {currentConversation.messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto">
          {currentConversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div>
              {currentConversation.messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  isLatest={index === currentConversation.messages.length - 1}
                />
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-4 p-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">AI Assistant</span>
                      <span className="text-xs text-muted-foreground">typing...</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>
    </div>
  );
};

export default ChatArea;