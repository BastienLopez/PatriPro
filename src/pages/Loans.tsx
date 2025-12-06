import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoanCard } from '@/components/loans/LoanCard';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, Loan } from '@/lib/data';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Loans = () => {
  const { loans, addLoan, updateLoan, removeLoan } = useData();
  
  const totalLiabilities = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
  const totalMonthlyPayment = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);

  const [formData, setFormData] = useState({
    name: '',
    principal: 0,
    annualRate: 0,
    termYears: 0,
    startDate: '',
    monthlyPayment: 0,
    remainingPrincipal: 0,
    remainingMonths: 0,
  });
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '', principal: 0, annualRate: 0, termYears: 0,
      startDate: '', monthlyPayment: 0, remainingPrincipal: 0, remainingMonths: 0,
    });
  };

  // Calculate monthly payment from principal, rate, and term
  const calculateMonthlyPayment = (principal: number, annualRate: number, termYears: number) => {
    if (!principal || !annualRate || !termYears) return 0;
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const handlePrincipalChange = (principal: number) => {
    const monthlyPayment = calculateMonthlyPayment(principal, formData.annualRate, formData.termYears);
    const remainingMonths = formData.termYears * 12;
    setFormData({ ...formData, principal, monthlyPayment, remainingPrincipal: principal, remainingMonths });
  };

  const handleRateChange = (annualRate: number) => {
    const monthlyPayment = calculateMonthlyPayment(formData.principal, annualRate, formData.termYears);
    setFormData({ ...formData, annualRate, monthlyPayment });
  };

  const handleTermChange = (termYears: number) => {
    const monthlyPayment = calculateMonthlyPayment(formData.principal, formData.annualRate, termYears);
    const remainingMonths = termYears * 12;
    setFormData({ ...formData, termYears, monthlyPayment, remainingMonths });
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' });
      return;
    }
    addLoan(formData);
    toast({ title: 'Succès', description: 'Emprunt ajouté avec succès' });
    resetForm();
  };

  const handleEdit = () => {
    if (!editingLoan) return;
    updateLoan(editingLoan.id, formData);
    toast({ title: 'Succès', description: 'Emprunt modifié avec succès' });
    setEditingLoan(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeLoan(id);
    toast({ title: 'Succès', description: 'Emprunt supprimé' });
  };

  const openEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({ ...loan });
    setIsEditOpen(true);
  };

  // Generate amortization data for all loans combined
  const generateAmortizationData = () => {
    const data = [];
    let totalRemaining = totalLiabilities;
    const currentYear = new Date().getFullYear();
    const maxYears = Math.max(...loans.map(l => Math.ceil(l.remainingMonths / 12)), 1);

    for (let year = 0; year <= maxYears; year++) {
      data.push({
        year: currentYear + year,
        capital: Math.max(0, totalRemaining),
      });
      
      loans.forEach(loan => {
        const monthlyRate = loan.annualRate / 100 / 12;
        for (let month = 0; month < 12 && totalRemaining > 0; month++) {
          const interest = totalRemaining * monthlyRate;
          const principal = loan.monthlyPayment - interest;
          totalRemaining = Math.max(0, totalRemaining - principal);
        }
      });
    }
    return data;
  };

  const amortizationData = generateAmortizationData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const FormFields = () => (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'emprunt</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Prêt immobilier"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="principal">Montant emprunté (€)</Label>
          <Input
            id="principal"
            type="number"
            value={formData.principal || ''}
            onChange={(e) => handlePrincipalChange(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="annualRate">Taux annuel (%)</Label>
          <Input
            id="annualRate"
            type="number"
            step="0.01"
            value={formData.annualRate || ''}
            onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="termYears">Durée (années)</Label>
          <Input
            id="termYears"
            type="number"
            value={formData.termYears || ''}
            onChange={(e) => handleTermChange(parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mensualité calculée</Label>
          <p className="text-lg font-semibold text-primary">{formatCurrency(formData.monthlyPayment)}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="remainingPrincipal">Capital restant dû (€)</Label>
          <Input
            id="remainingPrincipal"
            type="number"
            value={formData.remainingPrincipal || ''}
            onChange={(e) => setFormData({ ...formData, remainingPrincipal: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </>
  );

  return (
    <AppLayout title="Emprunts" subtitle="Gérez vos crédits en cours">
      <div className="space-y-6">
        {/* Header with Add button */}
        <div className="flex items-center justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 mr-4">
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Total des passifs</p>
              <p className="text-2xl font-bold text-negative">{formatCurrency(totalLiabilities)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Mensualités totales</p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalMonthlyPayment)}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground mb-1">Emprunts en cours</p>
              <p className="text-2xl font-bold text-foreground">{loans.length}</p>
            </div>
          </div>
          <CrudDialog
            trigger={<Button className="gap-2"><Plus size={18} />Ajouter un emprunt</Button>}
            title="Ajouter un emprunt"
            description="Créez un nouvel emprunt"
            onSubmit={handleAdd}
            open={isAddOpen}
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
          >
            <FormFields />
          </CrudDialog>
        </div>

        {/* Loan Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loans.map((loan) => (
            <div key={loan.id} className="relative">
              <LoanCard loan={loan} />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEdit(loan)}>
                  <Pencil size={16} />
                </Button>
                <DeleteConfirmDialog
                  trigger={<Button variant="ghost" size="icon"><Trash2 size={16} className="text-destructive" /></Button>}
                  onConfirm={() => handleDelete(loan.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Amortization Chart */}
        {loans.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Évolution du capital restant dû
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amortizationData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--negative))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--negative))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    stroke="hsl(var(--negative))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCapital)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <CrudDialog
          trigger={<span />}
          title="Modifier l'emprunt"
          description="Modifiez les informations de l'emprunt"
          onSubmit={handleEdit}
          open={isEditOpen}
          onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingLoan(null); resetForm(); } }}
        >
          <FormFields />
        </CrudDialog>
      </div>
    </AppLayout>
  );
};

export default Loans;
