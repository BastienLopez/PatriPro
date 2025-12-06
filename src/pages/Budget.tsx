import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { ExpensesByCategory } from '@/components/budget/ExpensesByCategory';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, Income, Expense, ExpenseCategory, categoryLabels } from '@/lib/data';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Budget = () => {
  const {
    incomes, addIncome, updateIncome, removeIncome,
    expenses, addExpense, updateExpense, removeExpense,
  } = useData();

  // Income form state
  const [incomeForm, setIncomeForm] = useState<Omit<Income, 'id'>>({
    label: '', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined,
  });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);

  // Expense form state
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, 'id'>>({
    label: '', category: 'OTHER', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined,
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);

  // Income handlers
  const handleAddIncome = () => {
    if (!incomeForm.label.trim()) {
      toast({ title: 'Erreur', description: 'Le libellé est requis', variant: 'destructive' });
      return;
    }
    addIncome(incomeForm);
    toast({ title: 'Succès', description: 'Revenu ajouté' });
    setIncomeForm({ label: '', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined });
  };

  const handleEditIncome = () => {
    if (!editingIncome) return;
    updateIncome(editingIncome.id, incomeForm);
    toast({ title: 'Succès', description: 'Revenu modifié' });
    setEditingIncome(null);
  };

  const openEditIncome = (income: Income) => {
    setEditingIncome(income);
    setIncomeForm({ label: income.label, amount: income.amount, frequency: income.frequency, dayOfMonth: income.dayOfMonth });
    setIsEditIncomeOpen(true);
  };

  // Expense handlers
  const handleAddExpense = () => {
    if (!expenseForm.label.trim()) {
      toast({ title: 'Erreur', description: 'Le libellé est requis', variant: 'destructive' });
      return;
    }
    addExpense(expenseForm);
    toast({ title: 'Succès', description: 'Dépense ajoutée' });
    setExpenseForm({ label: '', category: 'OTHER', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined });
  };

  const handleEditExpense = () => {
    if (!editingExpense) return;
    updateExpense(editingExpense.id, expenseForm);
    toast({ title: 'Succès', description: 'Dépense modifiée' });
    setEditingExpense(null);
  };

  const openEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({ label: expense.label, category: expense.category, amount: expense.amount, frequency: expense.frequency, dayOfMonth: expense.dayOfMonth });
    setIsEditExpenseOpen(true);
  };

  const IncomeFormFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="incomeLabel">Libellé</Label>
        <Input
          id="incomeLabel"
          value={incomeForm.label}
          onChange={(e) => setIncomeForm({ ...incomeForm, label: e.target.value })}
          placeholder="ex: Salaire"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="incomeAmount">Montant (€)</Label>
          <Input
            id="incomeAmount"
            type="number"
            step="0.01"
            value={incomeForm.amount || ''}
            onChange={(e) => setIncomeForm({ ...incomeForm, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="incomeFrequency">Fréquence</Label>
          <Select value={incomeForm.frequency} onValueChange={(v) => setIncomeForm({ ...incomeForm, frequency: v as Income['frequency'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="YEARLY">Annuel</SelectItem>
              <SelectItem value="ONCE">Ponctuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="incomeDayOfMonth">Jour du mois (optionnel)</Label>
        <Input
          id="incomeDayOfMonth"
          type="number"
          min="1"
          max="31"
          value={incomeForm.dayOfMonth || ''}
          onChange={(e) => setIncomeForm({ ...incomeForm, dayOfMonth: parseInt(e.target.value) || undefined })}
          placeholder="ex: 28"
        />
      </div>
    </>
  );

  const ExpenseFormFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="expenseLabel">Libellé</Label>
        <Input
          id="expenseLabel"
          value={expenseForm.label}
          onChange={(e) => setExpenseForm({ ...expenseForm, label: e.target.value })}
          placeholder="ex: Loyer"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expenseCategory">Catégorie</Label>
        <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm({ ...expenseForm, category: v as ExpenseCategory })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expenseAmount">Montant (€)</Label>
          <Input
            id="expenseAmount"
            type="number"
            step="0.01"
            value={expenseForm.amount || ''}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenseFrequency">Fréquence</Label>
          <Select value={expenseForm.frequency} onValueChange={(v) => setExpenseForm({ ...expenseForm, frequency: v as Expense['frequency'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensuel</SelectItem>
              <SelectItem value="YEARLY">Annuel</SelectItem>
              <SelectItem value="ONCE">Ponctuel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expenseDayOfMonth">Jour du mois (optionnel - pour le calendrier)</Label>
        <Input
          id="expenseDayOfMonth"
          type="number"
          min="1"
          max="31"
          value={expenseForm.dayOfMonth || ''}
          onChange={(e) => setExpenseForm({ ...expenseForm, dayOfMonth: parseInt(e.target.value) || undefined })}
          placeholder="ex: 5"
        />
      </div>
    </>
  );

  return (
    <AppLayout title="Budget" subtitle="Suivez vos revenus et dépenses">
      <div className="space-y-6">
        <BudgetOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensesByCategory />
          
          {/* Incomes List */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Revenus mensuels</h3>
              <CrudDialog
                trigger={<Button variant="outline" size="sm" className="gap-1"><Plus size={16} />Ajouter</Button>}
                title="Ajouter un revenu"
                description="Ajoutez une nouvelle source de revenu"
                onSubmit={handleAddIncome}
                open={isAddIncomeOpen}
                onOpenChange={(open) => { setIsAddIncomeOpen(open); if (!open) setIncomeForm({ label: '', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined }); }}
              >
                <IncomeFormFields />
              </CrudDialog>
            </div>
            <div className="space-y-3">
              {incomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{income.label}</p>
                    {income.dayOfMonth && (
                      <p className="text-xs text-muted-foreground">Le {income.dayOfMonth} du mois</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-positive">+{formatCurrency(income.amount)}</p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditIncome(income)}>
                        <Pencil size={14} />
                      </Button>
                      <DeleteConfirmDialog
                        trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 size={14} className="text-destructive" /></Button>}
                        onConfirm={() => { removeIncome(income.id); toast({ title: 'Revenu supprimé' }); }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Détail des dépenses</h3>
            <CrudDialog
              trigger={<Button variant="outline" size="sm" className="gap-1"><Plus size={16} />Ajouter</Button>}
              title="Ajouter une dépense"
              description="Ajoutez une nouvelle dépense récurrente"
              onSubmit={handleAddExpense}
              open={isAddExpenseOpen}
              onOpenChange={(open) => { setIsAddExpenseOpen(open); if (!open) setExpenseForm({ label: '', category: 'OTHER', amount: 0, frequency: 'MONTHLY', dayOfMonth: undefined }); }}
            >
              <ExpenseFormFields />
            </CrudDialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{expense.label}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabels[expense.category]}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="font-semibold text-negative whitespace-nowrap">-{formatCurrency(expense.amount)}</p>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditExpense(expense)}>
                    <Pencil size={14} />
                  </Button>
                  <DeleteConfirmDialog
                    trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 size={14} className="text-destructive" /></Button>}
                    onConfirm={() => { removeExpense(expense.id); toast({ title: 'Dépense supprimée' }); }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Dialogs */}
        <CrudDialog
          trigger={<span />}
          title="Modifier le revenu"
          description="Modifiez les informations du revenu"
          onSubmit={handleEditIncome}
          open={isEditIncomeOpen}
          onOpenChange={(open) => { setIsEditIncomeOpen(open); if (!open) setEditingIncome(null); }}
        >
          <IncomeFormFields />
        </CrudDialog>

        <CrudDialog
          trigger={<span />}
          title="Modifier la dépense"
          description="Modifiez les informations de la dépense"
          onSubmit={handleEditExpense}
          open={isEditExpenseOpen}
          onOpenChange={(open) => { setIsEditExpenseOpen(open); if (!open) setEditingExpense(null); }}
        >
          <ExpenseFormFields />
        </CrudDialog>
      </div>
    </AppLayout>
  );
};

export default Budget;
