import React, { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, isLoading, currentConversation, createNewConversation } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;

    // Create new conversation if none exists
    if (!currentConversation) {
      createNewConversation();
      // Wait a bit for the conversation to be created
      setTimeout(() => {
        sendMessage(message.trim());
      }, 100);
    } else {
      await sendMessage(message.trim());
    }
    
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStopGeneration = () => {
    // TODO: Implement stop generation logic
    console.log('Stop generation requested');
  };

  return (
    <div className="border-t border-chat-border bg-chat-input p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentConversation 
                    ? "Type your message..." 
                    : "Start a new conversation..."
                }
                className={cn(
                  "min-h-[52px] max-h-[200px] resize-none rounded-xl",
                  "bg-background border-chat-border",
                  "focus:ring-2 focus:ring-primary focus:border-transparent",
                  "pr-12" // Space for send button
                )}
                disabled={isLoading}
                rows={1}
              />
              
              {/* Send button inside textarea */}
              <div className="absolute right-2 bottom-2">
                {isLoading ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-md"
                    onClick={handleStopGeneration}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isLoading}
                    className={cn(
                      "h-8 w-8 rounded-md",
                      message.trim() 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Helper text */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;