import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { notificationsApi, Notification } from '@/integrations/api/client';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Trash2, CheckCheck, MessageCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchNotifications();

    // Subscribe to real-time notification changes
    const channel = supabase
      .channel(`public:notifications_list_mh:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications_mh',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      const { notifications } = await notificationsApi.list();
      setNotifications(notifications);
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
    setLoading(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationsApi.markRead(notification.id);
      } catch {
        // ignore
      }
      setNotifications(notifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
    }
    if (notification.reference_id && notification.reference_type) {
      if (notification.reference_type === 'forum_post') navigate('/dashboard/forum');
      else if (notification.reference_type === 'peer_chat') navigate('/dashboard/messages');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({ title: 'Done', description: 'All notifications marked as read' });
    } catch {
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.remove(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'forum': return Users;
      case 'message': return MessageCircle;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'forum': return 'bg-lavender/10 text-lavender';
      case 'message': return 'bg-sage/10 text-sage';
      case 'success': return 'bg-sage/10 text-sage';
      case 'warning': return 'bg-sunset/10 text-sunset';
      case 'error': return 'bg-destructive/10 text-destructive';
      default: return 'bg-ocean/10 text-ocean';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-sage-light rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-serif text-xl font-semibold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light flex items-center justify-center">
              <Bell className="w-8 h-8 text-sage" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">No notifications</h2>
            <p className="text-muted-foreground">
              You're all caught up! Notifications about forum replies, messages, and updates will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const TypeIcon = getTypeIcon(notification.type);
              return (
                <motion.div key={notification.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-card rounded-2xl border p-4 cursor-pointer hover:shadow-soft transition-all ${
                    notification.read ? 'border-border' : 'border-primary/30 bg-primary/5'
                  }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${getTypeColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}</p>
                          {notification.reference_id && (<p className="text-xs text-primary mt-1">Click to view</p>)}
                        </div>
                        <Button variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
