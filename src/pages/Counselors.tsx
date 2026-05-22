import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { counselors } from '@/data/counselors';
import { ExternalLink, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Counselors() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button - Navigate to Dashboard */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Verified Counselors
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with experienced mental health professionals. All our counselors
              are verified and specialize in various areas of mental health support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {counselors.map((counselor, index) => (
              <motion.div
                key={counselor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-medium transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-calm flex items-center justify-center text-primary-foreground font-serif text-lg font-semibold">
                    {counselor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">
                      {counselor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {counselor.profession}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Specialties
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {counselor.specialty.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Languages
                  </p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {counselor.languages.join(', ')}
                    </span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  asChild
                >
                  <a href={counselor.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
