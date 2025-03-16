import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Zap, Users, Shield, Cpu, Globe, ChevronRight, ChevronLeft, Copy, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CodeEditor } from '../components/CodeEditor';
import toast from 'react-hot-toast';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  order?: number;
}

const features: Feature[] = [
  {
    icon: Terminal,
    title: 'Simple Syntax',
    description: 'Write code that feels natural and easy to understand, with a syntax designed for modern development.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Built for performance with zero compromises. Up to 3x faster than traditional interpreted languages.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Join a thriving community of over 10,000 developers building the future together.',
  },
  {
    icon: Shield,
    title: 'Type Safe',
    description: 'Catch errors before they happen with our advanced type system and static analysis.',
  },
  {
    icon: Cpu,
    title: 'Low Level Control',
    description: "Direct memory management and system calls when you need them, abstraction when you don't need it.",
  },
  {
    icon: Globe,
    title: 'Cross Platform',
    description: 'Build and deploy on any platform. One codebase, endless possibilities.',
  },
];

const initialPlaygroundCode = `# Welcome to BroLang!
yo bro

# Declaring Variables
bro this is x = 10
bro this is y = 5

# Test if-else statement
bro if x > y {
    bro say "x is greater than y"
} bro else {
    bro say "x is not greater than y"
}

# Test while loop
bro this is counter = 3
keep going bro (counter > 0) {
    bro say "Counting down: " + counter
    counter = counter - 1
}

# Test input with if-else
bro ask num
bro if (num > 5) {
    bro say "Your number is greater than 5"
} bro else {
    bro say "Your number is less than or equal to 5"
}

peace out bro`;

export function Home() {
  const navigate = useNavigate();
  const [currentExample, setCurrentExample] = useState<number>(0);
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCodeExamples() {
      try {
        const examplesRef = collection(db, 'codeExamples');
        const q = query(examplesRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const examples: CodeExample[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as CodeExample));
        
        setCodeExamples(examples);
      } catch (error) {
        console.error('Error fetching code examples:', error);
        toast.error('Failed to load code examples');
      } finally {
        setLoading(false);
      }
    }

    fetchCodeExamples();
  }, []);

  const nextExample = () => setCurrentExample((prev) => (prev + 1) % codeExamples.length);
  const prevExample = () => setCurrentExample((prev) => (prev - 1 + codeExamples.length) % codeExamples.length);

  const copyCode = async () => {
    if (codeExamples.length === 0) return;
    try {
      await navigator.clipboard.writeText(codeExamples[currentExample].code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const moveToPlayground = () => {
    if (codeExamples.length === 0) return;
    localStorage.setItem('playground-code', codeExamples[currentExample].code);
    navigate('/playground');
  };

  const handleRunCode = () => {
    localStorage.setItem('playground-code', initialPlaygroundCode);
    navigate('/playground');
  };

  return (
    <div className="space-y-24 pb-16">
      <section className="mx-auto max-w-5xl text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold sm:text-6xl">
          The Programming Language
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> for Bros</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 text-lg text-text/60">
          BroLang is a modern programming language designed for simplicity, performance, and developer happiness.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 flex items-center justify-center gap-4">
          <Link to="/playground" className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      <section className="mx-auto max-w-5xl">
        <div className="rounded-lg border border-surface bg-surface/50 p-8">
          <h2 className="text-2xl font-bold">Try BroLang</h2>
          <p className="mt-2 text-text/60">Write and run BroLang code directly in your browser.</p>
          <div className="mt-6">
            <CodeEditor initialValue={initialPlaygroundCode} height="300px" showRunButton={true} onRun={handleRunCode} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
        <p className="text-text/60 mb-6">Explore these examples to learn BroLang's features and capabilities.</p>
        <div className="rounded-lg border border-surface bg-surface/50 p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : codeExamples.length > 0 ? (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{codeExamples[currentExample].title}</h3>
                  <p className="mt-1 text-sm text-text/60">{codeExamples[currentExample].description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevExample} className="rounded-full p-2 hover:bg-surface/90" aria-label="Previous example">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-text/60">{currentExample + 1} / {codeExamples.length}</span>
                  <button onClick={nextExample} className="rounded-full p-2 hover:bg-surface/90" aria-label="Next example">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <pre className="relative rounded-lg bg-background p-4 font-mono text-sm">
                <div className="absolute right-4 top-4 flex items-center gap-2">
                  <button onClick={copyCode} className="rounded-sm bg-surface/50 p-2 text-text/60 hover:bg-surface/90 hover:text-text" aria-label="Copy code">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button onClick={moveToPlayground} className="rounded-sm bg-surface/50 p-2 text-text/60 hover:bg-surface/90 hover:text-text" aria-label="Move to playground">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                <code className="block pt-8">{codeExamples[currentExample].code}</code>
              </pre>
            </>
          ) : (
            <p className="text-center text-text/60">No code examples available</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold">Why BroLang?</h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-surface bg-surface/50 p-6">
              <feature.icon className="h-12 w-12 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-text/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}