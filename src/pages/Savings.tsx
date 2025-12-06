import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, savingsTypeLabels, SavingsType, SavingsAccount } from '@/lib/data';
import { PiggyBank, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Savings = () => {
  const { savingsAccounts, addSavingsAccount, updateSavingsAccount, removeSavingsAccount } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SavingsAccount | null>(null);
  const [formData, setFormData] = useState<Partial<SavingsAccount>>({
    name: '', type: 'LIVRET_A', rate: 3, balance: 0, ceiling: null, openedAt: ''
  });

  const totalSavings = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  const avgRate = savingsAccounts.length > 0 
    ? savingsAccounts.reduce((sum, a) => sum + a.rate * a.balance, 0) / totalSavings 
    : 0;

  const resetForm = () => {
    setFormData({ name: '', type: 'LIVRET_A', rate: 3, balance: 0, ceiling: null, openedAt: '' });
    setEditingAccount(null);
  };

  const handleOpenDialog = (account?: SavingsAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData(account);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingAccount) {
      updateSavingsAccount(editingAccount.id, formData);
    } else {
      addSavingsAccount(formData as Omit<SavingsAccount, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AppLayout title="Livrets" subtitle="Votre épargne réglementée">
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-positive/10">
                <PiggyBank className="text-positive" size={32} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Épargne totale</p>
                <p className="text-3xl font-bold text-foreground">{formatCurrency(totalSavings)}</p>
                <p className="text-sm text-positive flex items-center gap-1 mt-1">
                  <TrendingUp size={14} />
                  Taux moyen: {avgRate.toFixed(2)}% • ~{formatCurrency(totalSavings * avgRate / 100)}/an
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAccount ? 'Modifier le livret' : 'Nouveau livret'}</DialogTitle>
                  <DialogDescription>
                    {editingAccount ? 'Modifiez les informations du livret' : 'Ajoutez un nouveau compte épargne'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input value={formData.name || ''} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v: SavingsType) => setFormData(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(savingsTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Solde (€)</Label>
                      <Input type="number" value={formData.balance || ''} onChange={e => setFormData(p => ({ ...p, balance: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Taux (%)</Label>
                      <Input type="number" step="0.1" value={formData.rate || ''} onChange={e => setFormData(p => ({ ...p, rate: parseFloat(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Plafond (€)</Label>
                      <Input type="number" value={formData.ceiling || ''} onChange={e => setFormData(p => ({ ...p, ceiling: parseFloat(e.target.value) || null }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date d'ouverture</Label>
                      <Input type="date" value={formData.openedAt || ''} onChange={e => setFormData(p => ({ ...p, openedAt: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savingsAccounts.map((account) => {
            const fillPercent = account.ceiling ? (account.balance / account.ceiling) * 100 : 0;
            const annualInterest = account.balance * (account.rate / 100);

            return (
              <div key={account.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{account.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {savingsTypeLabels[account.type]} • {account.rate}%{account.ceiling ? ` • Plafond: ${formatCurrency(account.ceiling)}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(account)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeSavingsAccount(account.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(account.balance)}</p>
                  <p className="text-sm text-positive">+{formatCurrency(annualInterest)} /an</p>
                </div>
                {account.ceiling && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remplissage</span>
                      <span className="font-medium text-foreground">{fillPercent.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(fillPercent, 100)} className="h-2" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Savings;
