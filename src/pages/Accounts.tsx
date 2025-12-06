import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, Account } from '@/lib/data';
import { Building2, PiggyBank, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const Accounts = () => {
  const { accounts, addAccount, updateAccount, removeAccount } = useData();
  
  const currentAccounts = accounts.filter(a => a.type === 'CURRENT');
  const totalCurrent = currentAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    name: '',
    type: 'CURRENT' as Account['type'],
    currency: 'EUR',
    balance: 0,
  });
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const resetForm = () => {
    setFormData({ name: '', type: 'CURRENT', currency: 'EUR', balance: 0 });
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' });
      return;
    }
    addAccount(formData);
    toast({ title: 'Succès', description: 'Compte ajouté avec succès' });
    resetForm();
  };

  const handleEdit = () => {
    if (!editingAccount) return;
    updateAccount(editingAccount.id, formData);
    toast({ title: 'Succès', description: 'Compte modifié avec succès' });
    setEditingAccount(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeAccount(id);
    toast({ title: 'Succès', description: 'Compte supprimé' });
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: account.balance,
    });
    setIsEditOpen(true);
  };

  const FormFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nom du compte</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Compte courant Boursorama"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Account['type'] })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CURRENT">Compte courant</SelectItem>
            <SelectItem value="PEA">PEA</SelectItem>
            <SelectItem value="CTO">CTO</SelectItem>
            <SelectItem value="CRYPTO_WALLET">Wallet Crypto</SelectItem>
            <SelectItem value="LIFE_INSURANCE">Assurance-vie</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Devise</Label>
        <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="GBP">GBP (£)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="balance">Solde initial</Label>
        <Input
          id="balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
        />
      </div>
    </>
  );

  return (
    <AppLayout title="Comptes bancaires" subtitle="Vos comptes courants et d'investissement">
      <div className="space-y-6">
        {/* Header with Add button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Building2 className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total comptes courants</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCurrent)}</p>
            </div>
          </div>
          <CrudDialog
            trigger={<Button className="gap-2"><Plus size={18} />Ajouter un compte</Button>}
            title="Ajouter un compte"
            description="Créez un nouveau compte bancaire ou d'investissement"
            onSubmit={handleAdd}
            open={isAddOpen}
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
          >
            <FormFields />
          </CrudDialog>
        </div>

        {/* Accounts List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Tous les comptes ({accounts.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${account.type === 'CURRENT' ? 'bg-primary/10' : 'bg-positive/10'}`}>
                    {account.type === 'CURRENT' ? (
                      <Building2 className="text-primary" size={20} />
                    ) : (
                      <PiggyBank className="text-positive" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.type} • {account.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(account.balance)}</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(account)}>
                      <Pencil size={16} />
                    </Button>
                    <DeleteConfirmDialog
                      trigger={<Button variant="ghost" size="icon"><Trash2 size={16} className="text-destructive" /></Button>}
                      onConfirm={() => handleDelete(account.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Dialog */}
        <CrudDialog
          trigger={<span />}
          title="Modifier le compte"
          description="Modifiez les informations du compte"
          onSubmit={handleEdit}
          open={isEditOpen}
          onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingAccount(null); resetForm(); } }}
        >
          <FormFields />
        </CrudDialog>
      </div>
    </AppLayout>
  );
};

export default Accounts;
