import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profilesApi, notificationsApi } from '@/integrations/api/client';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Users,
  BookOpen,
  Heart,
  Brain,
  Bell,
  Settings,
  LogOut,
  Send,
  Menu,
  RefreshCw,
} from 'lucide-react';

const menuItems = [
  { icon: MessageCircle, label: 'AI Chat', href: '/dashboard/ai-chat', color: 'text-ocean' },
  { icon: Users, label: 'Forum', href: '/dashboard/forum', color: 'text-lavender' },
  { icon: Send, label: 'Messages', href: '/dashboard/messages', color: 'text-sage' },
  { icon: BookOpen, label: 'Resources', href: '/dashboard/resources', color: 'text-sunset' },
  { icon: Heart, label: 'Counselors', href: '/dashboard/counselors', color: 'text-ocean' },
  { icon: Brain, label: 'Mood Journal', href: '/dashboard/mood', color: 'text-sage' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', color: 'text-sunset' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', color: 'text-muted-foreground' },
];

interface ProfileSummary {
  anonymous_alias: string;
  avatar_url: string | null;
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { profile } = await profilesApi.me();
      setProfile({ anonymous_alias: profile.anonymous_alias, avatar_url: profile.avatar_url });
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  }, [user]);

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { count } = await notificationsApi.unreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUnreadNotifications();

      // Subscribe to real-time notification changes
      const channel = supabase
        .channel(`public:notifications_mh:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications_mh',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchUnreadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchProfile, fetchUnreadNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchUnreadNotifications()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const anonymousAlias = profile?.anonymous_alias || 'Friend';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-calm flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-semibold">Mindful Heaven</span>
            </Link>
          </div>

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sage font-medium">{anonymousAlias.slice(0, 2)}</span>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{anonymousAlias}</p>
                <p className="text-xs text-muted-foreground">Your anonymous identity</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link to={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-sage-light hover:text-foreground transition-colors relative"
                    onClick={() => setSidebarOpen(false)}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span className="absolute right-4 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <button className="lg:hidden p-2 text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-serif text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing} title="Refresh">
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Link to="/dashboard/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (<span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />)}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-2">Welcome, {anonymousAlias}</h2>
            <p className="text-muted-foreground">How are you feeling today? Explore our support features below.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.slice(0, 6).map((item, index) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link to={item.href} className="block p-6 bg-card rounded-2xl border border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group">
                  <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.label === 'AI Chat' && 'Get supportive guidance anytime'}
                    {item.label === 'Forum' && 'Connect with the community'}
                    {item.label === 'Messages' && 'Private peer conversations'}
                    {item.label === 'Resources' && 'Articles & coping guides'}
                    {item.label === 'Counselors' && 'Find verified professionals'}
                    {item.label === 'Mood Journal' && 'Track your daily wellbeing'}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
