import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import { formatCurrency, BusinessSubscription, BillingPeriod } from '@/lib/data';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const periodLabels: Record<BillingPeriod, string> = {
  MONTHLY: 'Mensuel',
  YEARLY: 'Annuel',
};

const categoryColors: Record<string, string> = {
  'Outils dev': 'hsl(217, 91%, 60%)',
  'Hébergement': 'hsl(142, 71%, 45%)',
  'SaaS': 'hsl(262, 83%, 58%)',
  'IA': 'hsl(47, 96%, 53%)',
  'Design': 'hsl(340, 82%, 52%)',
  'Autre': 'hsl(0, 0%, 60%)',
};

export function BusinessSubscriptionsList() {
  const { businessSubscriptions, addBusinessSubscription, updateBusinessSubscription, removeBusinessSubscription } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<BusinessSubscription | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessSubscription>>({
    name: '',
    amount: 0,
    billingPeriod: 'MONTHLY',
    nextBillingDate: '',
    category: 'SaaS',
    paymentMethod: 'CB',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      billingPeriod: 'MONTHLY',
      nextBillingDate: '',
      category: 'SaaS',
      paymentMethod: 'CB',
    });
    setEditingSub(null);
  };

  const handleOpenDialog = (sub?: BusinessSubscription) => {
    if (sub) {
      setEditingSub(sub);
      setFormData(sub);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingSub) {
      updateBusinessSubscription(editingSub.id, formData);
    } else {
      addBusinessSubscription(formData as Omit<BusinessSubscription, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  // Calculate totals
  const monthlyTotal = businessSubscriptions
    .filter(s => s.billingPeriod === 'MONTHLY')
    .reduce((sum, s) => sum + s.amount, 0);
  const yearlyTotal = businessSubscriptions
    .filter(s => s.billingPeriod === 'YEARLY')
    .reduce((sum, s) => sum + s.amount, 0);
  const annualizedTotal = monthlyTotal * 12 + yearlyTotal;

  // Prepare chart data by category
  const categoryTotals = businessSubscriptions.reduce((acc, sub) => {
    const annualAmount = sub.billingPeriod === 'MONTHLY' ? sub.amount * 12 : sub.amount;
    acc[sub.category] = (acc[sub.category] || 0) + annualAmount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name] || categoryColors['Autre'],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Coût mensuel</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Coût annuel</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(annualizedTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nombre d'abonnements</p>
            <p className="text-2xl font-bold text-foreground">{businessSubscriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnements professionnels
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSub ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}</DialogTitle>
                  <DialogDescription>
                    {editingSub ? 'Modifiez les informations de l\'abonnement' : 'Ajoutez un nouvel abonnement professionnel'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Montant (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Périodicité</Label>
                      <Select
                        value={formData.billingPeriod}
                        onValueChange={(value: BillingPeriod) => setFormData(prev => ({ ...prev, billingPeriod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(periodLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(categoryColors).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mode de paiement</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={value => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CB">Carte bancaire</SelectItem>
                          <SelectItem value="Prélèvement">Prélèvement</SelectItem>
                          <SelectItem value="PayPal">PayPal</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Prochaine facturation</Label>
                    <Input
                      type="date"
                      value={formData.nextBillingDate || ''}
                      onChange={e => setFormData(prev => ({ ...prev, nextBillingDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleSave}>Enregistrer</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Périodicité</TableHead>
                  <TableHead>Prochaine fact.</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessSubscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell>{sub.category}</TableCell>
                    <TableCell>{formatCurrency(sub.amount)}</TableCell>
                    <TableCell>{periodLabels[sub.billingPeriod]}</TableCell>
                    <TableCell>{new Date(sub.nextBillingDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(sub)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeBusinessSubscription(sub.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
