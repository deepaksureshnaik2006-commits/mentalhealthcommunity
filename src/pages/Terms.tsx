import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

export default function Terms() {
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
              Terms & Conditions
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="lead text-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <p>
                Welcome to Mindful Heaven. By using our platform, you agree to these Terms
                and Conditions. Please read them carefully.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Mindful Heaven, you agree to be bound by these Terms.
                If you do not agree, please do not use our services.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                2. Not Medical Advice
              </h2>
              <p>
                <strong>Important:</strong> Mindful Heaven is a support platform, not a
                medical service. Our AI chat, resources, and community features are for
                informational and supportive purposes only. They do not constitute medical
                advice, diagnosis, or treatment. Always consult qualified healthcare
                professionals for medical concerns.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                3. User Conduct
              </h2>
              <ul className="space-y-2">
                <li>Be respectful and supportive to other community members</li>
                <li>Do not share harmful, abusive, or triggering content</li>
                <li>Do not impersonate counselors or medical professionals</li>
                <li>Do not share other users' private information</li>
                <li>Report any concerning behavior to our moderation team</li>
              </ul>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                4. Account Responsibilities
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activities under your account. You must be at least
                13 years old to create an account.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                5. Content Guidelines
              </h2>
              <p>
                Content you post (forum discussions, comments, messages) must comply with
                our community guidelines. We reserve the right to remove content that
                violates these terms and suspend accounts of repeat offenders.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                6. Counselor Services
              </h2>
              <p>
                Counselors on our platform are independent professionals. While we verify
                their credentials, the services they provide are between you and the
                counselor. Mindful Heaven facilitates connections but is not responsible
                for the counseling services provided.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                7. Limitation of Liability
              </h2>
              <p>
                Mindful Heaven is provided "as is" without warranties of any kind. We are
                not liable for any damages arising from your use of our platform. In case
                of emergency, contact local emergency services.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                8. Changes to Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of the platform
                after changes constitutes acceptance of the new Terms.
              </p>

              <h2 className="font-serif text-2xl font-semibold text-foreground mt-8 mb-4">
                9. Contact
              </h2>
              <p>
                For questions about these Terms, contact us at{' '}
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
