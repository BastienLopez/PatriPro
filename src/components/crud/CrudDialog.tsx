import { useState, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CrudDialogProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CrudDialog({
  trigger,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Enregistrer',
  open,
  onOpenChange,
}: CrudDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit();
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={description ? undefined : "dialog-content-desc"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className={description ? '' : 'sr-only'}>
            {description || 'Formulaire de gestion'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Chargement...' : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
