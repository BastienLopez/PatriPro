import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, RecurringEvent, RecurringEventType, ExpenseCategory, categoryLabels } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const eventTypeLabels: Record<RecurringEventType, string> = {
  INCOME: 'Revenu',
  BILL: 'Facture',
  LOAN_PAYMENT: 'Échéance emprunt',
  OTHER: 'Autre',
};

export function FinancialCalendar() {
  const { recurringEvents, addRecurringEvent, updateRecurringEvent, removeRecurringEvent, expenses } = useData();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Day popup state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<RecurringEvent | null>(null);

  const [formData, setFormData] = useState<Omit<RecurringEvent, 'id'>>({
    type: 'BILL',
    label: '',
    amount: 0,
    category: undefined,
    dayOfMonth: 1,
  });

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7;

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get all events for a day (recurring events + expenses with dates)
  const getEventsForDay = (day: number): RecurringEvent[] => {
    const eventsFromRecurring = recurringEvents.filter(e => e.dayOfMonth === day);
    const eventsFromExpenses = expenses
      .filter(e => e.dayOfMonth === day)
      .map(e => ({
        id: `exp-${e.id}`,
        type: 'BILL' as RecurringEventType,
        label: e.label,
        amount: e.amount,
        category: e.category,
        dayOfMonth: e.dayOfMonth!,
      }));
    return [...eventsFromRecurring, ...eventsFromExpenses];
  };

  const getEventColor = (type: RecurringEventType) => {
    switch (type) {
      case 'INCOME':
        return 'bg-positive text-positive-foreground';
      case 'BILL':
        return 'bg-negative text-negative-foreground';
      case 'LOAN_PAYMENT':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalIncome = recurringEvents
    .filter(e => e.type === 'INCOME')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpenses = recurringEvents
    .filter(e => e.type !== 'INCOME')
    .reduce((sum, e) => sum + e.amount, 0);

  const resetForm = () => {
    setFormData({ type: 'BILL', label: '', amount: 0, category: undefined, dayOfMonth: 1 });
  };

  const handleAdd = () => {
    if (!formData.label.trim()) {
      toast({ title: 'Erreur', description: 'Le libellé est requis', variant: 'destructive' });
      return;
    }
    addRecurringEvent(formData);
    toast({ title: 'Succès', description: 'Événement ajouté' });
    resetForm();
  };

  const handleEdit = () => {
    if (!editingEvent) return;
    updateRecurringEvent(editingEvent.id, formData);
    toast({ title: 'Succès', description: 'Événement modifié' });
    setEditingEvent(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeRecurringEvent(id);
    toast({ title: 'Événement supprimé' });
  };

  const openAddForDay = (day: number) => {
    setFormData({ ...formData, dayOfMonth: day });
    setIsAddOpen(true);
  };

  const openEdit = (event: RecurringEvent) => {
    setEditingEvent(event);
    setFormData({
      type: event.type,
      label: event.label,
      amount: event.amount,
      category: event.category,
      dayOfMonth: event.dayOfMonth,
    });
    setIsEditOpen(true);
  };

  const FormFields = () => (
    <>
      <div className="space-y-2">
        <Label>Type d'événement</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as RecurringEventType })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Libellé</Label>
        <Input
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="ex: Loyer"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Montant (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Jour du mois</Label>
          <Input
            type="number"
            min="1"
            max="31"
            value={formData.dayOfMonth}
            onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
      {formData.type === 'BILL' && (
        <div className="space-y-2">
          <Label>Catégorie (optionnel)</Label>
          <Select value={formData.category || 'none'} onValueChange={(v) => setFormData({ ...formData, category: v === 'none' ? undefined : v as ExpenseCategory })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const events = getEventsForDay(day);
    const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
    
    days.push(
      <div
        key={day}
        onClick={() => setSelectedDay(day)}
        className={cn(
          'min-h-24 p-2 border border-border rounded-lg cursor-pointer transition-colors hover:bg-secondary/50',
          events.length > 0 && 'bg-card',
          isToday && 'ring-2 ring-primary'
        )}
      >
        <span className={cn("text-sm font-medium", isToday ? "text-primary" : "text-foreground")}>{day}</span>
        <div className="mt-1 space-y-1">
          {events.slice(0, 2).map((event) => (
            <div
              key={event.id}
              className={cn(
                'text-xs px-1.5 py-0.5 rounded truncate',
                getEventColor(event.type)
              )}
              title={`${event.label}: ${formatCurrency(event.amount)}`}
            >
              {event.label}
            </div>
          ))}
          {events.length > 2 && (
            <span className="text-xs text-muted-foreground">+{events.length - 2}</span>
          )}
        </div>
      </div>
    );
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Entrées prévues</p>
          <p className="text-2xl font-bold text-positive">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Sorties prévues</p>
          <p className="text-2xl font-bold text-negative">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-center">
          <CrudDialog
            trigger={<Button className="gap-2"><Plus size={18} />Ajouter un événement</Button>}
            title="Ajouter un événement"
            description="Créez un événement récurrent dans le calendrier"
            onSubmit={handleAdd}
            open={isAddOpen}
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
          >
            <FormFields />
          </CrudDialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-muted-foreground" />
          </button>
          <h3 className="text-lg font-semibold text-foreground">
            {months[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">{days}</div>

        <div className="mt-4 pt-4 border-t border-border flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-positive" />
            <span className="text-xs text-muted-foreground">Revenus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-negative" />
            <span className="text-xs text-muted-foreground">Factures</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="text-xs text-muted-foreground">Emprunts</span>
          </div>
        </div>
      </div>

      {/* Day popup */}
      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDay} {months[currentMonth]} {currentYear}
            </DialogTitle>
            <DialogDescription>
              Événements prévus ce jour
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun événement ce jour
              </p>
            ) : (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-3 h-3 rounded-full', getEventColor(event.type))} />
                    <div>
                      <p className="font-medium text-foreground">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{eventTypeLabels[event.type]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={cn('font-semibold', event.type === 'INCOME' ? 'text-positive' : 'text-negative')}>
                      {event.type === 'INCOME' ? '+' : '-'}{formatCurrency(event.amount)}
                    </p>
                    {!event.id.startsWith('exp-') && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedDay(null); openEdit(event); }}>
                          <Pencil size={14} />
                        </Button>
                        <DeleteConfirmDialog
                          trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 size={14} className="text-destructive" /></Button>}
                          onConfirm={() => handleDelete(event.id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <Button variant="outline" className="w-full gap-2" onClick={() => { setSelectedDay(null); openAddForDay(selectedDay!); }}>
              <Plus size={16} />
              Ajouter un événement
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <CrudDialog
        trigger={<span />}
        title="Modifier l'événement"
        description="Modifiez les informations de l'événement"
        onSubmit={handleEdit}
        open={isEditOpen}
        onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingEvent(null); resetForm(); } }}
      >
        <FormFields />
      </CrudDialog>
    </div>
  );
}
