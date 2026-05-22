import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Clock, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';

const categories = [
  'All',
  'Anxiety',
  'Depression',
  'Stress',
  'Relationships',
  'Self-Care',
  'Mindfulness',
];

const resources = [
  {
    id: 1,
    title: 'Understanding Anxiety: A Complete Guide',
    description: 'Learn about the different types of anxiety, their symptoms, and evidence-based coping strategies.',
    content: `Anxiety is a natural response to stress, but when it becomes overwhelming, it can interfere with daily life. This guide will help you understand anxiety better and provide practical coping strategies.

## Types of Anxiety

**Generalized Anxiety Disorder (GAD)**: Characterized by persistent worry about various aspects of life.

**Social Anxiety**: Fear of social situations and being judged by others.

**Panic Disorder**: Sudden, intense episodes of fear accompanied by physical symptoms.

## Common Symptoms

- Excessive worry or fear
- Restlessness or feeling on edge
- Difficulty concentrating
- Sleep disturbances
- Physical symptoms like rapid heartbeat, sweating, or trembling

## Evidence-Based Coping Strategies

### 1. Deep Breathing Exercises
Practice the 4-7-8 technique: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.

### 2. Grounding Techniques
Use the 5-4-3-2-1 method: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.

### 3. Cognitive Restructuring
Challenge negative thoughts by asking: "Is this thought based on facts?" and "What would I tell a friend in this situation?"

### 4. Regular Exercise
Physical activity releases endorphins and reduces stress hormones.

### 5. Limit Caffeine and Alcohol
Both substances can worsen anxiety symptoms.

## When to Seek Professional Help

If anxiety significantly impacts your daily life, relationships, or work, consider speaking with a mental health professional. Therapy options like Cognitive Behavioral Therapy (CBT) have shown excellent results for anxiety disorders.`,
    category: 'Anxiety',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 2,
    title: '10 Grounding Techniques for Panic Attacks',
    description: 'Practical techniques you can use immediately to help manage panic and anxiety attacks.',
    content: `When a panic attack strikes, grounding techniques can help bring you back to the present moment and reduce overwhelming sensations.

## What is Grounding?

Grounding techniques help you connect with the present moment, redirecting your focus away from anxious thoughts and physical sensations.

## 10 Effective Grounding Techniques

### 1. The 5-4-3-2-1 Method
- **5** things you can see
- **4** things you can touch
- **3** things you can hear
- **2** things you can smell
- **1** thing you can taste

### 2. Box Breathing
Breathe in for 4 counts, hold for 4 counts, exhale for 4 counts, hold for 4 counts. Repeat.

### 3. Cold Water Technique
Splash cold water on your face or hold ice cubes in your hands.

### 4. Physical Grounding
Press your feet firmly into the ground. Feel the connection with the earth.

### 5. Name Objects
Look around and name everything you see, describing colors and shapes.

### 6. Body Scan
Starting from your toes, slowly move attention up through your body, noticing sensations.

### 7. Mindful Counting
Count backward from 100 by 7s or recite the alphabet backward.

### 8. Describe an Object
Pick up an object and describe it in detail—texture, weight, color, temperature.

### 9. Categories Game
Pick a category (animals, countries, foods) and list as many items as possible.

### 10. Safe Place Visualization
Imagine a place where you feel completely safe and peaceful. Describe it in detail.

## Tips for Practice

- Practice these techniques when calm so they're easier to use during panic
- Keep a small grounding object (like a smooth stone) with you
- Remember: panic attacks are temporary and will pass`,
    category: 'Anxiety',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 3,
    title: 'The Science of Mindfulness Meditation',
    description: 'Explore how mindfulness practice can reshape your brain and improve mental health.',
    content: `Mindfulness meditation has gained significant scientific backing in recent years. Let's explore how this ancient practice can physically change your brain and improve your mental well-being.

## What is Mindfulness?

Mindfulness is the practice of paying attention to the present moment without judgment. It involves observing your thoughts, feelings, and sensations as they arise.

## The Neuroscience Behind Mindfulness

### Brain Changes

Research using MRI scans has shown that regular meditation can:

- **Increase gray matter** in the prefrontal cortex (decision-making, focus)
- **Reduce amygdala activity** (the brain's fear center)
- **Strengthen the hippocampus** (memory and learning)
- **Improve connectivity** between brain regions

### Hormonal Effects

Meditation has been shown to:
- Reduce cortisol (stress hormone) levels
- Increase serotonin production
- Boost oxytocin (connection hormone)

## Mental Health Benefits

### Anxiety Reduction
Studies show 8 weeks of mindfulness practice can significantly reduce anxiety symptoms.

### Depression Prevention
Mindfulness-Based Cognitive Therapy (MBCT) reduces depression relapse by up to 50%.

### Improved Emotional Regulation
Regular practitioners show better ability to manage difficult emotions.

## How to Start

### Basic Meditation Practice

1. Find a quiet, comfortable spot
2. Set a timer for 5-10 minutes
3. Close your eyes and focus on your breath
4. When your mind wanders (it will!), gently return focus to breathing
5. Start with short sessions and gradually increase duration

### Daily Mindfulness

- Eat one meal mindfully, savoring each bite
- Take a mindful walk, noticing sensations
- Practice mindful listening in conversations`,
    category: 'Mindfulness',
    readTime: '10 min read',
    featured: true,
  },
  {
    id: 4,
    title: 'Building Healthy Boundaries in Relationships',
    description: 'A guide to understanding, setting, and maintaining healthy personal boundaries.',
    content: `Healthy boundaries are essential for maintaining well-being and building respectful relationships.

## What Are Boundaries?

Boundaries are limits we set to protect our physical, emotional, and mental well-being. They define what we accept and what we don't in our relationships.

## Types of Boundaries

### Physical Boundaries
Personal space, privacy, and physical touch preferences.

### Emotional Boundaries
Protecting your emotional energy and separating your feelings from others'.

### Time Boundaries
How you spend your time and energy.

### Digital Boundaries
Social media usage, response times, and online availability.

## Signs of Unhealthy Boundaries

- Feeling responsible for others' emotions
- Difficulty saying no
- Feeling drained after interactions
- Resentment building in relationships
- Neglecting your own needs

## How to Set Boundaries

### 1. Identify Your Limits
Reflect on what makes you uncomfortable or stressed. What do you need to feel safe and respected?

### 2. Communicate Clearly
Use "I" statements: "I need some alone time after work" rather than "You're always bothering me."

### 3. Be Consistent
Enforce boundaries consistently. Mixed messages confuse others.

### 4. Accept Discomfort
Setting boundaries may feel uncomfortable initially. This is normal and will ease with practice.

## Maintaining Boundaries

- Check in with yourself regularly
- Adjust boundaries as needed
- Don't apologize for having needs
- Surround yourself with people who respect your limits`,
    category: 'Relationships',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 5,
    title: 'Managing Work-Related Stress',
    description: 'Strategies for maintaining work-life balance and preventing burnout.',
    content: `Work stress affects millions of people worldwide. Learn how to manage it effectively before it leads to burnout.

## Understanding Work Stress

### Common Sources
- Heavy workloads and tight deadlines
- Lack of control over work
- Poor work-life balance
- Difficult colleagues or management
- Job insecurity

### Signs of Burnout
- Chronic exhaustion
- Cynicism about work
- Reduced productivity
- Physical symptoms (headaches, sleep issues)
- Emotional detachment

## Strategies for Managing Work Stress

### At Work

**Prioritize Tasks**: Use the Eisenhower Matrix—urgent/important, important/not urgent, urgent/not important, neither.

**Take Breaks**: Use the Pomodoro Technique—25 minutes of work, 5-minute break.

**Set Boundaries**: Define work hours and stick to them when possible.

**Communicate**: Speak up about unrealistic expectations.

### After Work

**Create Transition Rituals**: Change clothes, take a walk, or listen to music to signal the end of work.

**Practice Disconnection**: Avoid checking work emails during personal time.

**Engage in Hobbies**: Activities you enjoy help replenish energy.

**Prioritize Sleep**: Aim for 7-9 hours of quality sleep.

### Building Resilience

- Regular exercise
- Social connections outside work
- Mindfulness practice
- Healthy eating habits
- Professional support when needed`,
    category: 'Stress',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 6,
    title: 'Self-Care Practices for Daily Wellness',
    description: 'Simple daily habits that can significantly improve your mental and emotional wellbeing.',
    content: `Self-care isn't selfish—it's essential. Here are practical self-care habits you can incorporate into your daily routine.

## What is Self-Care?

Self-care encompasses activities and practices that support your physical, mental, and emotional well-being. It's about meeting your own needs so you can show up fully in life.

## Morning Self-Care Rituals

### Start Slowly
- Avoid immediately checking your phone
- Take a few deep breaths before getting up
- Practice gratitude—name 3 things you're thankful for

### Nourish Your Body
- Hydrate with water or herbal tea
- Eat a nutritious breakfast
- Stretch or do light exercise

## Throughout the Day

### Mental Breaks
- Step away from screens every hour
- Practice micro-meditations (1-2 minutes of breathing)
- Go outside for fresh air

### Emotional Check-ins
- Notice how you're feeling without judgment
- Name your emotions
- Offer yourself compassion

## Evening Wind-Down

### Create Calm
- Dim lights 1-2 hours before bed
- Limit screen time
- Take a warm bath or shower

### Reflect
- Journal about your day
- Release worries by writing them down
- Set gentle intentions for tomorrow

## Self-Care Categories

### Physical
Sleep, nutrition, exercise, hygiene

### Emotional
Therapy, journaling, emotional expression

### Social
Quality time with loved ones, community involvement

### Spiritual
Meditation, nature time, practices that provide meaning

### Professional
Boundaries, continuing education, workspace organization

Remember: Self-care looks different for everyone. Find what nourishes you.`,
    category: 'Self-Care',
    readTime: '5 min read',
    featured: true,
  },
  {
    id: 7,
    title: 'Recognizing Signs of Depression',
    description: 'Understanding depression symptoms and when to seek professional help.',
    content: `Depression is more than just feeling sad. Understanding its signs can help you recognize when you or someone you care about needs support.

## What is Depression?

Depression is a medical condition that affects how you feel, think, and handle daily activities. It's not a weakness or something you can "snap out of."

## Common Symptoms

### Emotional Signs
- Persistent sadness or emptiness
- Hopelessness or pessimism
- Irritability
- Loss of interest in activities once enjoyed
- Feelings of guilt or worthlessness

### Physical Signs
- Changes in appetite or weight
- Sleep disturbances (insomnia or oversleeping)
- Fatigue and decreased energy
- Unexplained aches and pains
- Slowed movements or speech

### Cognitive Signs
- Difficulty concentrating
- Trouble making decisions
- Memory problems
- Thoughts of death or suicide

## Duration Matters

Depression symptoms persist for at least two weeks and represent a change from previous functioning.

## Types of Depression

- **Major Depressive Disorder**: Severe symptoms affecting daily life
- **Persistent Depressive Disorder**: Milder but longer-lasting (2+ years)
- **Seasonal Affective Disorder**: Related to seasonal changes
- **Postpartum Depression**: Following childbirth

## When to Seek Help

Seek professional help if you experience:
- Symptoms lasting more than two weeks
- Difficulty functioning at work or in relationships
- Thoughts of self-harm or suicide
- Symptoms worsening despite self-care efforts

## Crisis Resources

If you're in crisis, please reach out:
- iCALL: 9152987821
- Vandrevala Foundation: 1860-2662-345
- NIMHANS: 080-46110007`,
    category: 'Depression',
    readTime: '8 min read',
    featured: false,
  },
  {
    id: 8,
    title: 'The Power of Journaling for Mental Health',
    description: 'How expressive writing can help process emotions and improve psychological wellbeing.',
    content: `Journaling is one of the most accessible and powerful tools for mental health. Learn how putting pen to paper can transform your well-being.

## Benefits of Journaling

### Emotional Processing
Writing helps you identify, express, and work through complex emotions.

### Stress Reduction
Externalizing worries onto paper can reduce their mental burden.

### Self-Awareness
Regular journaling reveals patterns in thoughts, behaviors, and triggers.

### Problem-Solving
Writing about challenges can help you see solutions more clearly.

## Journaling Techniques

### Free Writing
Set a timer for 10-15 minutes and write continuously without stopping or censoring.

### Gratitude Journaling
List 3-5 things you're grateful for daily. Be specific.

### Mood Tracking
Record your mood, triggers, and coping strategies.

### Prompted Journaling
Use prompts like:
- "What am I feeling right now?"
- "What would I tell my best friend in this situation?"
- "What do I need right now?"

### Future Self Letters
Write letters to your future self about your hopes and growth.

## Tips for Success

### Start Small
Begin with just 5 minutes a day.

### No Pressure
There's no "right" way to journal. Grammar and spelling don't matter.

### Be Honest
The journal is for your eyes only. Be truthful.

### Consistency Over Perfection
Regular practice matters more than perfect entries.

### Keep It Accessible
Use whatever format works—physical notebook, phone app, or computer.

## When Journaling Triggers Difficult Emotions

If writing brings up overwhelming feelings:
- Take breaks when needed
- Use grounding techniques
- Consider working with a therapist who can help you process what comes up`,
    category: 'Self-Care',
    readTime: '6 min read',
    featured: false,
  },
];

