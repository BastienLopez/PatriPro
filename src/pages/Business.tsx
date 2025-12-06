import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyProfileCard } from '@/components/business/CompanyProfileCard';
import { QuotesList } from '@/components/business/QuotesList';
import { InvoicesList } from '@/components/business/InvoicesList';
import { BusinessSubscriptionsList } from '@/components/business/BusinessSubscriptionsList';
import { ChargesSimulator } from '@/components/business/ChargesSimulator';
import { BusinessAnalytics } from '@/components/business/BusinessAnalytics';

const Business = () => {
  return (
    <AppLayout title="Entreprise" subtitle="Gérez votre activité professionnelle">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-card border border-border mb-6">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="analytics">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <CompanyProfileCard />
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesList />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesList />
        </TabsContent>

        <TabsContent value="subscriptions">
          <BusinessSubscriptionsList />
        </TabsContent>

        <TabsContent value="charges">
          <ChargesSimulator />
        </TabsContent>

        <TabsContent value="analytics">
          <BusinessAnalytics />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Business;
