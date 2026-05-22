import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, Sparkles } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Compassion First',
    description: 'Every feature we build is designed with empathy and care for those seeking support.',
  },
  {
    icon: Shield,
    title: 'Privacy & Safety',
    description: 'Your identity and data are protected. Participate anonymously with complete confidence.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with others who understand your journey. You are never alone here.',
  },
  {
    icon: Sparkles,
    title: 'Accessible Care',
    description: 'Mental health support should be available to everyone, regardless of circumstances.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
              About Mindful Heaven
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're building a safe, calming sanctuary for mental health support.
              A place where anyone can find community, resources, and professional
              guidance on their journey to wellbeing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="bg-gradient-calm rounded-3xl p-10 text-primary-foreground text-center">
              <h2 className="font-serif text-3xl font-semibold mb-4">Our Mission</h2>
              <p className="text-lg leading-relaxed opacity-95">
                To create a stigma-free space where individuals can access mental health
                support anonymously, connect with verified professionals, and find a
                community that understands their struggles. We believe that everyone
                deserves access to compassionate mental health care.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="font-serif text-3xl font-semibold text-foreground text-center mb-10">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex gap-4 p-6 bg-card rounded-2xl border border-border"
                >
                  <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0">
                    <value.icon className="w-6 h-6 text-sage" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-sage-light/50 rounded-2xl p-8 border border-sage/20">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                Important Disclaimer
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Mindful Heaven is a support platform and is <strong>not a substitute for
                professional medical advice, diagnosis, or treatment</strong>. If you are
                experiencing a mental health crisis or emergency, please contact your
                local emergency services or a crisis helpline immediately. Our AI chat
                feature provides general support and resource recommendations but does
                not diagnose conditions or prescribe medication.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
