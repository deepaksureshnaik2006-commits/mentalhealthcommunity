import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moderateText } from '@/lib/moderation';
import {
  peerChatsApi, profilesApi, uploadsApi,
  PeerChat, PeerMessage, Profile,
} from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, Search, User, MessageCircle, Plus,
  Trash2, MoreVertical,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<PeerChat[]>([]);
  const [activeChat, setActiveChat] = useState<PeerChat | null>(null);
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchChats();
    fetchAllProfiles();
  }, [user, navigate]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(allProfiles.filter(p => p.anonymous_alias.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProfiles]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const fetchAllProfiles = async () => {
    try {
      const { profiles } = await profilesApi.all();
      setAllProfiles(profiles);
    } catch (e) {
      console.error('Error fetching profiles:', e);
    }
  };

  const fetchChats = async () => {
    try {
      const { chats } = await peerChatsApi.list();
      setChats(chats);
    } catch (e) {
      console.error('Error fetching chats:', e);
    }
    setLoading(false);
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { messages } = await peerChatsApi.listMessages(chatId);
      setMessages(messages);
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  const deleteMessageForMe = async (messageId: string) => {
    try {
      await peerChatsApi.deleteMessageForMe(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast({ title: 'Message deleted', description: 'Message removed from your view' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
    }
  };

  const deleteMessageForEveryone = async (messageId: string) => {
    try {
      await peerChatsApi.deleteMessageForEveryone(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast({ title: 'Message deleted', description: 'Message deleted for everyone' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete message', variant: 'destructive' });
    }
  };

  const startChatWithUser = async (otherUserId: string) => {
    if (!user) return;
    try {
      const { chat } = await peerChatsApi.start(otherUserId);
      const exists = chats.find(c => c.id === chat.id);
      if (!exists) setChats(prev => [chat, ...prev]);
      setActiveChat(chat);
      fetchMessages(chat.id);
      setSearchDialogOpen(false);
      setSearchQuery('');
    } catch {
      toast({ title: 'Error', description: 'Failed to start conversation', variant: 'destructive' });
    }
  };

  const selectChat = (chat: PeerChat) => {
    setActiveChat(chat);
    fetchMessages(chat.id);
  };



  const sendMessage = async () => {
    if (!user || !activeChat || !input.trim()) return;
    const content = input.trim();

    // Check for inappropriate, illegal, or abusive content
    const moderation = moderateText(content);
    if (!moderation.isValid) {
      setInput(''); // Block and delete message immediately from input
      toast({
        title: 'Message Blocked & Deleted',
        description: 'Your message was blocked and deleted because it violates our community guidelines regarding safe and supportive communication.',
        variant: 'destructive',
      });
      return;
    }

    setInput('');

    const tempMsg: PeerMessage = {
      id: `temp-${Date.now()}`, chat_id: activeChat.id, sender_id: user.id,
      content: content, image_url: null, video_url: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await peerChatsApi.sendMessage(activeChat.id, { content });
      fetchMessages(activeChat.id);
      setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, last_message: content } : c));
    } catch {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    try {
      await peerChatsApi.deleteChatForMe(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChat?.id === chatId) { setActiveChat(null); setMessages([]); }
      toast({ title: 'Conversation deleted', description: 'This conversation has been permanently removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete conversation', variant: 'destructive' });
    }
  };

  const clearAllChats = async () => {
    if (!user) return;
    for (const chat of chats) {
      try { await peerChatsApi.deleteChatForMe(chat.id); } catch {}
    }
    setChats([]);
    setActiveChat(null);
    setMessages([]);
    setClearAllDialogOpen(false);
    toast({ title: 'All conversations cleared', description: 'Your conversation list has been cleared permanently' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      <aside className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-sage-light rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            <div className="flex gap-1">
              {chats.length > 0 && (
                <AlertDialog open={clearAllDialogOpen} onOpenChange={setClearAllDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all conversations?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently remove all conversations from your list. This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllChats} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button size="icon" variant="ghost" onClick={() => setSearchDialogOpen(true)}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearchDialogOpen(true)}>
                Start a conversation
              </Button>
            </div>
          ) : (
            chats.map(chat => (
              <div key={chat.id}
                className={`group relative p-4 cursor-pointer border-b border-border hover:bg-sage-light/50 transition-colors ${
                  activeChat?.id === chat.id ? 'bg-sage-light' : ''
                }`}>
                <div className="flex items-center gap-3" onClick={() => selectChat(chat)}>
                  <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center">
                    {chat.other_user?.avatar_url ? (
                      <img src={chat.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-ocean" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{chat.other_user?.anonymous_alias || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">{chat.last_message || 'No messages yet'}</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">Private Messages</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Start a private, anonymous conversation with another community member.
            </p>
            <Button onClick={() => setSearchDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />New Message
            </Button>
          </div>
        ) : (
          <>
            <header className="bg-background/80 backdrop-blur-lg border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center">
                  {activeChat.other_user?.avatar_url ? (
                    <img src={activeChat.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-ocean" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{activeChat.other_user?.anonymous_alias || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">Anonymous peer support</p>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`group flex items-start gap-1 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender_id === user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all self-center">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteMessageForMe(msg.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />Delete for me
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteMessageForEveryone(msg.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />Delete for everyone
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <div className={`max-w-[70%] p-3 rounded-2xl ${
                      msg.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    }`}>
                      {msg.video_url && (
                        <video src={msg.video_url} controls className="rounded-lg max-w-full mb-2" style={{ maxHeight: '300px' }} />
                      )}
                      {msg.image_url && (
                        <img src={msg.image_url} alt="Shared image" className="rounded-lg max-w-full mb-2 cursor-pointer hover:opacity-90"
                          onClick={() => window.open(msg.image_url!, '_blank')} />
                      )}
                      {msg.content && <p>{msg.content}</p>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>



            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()} className="flex-1" />
                <Button onClick={sendMessage} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={searchDialogOpen} onOpenChange={(open) => { setSearchDialogOpen(open); if (!open) setSearchQuery(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Start a Conversation</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type an alias to search..." className="pl-10" />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {!searchQuery.trim() ? (
                <p className="text-center text-muted-foreground py-4">Start typing to search for users</p>
              ) : searchResults.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No users found matching "{searchQuery}"</p>
              ) : (
                searchResults.map(profile => (
                  <div key={profile.user_id} onClick={() => startChatWithUser(profile.user_id)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-sage-light cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-full bg-ocean/10 flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-ocean" />
                      )}
                    </div>
                    <span className="font-medium">{profile.anonymous_alias}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
