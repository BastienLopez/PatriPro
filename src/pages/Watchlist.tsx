import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Eye, TrendingUp, TrendingDown, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDialog } from '@/components/crud/CrudDialog';
import { DeleteConfirmDialog } from '@/components/crud/DeleteConfirmDialog';
import { formatCurrency, WatchlistItem, AssetType } from '@/lib/data';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Watchlist = () => {
  const { watchlist, addWatchlistItem, updateWatchlistItem, removeWatchlistItem } = useData();

  const [formData, setFormData] = useState<Omit<WatchlistItem, 'id'>>({
    name: '',
    symbol: '',
    assetType: 'STOCK',
    currentPrice: 0,
    change24h: 0,
    change7d: 0,
    change1m: 0,
  });
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '', symbol: '', assetType: 'STOCK',
      currentPrice: 0, change24h: 0, change7d: 0, change1m: 0,
    });
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.symbol.trim()) {
      toast({ title: 'Erreur', description: 'Le nom et le symbole sont requis', variant: 'destructive' });
      return;
    }
    addWatchlistItem(formData);
    toast({ title: 'Succès', description: 'Ajouté à la watchlist' });
    resetForm();
  };

  const handleEdit = () => {
    if (!editingItem) return;
    updateWatchlistItem(editingItem.id, formData);
    toast({ title: 'Succès', description: 'Élément modifié' });
    setEditingItem(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    removeWatchlistItem(id);
    toast({ title: 'Supprimé de la watchlist' });
  };

  const openEdit = (item: WatchlistItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      symbol: item.symbol,
      assetType: item.assetType,
      currentPrice: item.currentPrice,
      change24h: item.change24h,
      change7d: item.change7d,
      change1m: item.change1m,
    });
    setIsEditOpen(true);
  };

  const FormFields = () => (
    <>
      <div className="space-y-2">
        <Label>Nom</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="ex: Tesla"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Symbole</Label>
          <Input
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            placeholder="ex: TSLA"
          />
        </div>
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={formData.assetType} onValueChange={(v) => setFormData({ ...formData, assetType: v as AssetType })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STOCK">Action</SelectItem>
              <SelectItem value="ETF">ETF</SelectItem>
              <SelectItem value="CRYPTO">Crypto</SelectItem>
              <SelectItem value="FUND">Fonds</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Prix actuel (€)</Label>
        <Input
          type="number"
          step="0.01"
          value={formData.currentPrice || ''}
          onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Var. 24h (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.change24h || ''}
            onChange={(e) => setFormData({ ...formData, change24h: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Var. 7j (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.change7d || ''}
            onChange={(e) => setFormData({ ...formData, change7d: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Var. 1m (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.change1m || ''}
            onChange={(e) => setFormData({ ...formData, change1m: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </>
  );

  return (
    <AppLayout title="Watchlist" subtitle="Suivez les actifs qui vous intéressent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="text-primary" size={24} />
            <span className="text-lg font-semibold text-foreground">
              {watchlist.length} actifs suivis
            </span>
          </div>
          <CrudDialog
            trigger={<Button className="gap-2"><Plus size={18} />Ajouter à la watchlist</Button>}
            title="Ajouter à la watchlist"
            description="Ajoutez un actif à surveiller"
            onSubmit={handleAdd}
            open={isAddOpen}
            onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}
          >
            <FormFields />
          </CrudDialog>
        </div>

        {/* Watchlist Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Actif</div>
            <div className="text-right">Prix</div>
            <div className="text-right">24h</div>
            <div className="text-right">7j</div>
            <div className="text-right">1m</div>
            <div className="text-right">Actions</div>
          </div>
          
          {watchlist.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun actif dans votre watchlist
            </div>
          ) : (
            <div className="divide-y divide-border">
              {watchlist.map((item) => (
                <div key={item.id} className="grid grid-cols-7 gap-4 p-4 items-center hover:bg-secondary/50 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground">
                        {item.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.symbol} • {item.assetType}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {item.assetType === 'CRYPTO' && item.currentPrice < 1 
                        ? `${item.currentPrice.toFixed(4)} €`
                        : formatCurrency(item.currentPrice)
                      }
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1',
                      item.change24h >= 0 ? 'text-positive' : 'text-negative'
                    )}>
                      {item.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-medium">
                        {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1',
                      item.change7d >= 0 ? 'text-positive' : 'text-negative'
                    )}>
                      {item.change7d >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-medium">
                        {item.change7d >= 0 ? '+' : ''}{item.change7d.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      'flex items-center justify-end gap-1',
                      item.change1m >= 0 ? 'text-positive' : 'text-negative'
                    )}>
                      {item.change1m >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span className="font-medium">
                        {item.change1m >= 0 ? '+' : ''}{item.change1m.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Pencil size={16} />
                    </Button>
                    <DeleteConfirmDialog
                      trigger={<Button variant="ghost" size="icon"><Trash2 size={16} className="text-destructive" /></Button>}
                      onConfirm={() => handleDelete(item.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <CrudDialog
          trigger={<span />}
          title="Modifier l'élément"
          description="Modifiez les informations de l'actif"
          onSubmit={handleEdit}
          open={isEditOpen}
          onOpenChange={(open) => { setIsEditOpen(open); if (!open) { setEditingItem(null); resetForm(); } }}
        >
          <FormFields />
        </CrudDialog>
      </div>
    </AppLayout>
  );
};

export default Watchlist;
