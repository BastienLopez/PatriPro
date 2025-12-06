import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { formatCurrency, LifeInsuranceContract, LifeInsuranceHolding, LifeInsuranceType } from '@/lib/data';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function LifeInsuranceTab() {
  const { 
    lifeInsuranceContracts, addLifeInsuranceContract, updateLifeInsuranceContract, removeLifeInsuranceContract,
    lifeInsuranceHoldings, addLifeInsuranceHolding, updateLifeInsuranceHolding, removeLifeInsuranceHolding
  } = useData();

  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<LifeInsuranceContract | null>(null);
  const [contractForm, setContractForm] = useState<Partial<LifeInsuranceContract>>({
    name: '', insurer: '', type: 'MULTISUPPORT', currency: 'EUR', managementFeesRate: 0.75, guaranteedRate: 2, openedAt: '', initialDeposit: 0
  });

  const totalValue = lifeInsuranceHoldings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  const fondsEuroValue = lifeInsuranceHoldings.filter(h => h.assetType === 'FONDS_EURO').reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  const ucValue = lifeInsuranceHoldings.filter(h => h.assetType === 'UC').reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);

  const chartData = [
    { name: 'Fonds Euro', value: fondsEuroValue, color: 'hsl(var(--primary))' },
    { name: 'Unités de compte', value: ucValue, color: 'hsl(var(--positive))' },
  ].filter(d => d.value > 0);

  const handleSaveContract = () => {
    if (editingContract) {
      updateLifeInsuranceContract(editingContract.id, contractForm);
    } else {
      addLifeInsuranceContract(contractForm as Omit<LifeInsuranceContract, 'id'>);
    }
    setIsContractDialogOpen(false);
    setEditingContract(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Valeur totale</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Fonds Euro</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(fondsEuroValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unités de compte</p>
            <p className="text-2xl font-bold text-positive">{formatCurrency(ucValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Contrats
            </CardTitle>
            <Dialog open={isContractDialogOpen} onOpenChange={setIsContractDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingContract(null); setContractForm({ name: '', insurer: '', type: 'MULTISUPPORT', currency: 'EUR', managementFeesRate: 0.75, guaranteedRate: 2, openedAt: '', initialDeposit: 0 }); }}>
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editingContract ? 'Modifier' : 'Nouveau contrat'}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nom</Label><Input value={contractForm.name || ''} onChange={e => setContractForm(p => ({ ...p, name: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Assureur</Label><Input value={contractForm.insurer || ''} onChange={e => setContractForm(p => ({ ...p, insurer: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={contractForm.type} onValueChange={(v: LifeInsuranceType) => setContractForm(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FONDS_EURO">Fonds Euro</SelectItem>
                          <SelectItem value="MULTISUPPORT">Multisupport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Date d'ouverture</Label><Input type="date" value={contractForm.openedAt || ''} onChange={e => setContractForm(p => ({ ...p, openedAt: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Frais gestion (%)</Label><Input type="number" step="0.01" value={contractForm.managementFeesRate || ''} onChange={e => setContractForm(p => ({ ...p, managementFeesRate: parseFloat(e.target.value) || 0 }))} /></div>
                    <div className="space-y-2"><Label>Taux garanti (%)</Label><Input type="number" step="0.1" value={contractForm.guaranteedRate || ''} onChange={e => setContractForm(p => ({ ...p, guaranteedRate: parseFloat(e.target.value) || 0 }))} /></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsContractDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleSaveContract}>Enregistrer</Button>
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
                  <TableHead>Assureur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Frais</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lifeInsuranceContracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.name}</TableCell>
                    <TableCell>{contract.insurer}</TableCell>
                    <TableCell>{contract.type === 'FONDS_EURO' ? 'Fonds Euro' : 'Multisupport'}</TableCell>
                    <TableCell>{contract.managementFeesRate}%</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingContract(contract); setContractForm(contract); setIsContractDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => removeLifeInsuranceContract(contract.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Répartition</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Supports</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>ISIN</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lifeInsuranceHoldings.map(h => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">{h.assetName}</TableCell>
                  <TableCell>{h.assetType === 'FONDS_EURO' ? 'Fonds Euro' : 'UC'}</TableCell>
                  <TableCell className="text-muted-foreground">{h.isin || '-'}</TableCell>
                  <TableCell className="text-right">{h.quantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(h.currentPrice * h.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
