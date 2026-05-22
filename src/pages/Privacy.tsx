import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead text-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <p>
                At Mindful Heaven, we understand that privacy is crucial, especially when it
                comes to mental health. This Privacy Policy explains how we collect, use,
                protect, and handle your personal information.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                Information We Collect
              </h2>
              <ul className="space-y-2">
                <li><strong>Account Information:</strong> Email address and encrypted password when you create an account.</li>
                <li><strong>Usage Data:</strong> How you interact with our platform to improve services.</li>
                <li><strong>Content:</strong> Posts, messages, mood journal entries, and AI chat conversations you create.</li>
                <li><strong>Device Information:</strong> Browser type and general location for security purposes.</li>
              </ul>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                How We Protect Your Privacy
              </h2>
              <ul className="space-y-2">
                <li><strong>Anonymous Identity:</strong> You participate under an anonymous alias; your real identity is never shown to other users.</li>
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest.</li>
                <li><strong>No Selling Data:</strong> We never sell your personal information to third parties.</li>
                <li><strong>Minimal Collection:</strong> We only collect data necessary for platform functionality.</li>
              </ul>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                How We Use Your Information
              </h2>
              <ul className="space-y-2">
                <li>To provide and improve our mental health support services</li>
                <li>To maintain your anonymous profile and preferences</li>
                <li>To send important notifications about bookings and platform updates</li>
                <li>To ensure platform safety and prevent abuse</li>
              </ul>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                Data Retention & Deletion
              </h2>
              <p>
                You can delete your account at any time from the Settings page. When you
                delete your account, we permanently remove your profile, posts, messages,
                mood journal entries, and AI chat history within 30 days.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                Third-Party Services
              </h2>
              <p>
                We use trusted third-party services for authentication and data storage.
                These partners are bound by strict data protection agreements and comply
                with applicable privacy regulations.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or how we handle your data,
                please contact us at{' '}
                <a href="mailto:mindfulheaven2@gmail.com" className="text-primary hover:underline">
                  mindfulheaven2@gmail.com
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
