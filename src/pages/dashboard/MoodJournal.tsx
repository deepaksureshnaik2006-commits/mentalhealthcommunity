import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moodLogsApi, MoodLog } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Smile, Meh, Frown, Heart, Zap } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const moods = [
  { value: 'great', label: 'Great', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-sage', bg: 'bg-sage/10' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-ocean', bg: 'bg-ocean/10' },
  { value: 'low', label: 'Low', icon: Frown, color: 'text-lavender', bg: 'bg-lavender/10' },
  { value: 'struggling', label: 'Struggling', icon: Heart, color: 'text-sunset', bg: 'bg-sunset/10' },
];

export default function MoodJournal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchLogs();
  }, [user, navigate]);

  const fetchLogs = async () => {
    try {
      const { logs } = await moodLogsApi.list();
      setLogs(logs);
    } catch (e) {
      console.error('Error fetching mood logs:', e);
      toast({ title: 'Error', description: 'Failed to load mood logs', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleAddLog = async () => {
    if (!user || !selectedMood) return;
    setSaving(true);
    try {
      await moodLogsApi.create(selectedMood, notes || null);
      toast({ title: 'Mood logged', description: 'Your mood has been recorded successfully' });
      setSelectedMood(null);
      setNotes('');
      setShowAddForm(false);
      fetchLogs();
    } catch {
      toast({ title: 'Error', description: 'Failed to save mood log', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await moodLogsApi.remove(logId);
      toast({ title: 'Deleted', description: 'Mood log removed' });
      setLogs(logs.filter(l => l.id !== logId));
    } catch {
      toast({ title: 'Error', description: 'Failed to delete mood log', variant: 'destructive' });
    }
  };

  const getMoodInfo = (moodValue: string) => moods.find(m => m.value === moodValue) || moods[2];

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
            <h1 className="font-serif text-xl font-semibold">Mood Journal</h1>
          </div>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Log Mood
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <AnimatePresence>
          {showAddForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-serif text-lg font-semibold mb-4">How are you feeling?</h2>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moods.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <button key={mood.value} onClick={() => setSelectedMood(mood.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          selectedMood === mood.value ? `border-primary ${mood.bg}` : 'border-transparent bg-sage-light/50 hover:bg-sage-light'
                        }`}>
                        <Icon className={`w-8 h-8 ${mood.color}`} />
                        <span className="text-xs font-medium">{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mb-6">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any thoughts or reflections... (optional)" rows={3} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowAddForm(false); setSelectedMood(null); setNotes(''); }}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleAddLog} disabled={!selectedMood || saving}>
                    {saving ? 'Saving...' : 'Save Entry'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage-light flex items-center justify-center">
              <Smile className="w-8 h-8 text-sage" />
            </div>
            <h2 className="font-serif text-xl font-semibold text-foreground mb-2">No mood logs yet</h2>
            <p className="text-muted-foreground mb-4">Start tracking your mood to gain insights into your emotional patterns.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Mood
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold">Your Mood History</h2>
            {logs.map((log) => {
              const moodInfo = getMoodInfo(log.mood);
              const Icon = moodInfo.icon;
              return (
                <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-4 flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${moodInfo.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${moodInfo.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{moodInfo.label}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}</span>
                    </div>
                    {log.notes && (<p className="text-sm text-muted-foreground">{log.notes}</p>)}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete mood log?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete this mood entry.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLog(log.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
