import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CommandPalette } from './CommandPalette';
import { cn } from '../lib/utils';

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-40 w-full border-b border-surface bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-4 rounded-sm p-2 hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link 
            to="/" 
            className="group flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-sm"
          >
            <span className="font-['Caveat'] text-2xl font-semibold tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
              BroLang
            </span>
          </Link>
          <nav className="ml-auto hidden lg:flex">
            <NavLinks />
          </nav>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 bg-surface p-6 shadow-xl will-change-transform"
            >
              <div className="flex items-center justify-between">
                <Link 
                  to="/" 
                  className="group flex items-center space-x-2"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="font-['Caveat'] text-2xl font-semibold tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wider">
                    BroLang
                  </span>
                </Link>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-sm p-2 hover:bg-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-8">
                <NavLinks onClick={() => setIsSidebarOpen(false)} />
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 pt-24">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </motion.div>
          ) : (
            <motion.div
              key={location.pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="will-change-transform"
            >
              <Outlet />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          className: 'bg-surface text-text border border-surface',
        }} 
      />
    </div>
  );
}

function NavLinks({ onClick }: { onClick?: () => void } = {}) {

  return (
    <ul className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:space-x-6 lg:space-y-0">
      <NavLink to="/playground" onClick={onClick}>Playground</NavLink>
    </ul>
  );
}

function NavLink({ 
  to, 
  children,
  onClick 
}: { 
  to: string; 
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          'block rounded-sm px-3 py-2 text-sm transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50',
          isActive && 'bg-primary/10 text-primary'
        )}
      >
        {children}
      </Link>
    </li>
  );
}
