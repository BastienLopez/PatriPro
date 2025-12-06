import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useData } from '@/contexts/DataContext';
import { Holding, formatCurrency, formatNumber, getHoldingValue, getHoldingPnL, getHoldingPnLPercent, AssetType } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HoldingsTableProps {
  holdings: Holding[];
  accountId?: string;
}

export function HoldingsTable({ holdings, accountId }: HoldingsTableProps) {
  const { addHolding, updateHolding, removeHolding } = useData();
  
  const [formData, setFormData] = useState<Omit<Holding, 'id'>>({
    accountId: accountId || '', name: '', symbol: '', isin: null, assetType: 'ETF',
    quantity: 0, buyPrice: 0, currentPrice: 0, ter: 0,
  });
  const [editingItem, setEditingItem] = useState<Holding | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const resetForm = () => setFormData({ accountId: accountId || '', name: '', symbol: '', isin: null, assetType: 'ETF', quantity: 0, buyPrice: 0, currentPrice: 0, ter: 0 });

  const handleAdd = () => {
    if (!formData.name.trim()) { toast({ title: 'Erreur', description: 'Le nom est requis', variant: 'destructive' }); return; }
    addHolding({ ...formData, accountId: accountId || formData.accountId });
    toast({ title: 'Succès', description: 'Ligne ajoutée' });
    resetForm();
  };

  const handleEdit = () => {
    if (!editingItem) return;
    updateHolding(editingItem.id, formData);
    toast({ title: 'Succès', description: 'Ligne modifiée' });
    setEditingItem(null); resetForm();
  };

  const openEdit = (h: Holding) => {
    setEditingItem(h);
    setFormData({ accountId: h.accountId, name: h.name, symbol: h.symbol, isin: h.isin, assetType: h.assetType, quantity: h.quantity, buyPrice: h.buyPrice, currentPrice: h.currentPrice, ter: h.ter });
    setIsEditOpen(true);
  };

  const FormFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nom</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Symbole</Label><Input value={formData.symbol} onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>ISIN</Label><Input value={formData.isin || ''} onChange={(e) => setFormData({ ...formData, isin: e.target.value || null })} /></div>
        <div className="space-y-2"><Label>Type</Label>
          <Select value={formData.assetType} onValueChange={(v) => setFormData({ ...formData, assetType: v as AssetType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="ETF">ETF</SelectItem><SelectItem value="STOCK">Action</SelectItem><SelectItem value="CRYPTO">Crypto</SelectItem><SelectItem value="FUND">Fonds</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>Quantité</Label><Input type="number" step="0.000001" value={formData.quantity || ''} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} /></div>
        <div className="space-y-2"><Label>Prix d'achat</Label><Input type="number" step="0.01" value={formData.buyPrice || ''} onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })} /></div>
        <div className="space-y-2"><Label>Prix actuel</Label><Input type="number" step="0.01" value={formData.currentPrice || ''} onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div className="space-y-2"><Label>TER (%)</Label><Input type="number" step="0.01" value={formData.ter || ''} onChange={(e) => setFormData({ ...formData, ter: parseFloat(e.target.value) || 0 })} /></div>
    </>
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <span className="font-semibold text-foreground">{holdings.length} lignes</span>
        <CrudDialog trigger={<Button variant="outline" size="sm" className="gap-1"><Plus size={16}/>Ajouter</Button>} title="Ajouter une ligne" description="Ajoutez un nouvel actif au portefeuille" onSubmit={handleAdd} open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (!o) resetForm(); }}><FormFields/></CrudDialog>
      </div>
      <Table>
        <TableHeader><TableRow className="border-border"><TableHead className="text-muted-foreground">Nom</TableHead><TableHead className="text-muted-foreground">ISIN</TableHead><TableHead className="text-muted-foreground">Type</TableHead><TableHead className="text-muted-foreground text-right">TER</TableHead><TableHead className="text-muted-foreground text-right">Qté</TableHead><TableHead className="text-muted-foreground text-right">Prix</TableHead><TableHead className="text-muted-foreground text-right">Valeur</TableHead><TableHead className="text-muted-foreground text-right">PnL</TableHead><TableHead className="text-muted-foreground text-right">Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {holdings.map((h) => {
            const value = getHoldingValue(h), pnl = getHoldingPnL(h), pnlPercent = getHoldingPnLPercent(h), isPositive = pnl >= 0;
            return (
              <TableRow key={h.id} className="border-border">
                <TableCell><p className="font-medium text-foreground">{h.name}</p><p className="text-xs text-muted-foreground">{h.symbol}</p></TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">{h.isin || '—'}</TableCell>
                <TableCell><span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{h.assetType}</span></TableCell>
                <TableCell className="text-right font-mono text-muted-foreground">{h.ter ? `${h.ter.toFixed(2)}%` : '—'}</TableCell>
                <TableCell className="text-right font-mono">{formatNumber(h.quantity, 6)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(h.currentPrice)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(value)}</TableCell>
                <TableCell className="text-right"><div className={cn(isPositive ? 'text-positive' : 'text-negative')}><p className="font-medium">{isPositive ? '+' : ''}{formatCurrency(pnl)}</p><p className="text-xs">{isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%</p></div></TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(h)}><Pencil size={14}/></Button><DeleteConfirmDialog trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 size={14} className="text-destructive"/></Button>} onConfirm={() => { removeHolding(h.id); toast({ title: 'Ligne supprimée' }); }}/></div></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <CrudDialog trigger={<span/>} title="Modifier la ligne" description="Modifiez les informations de l'actif" onSubmit={handleEdit} open={isEditOpen} onOpenChange={(o) => { setIsEditOpen(o); if (!o) { setEditingItem(null); resetForm(); } }}><FormFields/></CrudDialog>
    </div>
  );
}
