import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moderateText } from '@/lib/moderation';
import { forumApi, ForumPost, ForumReply } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, MessageSquare, Send, Clock, User, Trash2,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';

const categories = [
  { value: 'general', label: 'General' },
  { value: 'stress', label: 'Stress' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'depression', label: 'Depression' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'academics', label: 'Academics' },
];

export default function Forum() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      const { posts } = await forumApi.listPosts();
      setPosts(posts);
    } catch (e) {
      console.error('Error fetching posts:', e);
    }
    setLoading(false);
  };

  const fetchReplies = async (postId: string) => {
    try {
      const { replies } = await forumApi.listReplies(postId);
      setReplies(replies);
    } catch (e) {
      console.error('Error fetching replies:', e);
    }
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    fetchReplies(post.id);
  };

  const createPost = async () => {
    if (!user || !newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);

    const titleMod = moderateText(newTitle);
    const contentMod = moderateText(newContent);
    if (!titleMod.isValid || !contentMod.isValid) {
      setNewTitle('');
      setNewContent('');
      setCreateDialogOpen(false);
      toast({
        title: 'Post Blocked & Deleted',
        description: 'Your discussion post was blocked and deleted because it violates our community guidelines regarding safe communication.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      await forumApi.createPost(newTitle.trim(), newContent.trim(), newCategory);
      toast({ title: 'Post created', description: 'Your discussion has been posted' });
      setNewTitle(''); setNewContent(''); setNewCategory('general'); setCreateDialogOpen(false);
      fetchPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const deletePost = async (postId: string) => {
    try {
      await forumApi.deletePost(postId);
      toast({ title: 'Post deleted', description: 'Your post has been removed' });
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      await forumApi.deleteReply(replyId);
      toast({ title: 'Reply deleted', description: 'Your reply has been removed' });
      setReplies(prev => prev.filter(r => r.id !== replyId));
      if (selectedPost) {
        setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, reply_count: (p.reply_count || 1) - 1 } : p));
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete reply', variant: 'destructive' });
    }
  };

  const submitReply = async () => {
    if (!user || !selectedPost || !replyContent.trim()) return;
    setSubmitting(true);

    const replyMod = moderateText(replyContent);
    if (!replyMod.isValid) {
      setReplyContent('');
      toast({
        title: 'Reply Blocked & Deleted',
        description: 'Your reply was blocked and deleted because it violates our community guidelines regarding safe communication.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    try {
      await forumApi.createReply(selectedPost.id, replyContent.trim());
      setReplyContent('');
      fetchReplies(selectedPost.id);
      fetchPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to post reply', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = showMyPostsOnly ? post.user_id === user?.id : true;
    return matchesCategory && matchesSearch && matchesUser;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-sage-light rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />New Post
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">Community Forum</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with others, share your experiences, and find support in our safe and anonymous community space.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input placeholder="Search discussions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="my-posts" checked={showMyPostsOnly} onCheckedChange={setShowMyPostsOnly} />
              <Label htmlFor="my-posts" className="cursor-pointer whitespace-nowrap text-sm text-muted-foreground font-medium">My Posts</Label>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No discussions found</p>
              </div>
            ) : (
              filteredPosts.map((post, index) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:shadow-medium transition-all hover:-translate-y-1 group">
                  <div onClick={() => openPost(post)} className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-sage-light text-sage font-medium capitalize">{post.category}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />{formatDate(post.created_at)}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{post.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{post.content}</p>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.reply_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" /><span>{post.author_alias}</span>
                    </div>
                    {post.user_id === user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete your post and all its replies. This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePost(post.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Start a Discussion</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="What's on your mind?" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Share your thoughts..." rows={5} className="mt-1" />
            </div>
            <Button onClick={createPost} disabled={submitting || !newTitle.trim() || !newContent.trim()} className="w-full">
              {submitting ? 'Posting...' : 'Post Discussion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-sage-light text-sage font-medium capitalize">{selectedPost?.category}</span>
              </div>
              {selectedPost?.user_id === user?.id && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete your post and all its replies.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePost(selectedPost!.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <DialogTitle className="font-serif text-xl">{selectedPost?.title}</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" /><span>{selectedPost?.author_alias}</span><span>•</span>
              <span>{selectedPost && formatDate(selectedPost.created_at)}</span>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <p className="text-foreground whitespace-pre-wrap">{selectedPost?.content}</p>
            <div className="border-t border-border pt-6">
              <h4 className="font-semibold mb-4">Replies ({replies.length})</h4>
              <div className="space-y-4">
                {replies.map(reply => (
                  <div key={reply.id} className="bg-sage-light/30 rounded-xl p-4 group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" /><span>{reply.author_alias}</span><span>•</span>
                        <span>{formatDate(reply.created_at)}</span>
                      </div>
                      {reply.user_id === user?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this reply?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete your reply.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteReply(reply.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <p className="text-foreground">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex gap-2">
              <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a supportive reply..." rows={2} className="flex-1" />
              <Button onClick={submitReply} disabled={submitting || !replyContent.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
