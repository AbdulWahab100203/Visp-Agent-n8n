import React from 'react';
import { MessageSquare, Plus, Trash2, Settings, Moon, Sun } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const ChatSidebar: React.FC = () => {
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    selectConversation, 
    deleteConversation 
  } = useChatContext();
  const { theme, setTheme } = useTheme();

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return 'Today';
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const groupedConversations = conversations.reduce((groups: { [key: string]: typeof conversations }, conversation) => {
    const dateKey = formatDate(conversation.createdAt);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conversation);
    return groups;
  }, {});

  return (
    <div className="w-80 bg-chat-sidebar border-r border-chat-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-chat-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/visp-logo.png" alt="" width={25} height={25}/>
            {/* <MessageSquare className="h-6 w-6 text-primary" /> */}
            <span className="font-semibold text-lg">Visp Chat</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-8 w-8"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <Button 
          onClick={createNewConversation}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 p-2">
        {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
          <div key={dateGroup} className="mb-4">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {dateGroup}
            </div>
            <div className="space-y-1">
              {convs.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-chat-hover",
                    currentConversation?.id === conversation.id 
                      ? "bg-chat-hover border-l-2 border-primary" 
                      : ""
                  )}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate flex-1">{conversation.title}</span>
                  
                  {/* Delete button - only show on hover */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p className="text-sm">No conversations yet</p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-chat-border">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default ChatSidebar;