import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  BookOpen, 
  Shield, 
  Sparkles,
  Calendar,
  Brain
} from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'AI Support Chat',
    description: 'Get compassionate, 24/7 AI-powered mental health support and guidance.',
    color: 'bg-ocean-light text-ocean',
  },
  {
    icon: Users,
    title: 'Community Forum',
    description: 'Connect with others who understand. Share experiences in a safe space.',
    color: 'bg-lavender-light text-lavender',
  },
  {
    icon: Heart,
    title: 'Verified Counselors',
    description: 'Connect with professional, verified mental health counselors.',
    color: 'bg-sunset-light text-sunset',
  },
  {
    icon: BookOpen,
    title: 'Resource Library',
    description: 'Access articles, guides, and coping techniques for your journey.',
    color: 'bg-sage-light text-sage',
  },
  {
    icon: Brain,
    title: 'Mood Journal',
    description: 'Track your daily emotions and reflect on your mental health patterns.',
    color: 'bg-ocean-light text-ocean',
  },
  {
    icon: Shield,
    title: 'Complete Privacy',
    description: 'Your identity is protected. Participate anonymously with confidence.',
    color: 'bg-lavender-light text-lavender',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sage/10 rounded-full blur-3xl breathing-animation" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-ocean/10 rounded-full blur-3xl breathing-animation" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavender/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-sage-dark text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              A safe space for your mental wellbeing
            </motion.div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight">
              Find Peace in Your{' '}
              <span className="text-gradient-calm">Mindful Journey</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              A calming community platform for mental health support. Connect anonymously, 
              access resources, chat with AI, and connect with verified counselors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="hero" size="xl">
                  Get Started
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Sign in to access resources, community features, and more.
            </p>
          </motion.div>
        </div>

      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive mental health support tools designed with your wellbeing in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-sage-light/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center bg-card rounded-3xl p-12 shadow-medium"
          >
            <Calendar className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Ready to Take the First Step?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands who have found support, community, and healing on their mental health journey.
            </p>
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}