import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Building, Edit, Save, X } from 'lucide-react';
import { 
  legalStatusLabels, 
  activityTypeLabels, 
  defaultRatesByActivity,
  LegalStatus,
  ActivityType 
} from '@/lib/data';

export function CompanyProfileCard() {
  const { companyProfile, updateCompanyProfile } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(companyProfile);

  const handleSave = () => {
    updateCompanyProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(companyProfile);
    setIsEditing(false);
  };

  const handleActivityTypeChange = (value: ActivityType) => {
    const defaults = defaultRatesByActivity[value];
    setEditedProfile(prev => ({
      ...prev,
      activityType: value,
      socialRate: defaults.socialRate,
      incomeTaxRate: defaults.incomeTaxRate,
    }));
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modifier le profil entreprise</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Enregistrer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input 
                value={editedProfile.name}
                onChange={e => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>SIRET</Label>
              <Input 
                value={editedProfile.siret}
                onChange={e => setEditedProfile(prev => ({ ...prev, siret: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Statut juridique</Label>
              <Select 
                value={editedProfile.legalStatus}
                onValueChange={(value: LegalStatus) => setEditedProfile(prev => ({ ...prev, legalStatus: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(legalStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type d'activité</Label>
              <Select 
                value={editedProfile.activityType}
                onValueChange={handleActivityTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Adresse</Label>
              <Input 
                value={editedProfile.address}
                onChange={e => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Numéro TVA (optionnel)</Label>
              <Input 
                value={editedProfile.vatNumber || ''}
                onChange={e => setEditedProfile(prev => ({ ...prev, vatNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de création</Label>
              <Input 
                type="date"
                value={editedProfile.creationDate}
                onChange={e => setEditedProfile(prev => ({ ...prev, creationDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold mb-4">Taux et cotisations (2025)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taux cotisations sociales (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={editedProfile.socialRate}
                  onChange={e => setEditedProfile(prev => ({ ...prev, socialRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Taux versement libératoire IR (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={editedProfile.incomeTaxRate}
                  onChange={e => setEditedProfile(prev => ({ ...prev, incomeTaxRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Taux CFE (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={editedProfile.cfeRate}
                  onChange={e => setEditedProfile(prev => ({ ...prev, cfeRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Taux CFP - Formation (%)</Label>
                <Input 
                  type="number"
                  step="0.1"
                  value={editedProfile.trainingContributionRate}
                  onChange={e => setEditedProfile(prev => ({ ...prev, trainingContributionRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2 md:col-span-2">
                <Switch 
                  checked={editedProfile.usesVersementLiberatoire}
                  onCheckedChange={checked => setEditedProfile(prev => ({ ...prev, usesVersementLiberatoire: checked }))}
                />
                <Label>Versement libératoire de l'impôt sur le revenu</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{companyProfile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{legalStatusLabels[companyProfile.legalStatus]}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="h-4 w-4 mr-1" /> Modifier
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">SIRET</p>
            <p className="font-medium">{companyProfile.siret}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type d'activité</p>
            <p className="font-medium">{activityTypeLabels[companyProfile.activityType]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-medium">{companyProfile.address}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date de création</p>
            <p className="font-medium">{new Date(companyProfile.creationDate).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Versement libératoire</p>
            <p className="font-medium">{companyProfile.usesVersementLiberatoire ? 'Oui' : 'Non'}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-4">Taux applicables</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Cotisations sociales</p>
              <p className="text-xl font-bold text-foreground">{companyProfile.socialRate}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">Impôt (VL)</p>
              <p className="text-xl font-bold text-foreground">{companyProfile.incomeTaxRate}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">CFE</p>
              <p className="text-xl font-bold text-foreground">{companyProfile.cfeRate}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">CFP</p>
              <p className="text-xl font-bold text-foreground">{companyProfile.trainingContributionRate}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
