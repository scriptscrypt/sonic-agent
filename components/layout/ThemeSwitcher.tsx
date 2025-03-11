'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  isExpanded?: boolean;
}

export function ThemeSwitcher({ isExpanded = true }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Collapsed view with just the icon
  if (!isExpanded) {
    return (
      <div className="flex justify-center mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 hover:bg-muted/50"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Moon size={18} weight="fill" className="text-primary" />
          ) : (
            <Sun size={18} weight="fill" className="text-primary" />
          )}
        </Button>
      </div>
    );
  }

  // Expanded view with text
  return (
    <div className="mb-3">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-between px-3 py-2",
          "hover:bg-muted/50 border border-transparent hover:border-border/40 rounded-lg"
        )}
        onClick={toggleTheme}
      >
        <span className="text-sm font-medium">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
        <div className="flex items-center justify-center h-6 w-6 text-primary">
          {theme === 'dark' ? (
            <Moon size={18} weight="fill" />
          ) : (
            <Sun size={18} weight="fill" />
          )}
        </div>
      </Button>
    </div>
  );
} 