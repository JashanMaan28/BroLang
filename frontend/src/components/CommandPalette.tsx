import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const commands = [
  { id: 'docs', name: 'Documentation', path: '/docs' },
  { id: 'playground', name: 'Playground', path: '/playground' },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter((command) =>
    command.name.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onOpenChange(false)}
        className="cmd-palette"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="fixed left-1/2 top-1/4 w-full max-w-lg -translate-x-1/2 rounded-lg bg-surface p-4 shadow-xl"
        >
          <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
            <Search className="h-5 w-5 text-white/40" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
          <div className="mt-4 space-y-2">
            {filteredCommands.map((command) => (
              <button
                key={command.id}
                onClick={() => {
                  navigate(command.path);
                  onOpenChange(false);
                }}
                className="w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-white/5"
              >
                {command.name}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}