export default function Resources() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedResource, setSelectedResource] = useState<typeof resources[0] | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openResource = (resource: typeof resources[0]) => {
    setSelectedResource(resource);
  };

  const closeResource = () => {
    setSelectedResource(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

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
              Resource Library
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of articles, guides, and coping techniques
              to support your mental health journey.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="max-w-xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Featured Resources */}
          {selectedCategory === 'All' && searchQuery === '' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                Featured Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resources
                  .filter((r) => r.featured)
                  .map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => openResource(resource)}
                      className="group p-6 bg-gradient-calm rounded-2xl text-primary-foreground hover:shadow-glow transition-all duration-300 cursor-pointer"
                    >
                      <Badge className="bg-white/20 text-primary-foreground border-white/30 mb-4">
                        {resource.category}
                      </Badge>
                      <h3 className="font-serif text-xl font-semibold mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-primary-foreground/80 text-sm mb-4">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-80">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {resource.readTime}
                        </span>
                        <Button variant="glass" size="sm">
                          Read
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* All Resources */}
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
              {selectedCategory === 'All' ? 'All Resources' : selectedCategory}
            </h2>

            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resources found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openResource(resource)}
                    className="group p-6 bg-card rounded-2xl border border-border hover:shadow-medium transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary">{resource.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {resource.readTime}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {resource.description}
                    </p>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Resource Detail Modal */}
      <AnimatePresence>
        {selectedResource && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm overflow-y-auto"
            onClick={closeResource}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="min-h-screen py-8 px-4 flex items-start justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card rounded-3xl max-w-3xl w-full p-8 relative shadow-glow">
                <button
                  onClick={closeResource}
                  className="absolute top-4 right-4 p-2 hover:bg-sage-light rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <Badge className="mb-4">{selectedResource.category}</Badge>
                
                <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
                  {selectedResource.title}
                </h1>
                
                <p className="text-muted-foreground mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {selectedResource.readTime}
                </p>
                
                <div className="border-t border-border my-6" />
                
                <div className="prose prose-sage max-w-none">
                  {selectedResource.content.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('## ')) {
                      return (
                        <h2 key={i} className="font-serif text-xl font-semibold text-foreground mt-6 mb-3">
                          {paragraph.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h3 key={i} className="font-serif text-lg font-medium text-foreground mt-4 mb-2">
                          {paragraph.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n');
                      return (
                        <ul key={i} className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                          {items.map((item, j) => (
                            <li key={j}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (paragraph.startsWith('**')) {
                      return (
                        <p key={i} className="text-foreground font-medium mb-2">
                          {paragraph.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    return (
                      <p key={i} className="text-muted-foreground mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}