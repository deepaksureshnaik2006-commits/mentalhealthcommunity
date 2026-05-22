import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Mindful Heaven?',
    answer: 'Mindful Heaven is a safe, calming platform for mental health support. We provide AI-based guidance, community discussions, verified counselor connections, and reliable mental health resources.',
  },
  {
    question: 'Is Mindful Heaven free to use?',
    answer: 'Yes! You can browse resources, view counselor information, and access basic features for free. To access all features like AI chat, forum posting, and peer messaging, you need to create a free account.',
  },
  {
    question: 'How is my privacy protected?',
    answer: 'Your privacy is our top priority. When you sign up, you are automatically assigned a unique anonymous identity. Your real name and email are never revealed to other users. All data is encrypted and stored securely.',
  },
  {
    question: 'What can I do without signing in?',
    answer: 'Without signing in, you can browse our resource library, view verified counselor profiles, and access crisis helpline information.',
  },
  {
    question: 'What features require signing in?',
    answer: 'Signing in with your email is required to access the AI chat support, participate in forum discussions, send peer messages, log your mood, and manage your settings. We require email authentication to ensure a safe and accountable community.',
  },
  {
    question: 'Is the AI chat a replacement for therapy?',
    answer: 'No. Our AI chat provides supportive guidance but is not a substitute for professional mental health care. The AI cannot diagnose conditions or prescribe medication. If you need professional support, please reach out to one of our verified counselors.',
  },
  {
    question: 'How does the anonymous identity work?',
    answer: 'When you create an account, you are automatically assigned a unique anonymous alias (like "GentleMoon123"). This is how you appear to other users in forums and messages. You can change this alias anytime in your settings.',
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes. You can delete your account at any time from the Settings page. This will permanently remove all your data including posts, messages, mood logs, and AI chat history.',
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Mindful Heaven.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto"
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-2xl border border-border px-6"
                >
                  <AccordionTrigger className="text-left font-serif text-lg font-medium hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}