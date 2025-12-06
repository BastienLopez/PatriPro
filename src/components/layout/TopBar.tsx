import { useState } from 'react';
import { Search, Plus, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const [isDark, setIsDark] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Rechercher un actif..."
            className="w-64 pl-10 bg-background border-border"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              Ajouter un actif
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un actif</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-muted-foreground text-sm">
                Fonctionnalité disponible prochainement.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
