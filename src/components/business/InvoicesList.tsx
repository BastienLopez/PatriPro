import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Receipt, CheckCircle } from 'lucide-react';
import { formatCurrency, generateInvoiceNumber, Invoice, InvoiceStatus, QuoteLine, generateId } from '@/lib/data';

const statusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyée',
  PAID: 'Payée',
  OVERDUE: 'En retard',
};

const statusColors: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-blue-500/20 text-blue-400',
  PAID: 'bg-positive/20 text-positive',
  OVERDUE: 'bg-negative/20 text-negative',
};

export function InvoicesList() {
  const { invoices, addInvoice, updateInvoice, removeInvoice } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    clientName: '',
    clientCompany: '',
    clientAddress: '',
    clientEmail: '',
    clientPhone: '',
    status: 'DRAFT',
    lines: [],
  });

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientCompany: '',
      clientAddress: '',
      clientEmail: '',
      clientPhone: '',
      status: 'DRAFT',
      lines: [],
    });
    setEditingInvoice(null);
  };

  const handleOpenDialog = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData(invoice);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const lines = formData.lines || [];
    const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
    const taxAmount = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice * (line.vatRate / 100), 0);
    const total = subtotal + taxAmount;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, { ...formData, subtotal, taxAmount, total });
    } else {
      addInvoice({
        ...formData,
        number: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal,
        taxAmount,
        total,
      } as Omit<Invoice, 'id'>);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleAddLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...(prev.lines || []), { id: generateId(), description: '', quantity: 1, unitPrice: 0, vatRate: 0 }],
    }));
  };

  const handleUpdateLine = (index: number, updates: Partial<QuoteLine>) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines?.map((line, i) => i === index ? { ...line, ...updates } : line),
    }));
  };

  const handleRemoveLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines?.filter((_, i) => i !== index),
    }));
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    updateInvoice(invoice.id, { 
      status: 'PAID', 
      paymentDate: new Date().toISOString().split('T')[0] 
    });
  };

  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter(i => i.status !== 'PAID').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total encaissé</p>
            <p className="text-2xl font-bold text-positive">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">En attente</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Nombre de factures</p>
            <p className="text-2xl font-bold text-foreground">{invoices.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Factures ({invoices.length})
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-1" /> Nouvelle facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}</DialogTitle>
                <DialogDescription>
                  {editingInvoice ? 'Modifiez les informations de la facture' : 'Créez une nouvelle facture'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du client *</Label>
                    <Input
                      value={formData.clientName || ''}
                      onChange={e => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entreprise</Label>
                    <Input
                      value={formData.clientCompany || ''}
                      onChange={e => setFormData(prev => ({ ...prev, clientCompany: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.clientEmail || ''}
                      onChange={e => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.clientPhone || ''}
                      onChange={e => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Adresse *</Label>
                    <Input
                      value={formData.clientAddress || ''}
                      onChange={e => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: InvoiceStatus) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Lignes de la facture</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                  {formData.lines?.map((line, index) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 mb-2">
                      <Input
                        className="col-span-5"
                        placeholder="Description"
                        value={line.description}
                        onChange={e => handleUpdateLine(index, { description: e.target.value })}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Qté"
                        value={line.quantity}
                        onChange={e => handleUpdateLine(index, { quantity: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Prix"
                        value={line.unitPrice}
                        onChange={e => handleUpdateLine(index, { unitPrice: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="TVA %"
                        value={line.vatRate}
                        onChange={e => handleUpdateLine(index, { vatRate: parseFloat(e.target.value) || 0 })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1"
                        onClick={() => handleRemoveLine(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>
                    {invoice.clientName}
                    {invoice.clientCompany && <span className="text-muted-foreground text-sm block">{invoice.clientCompany}</span>}
                  </TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>{statusLabels[invoice.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {invoice.status !== 'PAID' && (
                        <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(invoice)} title="Marquer comme payée">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeInvoice(invoice.id)}>
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
