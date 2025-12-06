import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Plus, Edit, Trash2, TrendingDown, Wallet, FileText } from 'lucide-react';
import { formatCurrency, calculateCharges, TaxDeclaration, generateId } from '@/lib/data';

export function ChargesSimulator() {
  const { companyProfile, taxDeclarations, addTaxDeclaration, updateTaxDeclaration, removeTaxDeclaration } = useData();
  const [turnover, setTurnover] = useState<number>(1000);
  const [useVL, setUseVL] = useState(companyProfile.usesVersementLiberatoire);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDecl, setEditingDecl] = useState<TaxDeclaration | null>(null);
  const [formData, setFormData] = useState<Partial<TaxDeclaration>>({
    period: '',
    periodType: 'QUARTERLY',
    declaredTurnover: 0,
    socialPaid: 0,
    incomeTaxPaid: 0,
    netIncome: 0,
  });

  const profileWithVL = { ...companyProfile, usesVersementLiberatoire: useVL };
  const charges = calculateCharges(turnover, profileWithVL);

  const resetForm = () => {
    setFormData({
      period: '',
      periodType: 'QUARTERLY',
      declaredTurnover: 0,
      socialPaid: 0,
      incomeTaxPaid: 0,
      netIncome: 0,
    });
    setEditingDecl(null);
  };

  const handleOpenDialog = (decl?: TaxDeclaration) => {
    if (decl) {
      setEditingDecl(decl);
      setFormData(decl);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const calculatedCharges = calculateCharges(formData.declaredTurnover || 0, companyProfile);
    const finalData = {
      ...formData,
      socialPaid: formData.socialPaid || calculatedCharges.social,
      incomeTaxPaid: formData.incomeTaxPaid || calculatedCharges.incomeTax,
      netIncome: (formData.declaredTurnover || 0) - (formData.socialPaid || calculatedCharges.social) - (formData.incomeTaxPaid || calculatedCharges.incomeTax),
      declaredAt: new Date().toISOString().split('T')[0],
    };

    if (editingDecl) {
      updateTaxDeclaration(editingDecl.id, finalData);
    } else {
      addTaxDeclaration(finalData as Omit<TaxDeclaration, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const totalDeclaredTurnover = taxDeclarations.reduce((sum, d) => sum + d.declaredTurnover, 0);
  const totalSocialPaid = taxDeclarations.reduce((sum, d) => sum + d.socialPaid, 0);
  const totalIncomeTaxPaid = taxDeclarations.reduce((sum, d) => sum + d.incomeTaxPaid, 0);

  return (
    <div className="space-y-6">
      {/* Simulator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulateur de charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Montant de la facture / CA (€)</Label>
                <Input
                  type="number"
                  value={turnover}
                  onChange={e => setTurnover(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={useVL} onCheckedChange={setUseVL} />
                <Label>Versement libératoire de l'impôt</Label>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg space-y-1 text-sm">
                <p><span className="text-muted-foreground">Activité:</span> {companyProfile.activityType}</p>
                <p><span className="text-muted-foreground">Taux social:</span> {companyProfile.socialRate}%</p>
                {useVL && <p><span className="text-muted-foreground">Taux IR (VL):</span> {companyProfile.incomeTaxRate}%</p>}
                <p><span className="text-muted-foreground">Taux CFP:</span> {companyProfile.trainingContributionRate}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="h-4 w-4" /> Cotisations sociales
                  </p>
                  <p className="text-xl font-bold text-negative">{formatCurrency(charges.social)}</p>
                  <p className="text-xs text-muted-foreground">{companyProfile.socialRate}% du CA</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Impôt (VL)
                  </p>
                  <p className="text-xl font-bold text-negative">
                    {useVL ? formatCurrency(charges.incomeTax) : '-'}
                  </p>
                  {useVL && <p className="text-xs text-muted-foreground">{companyProfile.incomeTaxRate}% du CA</p>}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">CFP (formation)</p>
                  <p className="text-xl font-bold text-negative">{formatCurrency(charges.cfp)}</p>
                  <p className="text-xs text-muted-foreground">{companyProfile.trainingContributionRate}% du CA</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total à mettre de côté</p>
                  <p className="text-xl font-bold text-negative">{formatCurrency(charges.totalCharges)}</p>
                  <p className="text-xs text-muted-foreground">{((charges.totalCharges / turnover) * 100).toFixed(1)}% du CA</p>
                </div>
              </div>

              <div className="p-4 bg-positive/10 rounded-lg border border-positive/20">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Wallet className="h-4 w-4" /> Net après charges
                </p>
                <p className="text-2xl font-bold text-positive">{formatCurrency(charges.netIncome)}</p>
                <p className="text-xs text-muted-foreground">{((charges.netIncome / turnover) * 100).toFixed(1)}% du CA initial</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">CA déclaré (année)</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalDeclaredTurnover)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cotisations payées</p>
            <p className="text-2xl font-bold text-negative">{formatCurrency(totalSocialPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">IR payé (VL)</p>
            <p className="text-2xl font-bold text-negative">{formatCurrency(totalIncomeTaxPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Declarations History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Historique des déclarations</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Nouvelle déclaration
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDecl ? 'Modifier la déclaration' : 'Nouvelle déclaration'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Période</Label>
                    <Input
                      placeholder="ex: T4 2024"
                      value={formData.period || ''}
                      onChange={e => setFormData(prev => ({ ...prev, period: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.periodType}
                      onValueChange={(value: 'MONTHLY' | 'QUARTERLY') => setFormData(prev => ({ ...prev, periodType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Mensuel</SelectItem>
                        <SelectItem value="QUARTERLY">Trimestriel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CA déclaré (€)</Label>
                  <Input
                    type="number"
                    value={formData.declaredTurnover || ''}
                    onChange={e => setFormData(prev => ({ ...prev, declaredTurnover: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cotisations payées (€)</Label>
                    <Input
                      type="number"
                      value={formData.socialPaid || ''}
                      onChange={e => setFormData(prev => ({ ...prev, socialPaid: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IR payé (€)</Label>
                    <Input
                      type="number"
                      value={formData.incomeTaxPaid || ''}
                      onChange={e => setFormData(prev => ({ ...prev, incomeTaxPaid: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
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
                <TableHead>Période</TableHead>
                <TableHead>CA déclaré</TableHead>
                <TableHead>Cotisations</TableHead>
                <TableHead>IR (VL)</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Déclaré le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxDeclarations.map(decl => (
                <TableRow key={decl.id}>
                  <TableCell className="font-medium">{decl.period}</TableCell>
                  <TableCell>{formatCurrency(decl.declaredTurnover)}</TableCell>
                  <TableCell className="text-negative">{formatCurrency(decl.socialPaid)}</TableCell>
                  <TableCell className="text-negative">{formatCurrency(decl.incomeTaxPaid)}</TableCell>
                  <TableCell className="text-positive">{formatCurrency(decl.netIncome)}</TableCell>
                  <TableCell>{new Date(decl.declaredAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(decl)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeTaxDeclaration(decl.id)}>
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
    </div>
  );
}
