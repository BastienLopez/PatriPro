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
import { Plus, Edit, Trash2, FileText, ArrowRight } from 'lucide-react';
import { formatCurrency, generateQuoteNumber, generateInvoiceNumber, Quote, QuoteStatus, QuoteLine, generateId } from '@/lib/data';

const statusLabels: Record<QuoteStatus, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  ACCEPTED: 'Accepté',
  REFUSED: 'Refusé',
};

const statusColors: Record<QuoteStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  SENT: 'bg-blue-500/20 text-blue-400',
  ACCEPTED: 'bg-positive/20 text-positive',
  REFUSED: 'bg-negative/20 text-negative',
};

export function QuotesList() {
  const { quotes, addQuote, updateQuote, removeQuote, addInvoice } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState<Partial<Quote>>({
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
    setEditingQuote(null);
  };

  const handleOpenDialog = (quote?: Quote) => {
    if (quote) {
      setEditingQuote(quote);
      setFormData(quote);
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

    if (editingQuote) {
      updateQuote(editingQuote.id, { ...formData, subtotal, taxAmount, total });
    } else {
      addQuote({
        ...formData,
        number: generateQuoteNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal,
        taxAmount,
        total,
      } as Omit<Quote, 'id'>);
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

  const handleConvertToInvoice = (quote: Quote) => {
    addInvoice({
      number: generateInvoiceNumber(),
      quoteId: quote.id,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      clientAddress: quote.clientAddress,
      clientEmail: quote.clientEmail,
      clientPhone: quote.clientPhone,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'DRAFT',
      lines: quote.lines,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
    });
    updateQuote(quote.id, { status: 'ACCEPTED' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Devis ({quotes.length})
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-1" /> Nouveau devis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuote ? 'Modifier le devis' : 'Nouveau devis'}</DialogTitle>
              <DialogDescription>
                {editingQuote ? 'Modifiez les informations du devis' : 'Créez un nouveau devis pour un client'}
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
                    onValueChange={(value: QuoteStatus) => setFormData(prev => ({ ...prev, status: value }))}
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
                  <Label>Lignes du devis</Label>
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
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map(quote => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.number}</TableCell>
                <TableCell>
                  {quote.clientName}
                  {quote.clientCompany && <span className="text-muted-foreground text-sm block">{quote.clientCompany}</span>}
                </TableCell>
                <TableCell>{new Date(quote.issueDate).toLocaleDateString('fr-FR')}</TableCell>
                <TableCell className="font-medium">{formatCurrency(quote.total)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[quote.status]}>{statusLabels[quote.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {quote.status === 'ACCEPTED' && (
                      <Button variant="ghost" size="icon" onClick={() => handleConvertToInvoice(quote)} title="Convertir en facture">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quote)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeQuote(quote.id)}>
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
  );
}
