import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  profilesApi,
  securityApi,
  authApi,
  uploadsApi,
  Profile,
} from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Save, Trash2, Camera, X, Bell, Lock, ShieldQuestion } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What street did you grow up on?",
  "What was the make of your first car?",
  "What is your favorite movie?",
  "What is the name of your favorite book?",
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alias, setAlias] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const [hasSecurityQuestions, setHasSecurityQuestions] = useState(false);
  const [savingSecurityQuestions, setSavingSecurityQuestions] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
    fetchSecurityQuestions();
  }, [user, navigate]);

  const fetchSecurityQuestions = async () => {
    try {
      const { questions } = await securityApi.me();
      if (questions) {
        setSecurityQuestion1(questions.question1);
        setSecurityQuestion2(questions.question2);
        setHasSecurityQuestions(true);
      }
    } catch (e) {
      console.error('Error fetching security questions:', e);
    }
  };

  const handleSaveSecurityQuestions = async () => {
    if (!securityQuestion1 || !securityQuestion2) {
      toast({ title: 'Error', description: 'Please select both security questions', variant: 'destructive' });
      return;
    }
    if (securityQuestion1 === securityQuestion2) {
      toast({ title: 'Error', description: 'Please select two different questions', variant: 'destructive' });
      return;
    }
    if (!securityAnswer1.trim() || !securityAnswer2.trim()) {
      toast({ title: 'Error', description: 'Please provide answers for both questions', variant: 'destructive' });
      return;
    }

    setSavingSecurityQuestions(true);
    try {
      await securityApi.save(securityQuestion1, securityAnswer1, securityQuestion2, securityAnswer2);
      toast({ title: 'Success', description: 'Security questions saved successfully' });
      setHasSecurityQuestions(true);
      setSecurityAnswer1('');
      setSecurityAnswer2('');
    } catch (error: any) {
      console.error('Error saving security questions:', error);
      toast({ title: 'Error', description: 'Failed to save security questions', variant: 'destructive' });
    } finally {
      setSavingSecurityQuestions(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { profile } = await profilesApi.me();
      setProfile(profile);
      setAlias(profile.anonymous_alias);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setNotificationsEnabled(profile.notifications_enabled ?? true);
    } catch (e) {
      console.error('Error fetching profile:', e);
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please select an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadsApi.upload('avatars', file);
      setAvatarUrl(url);
      toast({ title: 'Image uploaded', description: "Don't forget to save your changes!" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload image. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
    toast({ title: 'Image removed', description: "Don't forget to save your changes!" });
  };

  const handleSave = async () => {
    if (!alias.trim()) {
      toast({ title: 'Error', description: 'Anonymous identity cannot be empty', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await profilesApi.update({
        anonymous_alias: alias.trim(),
        bio: bio || null,
        avatar_url: avatarUrl || null,
        notifications_enabled: notificationsEnabled,
      });
      toast({ title: 'Success', description: 'Profile updated successfully' });
      fetchProfile();
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await profilesApi.deleteMe();
      await signOut();
      toast({ title: 'Account Deleted', description: 'Your account and all data have been removed' });
      navigate('/');
    } catch (err) {
      console.error('Delete account error:', err);
      toast({ title: 'Error', description: 'An error occurred while deleting your account', variant: 'destructive' });
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in both password fields', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.changePassword(newPassword);
      toast({ title: 'Success', description: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({ title: 'Error', description: error.message || 'Failed to update password', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

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
        <div className="flex items-center gap-4 px-6 py-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-sage-light rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-ocean" />
              Profile Settings
            </h2>

            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full bg-sage-light flex items-center justify-center overflow-hidden border-4 border-background shadow-medium ${avatarUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                    onClick={() => avatarUrl && setAvatarDialogOpen(true)}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-medium text-sage">{alias.slice(0, 2)}</span>
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft">
                    {uploading ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  {avatarUrl && (
                    <button onClick={handleRemoveImage}
                      className="absolute top-0 right-0 w-6 h-6 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-soft">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {avatarUrl ? 'Click avatar to view full size, camera to upload, or X to remove' : 'Click the camera to upload'}
                </p>
              </div>

              <div>
                <Label htmlFor="alias">Anonymous Identity</Label>
                <Input id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Your anonymous name" className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">This is how others will see you in the community. You can change it anytime.</p>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." className="mt-1" rows={3} />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-sunset" />
              Notification Settings
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base font-medium">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive notifications for forum replies and private messages</p>
              </div>
              <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
            <p className="text-xs text-muted-foreground mt-4">Save changes to apply notification preferences.</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg font-semibold mb-4">Account Information</h2>
            <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-ocean" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
              <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword || !confirmPassword} className="w-full">
                {changingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-serif text-lg font-semibold mb-6 flex items-center gap-2">
              <ShieldQuestion className="w-5 h-5 text-sunset" />
              Security Questions
              {hasSecurityQuestions && (
                <span className="ml-2 text-xs bg-sage-light text-sage px-2 py-1 rounded-full">✓ Set up</span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Security questions help you recover your account if you forget your password.
              {hasSecurityQuestions ? ' You can update your questions and answers below.' : ' Set them up now to enable password recovery.'}
            </p>
            <div className="space-y-4">
              <div>
                <Label>Question 1</Label>
                <Select value={securityQuestion1} onValueChange={setSecurityQuestion1}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a security question" /></SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTIONS.filter(q => q !== securityQuestion2).map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Answer 1</Label>
                <Input type="text" value={securityAnswer1} onChange={(e) => setSecurityAnswer1(e.target.value)} placeholder="Your answer (case-insensitive)" className="mt-1" />
              </div>
              <div>
                <Label>Question 2</Label>
                <Select value={securityQuestion2} onValueChange={setSecurityQuestion2}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a security question" /></SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTIONS.filter(q => q !== securityQuestion1).map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Answer 2</Label>
                <Input type="text" value={securityAnswer2} onChange={(e) => setSecurityAnswer2(e.target.value)} placeholder="Your answer (case-insensitive)" className="mt-1" />
              </div>
              <Button onClick={handleSaveSecurityQuestions} disabled={savingSecurityQuestions || !securityQuestion1 || !securityQuestion2 || !securityAnswer1.trim() || !securityAnswer2.trim()} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {savingSecurityQuestions ? 'Saving...' : hasSecurityQuestions ? 'Update Security Questions' : 'Save Security Questions'}
              </Button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-destructive/20 p-6">
            <h2 className="font-serif text-lg font-semibold mb-4 text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. All your data will be permanently removed.</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete your account, profile, and all associated data including chats, posts, and conversations.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete Account</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>
      </main>

      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
          {avatarUrl && (<img src={avatarUrl} alt="Avatar full size" className="w-full h-auto rounded-2xl" />)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
