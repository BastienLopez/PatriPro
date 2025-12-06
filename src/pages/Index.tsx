import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { PatrimonyChart } from '@/components/dashboard/PatrimonyChart';
import { AllocationChart } from '@/components/dashboard/AllocationChart';
import { KPICards } from '@/components/dashboard/KPICards';
import {
  getTotalPatrimony,
  getNetPatrimony,
  getTotalMonthlyIncome,
  formatCurrency,
} from '@/lib/data';
import { Wallet, TrendingUp, Banknote, BarChart3 } from 'lucide-react';

const Index = () => {
  const patrimonyBrut = getTotalPatrimony();
  const patrimonyNet = getNetPatrimony();
  const revenusAnnuels = getTotalMonthlyIncome() * 12;

  return (
    <AppLayout title="Dashboard" subtitle="Vue d'ensemble de votre patrimoine">
      <div className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Patrimoine brut"
            value={formatCurrency(patrimonyBrut)}
            change={30.36}
            changeLabel="vs année dernière"
            icon={Wallet}
            trend="up"
          />
          <StatCard
            title="Patrimoine net"
            value={formatCurrency(patrimonyNet)}
            change={-5.2}
            changeLabel="vs mois dernier"
            icon={TrendingUp}
            trend="down"
          />
          <StatCard
            title="Revenus annuels"
            value={formatCurrency(revenusAnnuels)}
            icon={Banknote}
            trend="neutral"
          />
          <StatCard
            title="Rendement global"
            value="+12.4%"
            change={12.4}
            icon={BarChart3}
            trend="up"
          />
        </div>

        {/* KPI Cards */}
        <KPICards />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PatrimonyChart />
          </div>
          <div>
            <AllocationChart />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
