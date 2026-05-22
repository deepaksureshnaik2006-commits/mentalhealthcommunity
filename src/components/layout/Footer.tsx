import { Link } from 'react-router-dom';
import { Heart, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-sage-light/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <Phone className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-foreground">In Crisis? Get Help Now</p>
                <p className="text-sm text-muted-foreground">
                  If you're in immediate danger, please call emergency services
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 text-center">
              <a
                href="tel:988"
                className="px-6 py-2 bg-destructive text-destructive-foreground rounded-xl font-medium hover:bg-destructive/90 transition-colors"
              >
                988 Suicide & Crisis Lifeline
              </a>
              <a
                href="tel:+919820466726"
                className="px-6 py-2 border border-destructive text-destructive rounded-xl font-medium hover:bg-destructive/10 transition-colors"
              >
                iCall India: +91 9820466726
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-calm flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-semibold">Mindful Heaven</span>
            </div>
            <p className="text-muted-foreground text-sm">
              A safe space for mental health support, community, and healing.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/counselors" className="hover:text-foreground transition-colors">
                  Counselors
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Community Forum
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  AI Support Chat
                </Link>
              </li>
              <li>
                <a href="mailto:mindfulheaven2@gmail.com" className="hover:text-foreground transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mindful Heaven. All rights reserved.</p>
          <p className="mt-1">
            This platform is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
