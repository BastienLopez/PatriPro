import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { User, Key, Globe, Palette, Bell, Shield, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface UserSettings {
  name: string;
  email: string;
  currency: string;
  numberFormat: string;
  darkMode: boolean;
  priceAlerts: boolean;
  billReminders: boolean;
  coingeckoApiKey: string;
  alphaVantageApiKey: string;
}

const defaultSettings: UserSettings = {
  name: 'Utilisateur',
  email: 'user@patripro.fr',
  currency: 'EUR',
  numberFormat: 'fr',
  darkMode: true,
  priceAlerts: false,
  billReminders: true,
  coingeckoApiKey: '',
  alphaVantageApiKey: '',
};

const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('patripro_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply dark mode on mount and when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSave = () => {
    localStorage.setItem('patripro_settings', JSON.stringify(settings));
    toast({
      title: 'Paramètres enregistrés',
      description: 'Vos préférences ont été sauvegardées.',
    });
  };

  const toggleDarkMode = (checked: boolean) => {
    setSettings(prev => ({ ...prev, darkMode: checked }));
    // Immediately persist dark mode preference
    const newSettings = { ...settings, darkMode: checked };
    localStorage.setItem('patripro_settings', JSON.stringify(newSettings));
  };

  return (
    <AppLayout title="Paramètres" subtitle="Configurez votre application">
      <div className="max-w-3xl space-y-6">
        {/* Profile */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Profil</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input 
                id="name" 
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Préférences</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Devise principale</p>
                <p className="text-sm text-muted-foreground">Devise utilisée pour l'affichage</p>
              </div>
              <Select 
                value={settings.currency} 
                onValueChange={(v) => setSettings(prev => ({ ...prev, currency: v }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Format des nombres</p>
                <p className="text-sm text-muted-foreground">Format d'affichage des montants</p>
              </div>
              <Select 
                value={settings.numberFormat} 
                onValueChange={(v) => setSettings(prev => ({ ...prev, numberFormat: v }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">1 234,56</SelectItem>
                  <SelectItem value="en">1,234.56</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Apparence</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="text-muted-foreground" size={20} />
              ) : (
                <Sun className="text-muted-foreground" size={20} />
              )}
              <div>
                <p className="font-medium text-foreground">Mode sombre</p>
                <p className="text-sm text-muted-foreground">Utiliser le thème sombre</p>
              </div>
            </div>
            <Switch 
              checked={settings.darkMode} 
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Intégrations API</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coingecko">CoinGecko API Key</Label>
              <Input 
                id="coingecko" 
                type="password" 
                placeholder="Entrez votre clé API"
                value={settings.coingeckoApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, coingeckoApiKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Pour les prix des cryptomonnaies en temps réel</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alpha">Alpha Vantage API Key</Label>
              <Input 
                id="alpha" 
                type="password" 
                placeholder="Entrez votre clé API"
                value={settings.alphaVantageApiKey}
                onChange={(e) => setSettings(prev => ({ ...prev, alphaVantageApiKey: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Pour les prix des actions et ETF</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="text-primary" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertes de prix</p>
                <p className="text-sm text-muted-foreground">Recevoir des alertes quand un actif atteint un seuil</p>
              </div>
              <Switch 
                checked={settings.priceAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, priceAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rappels de factures</p>
                <p className="text-sm text-muted-foreground">Rappels avant les échéances</p>
              </div>
              <Switch 
                checked={settings.billReminders}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, billReminders: checked }))}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>Enregistrer les modifications</Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;