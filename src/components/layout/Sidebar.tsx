import { useState } from 'react';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  PiggyBank,
  CreditCard,
  Wallet,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Portefeuilles', path: '/portfolios' },
  { icon: Building2, label: 'Comptes bancaires', path: '/accounts' },
  { icon: PiggyBank, label: 'Livrets', path: '/savings' },
  { icon: CreditCard, label: 'Emprunts', path: '/loans' },
  { icon: Wallet, label: 'Budget', path: '/budget' },
  { icon: TrendingUp, label: 'Cashflow', path: '/cashflow' },
  { icon: Calendar, label: 'Calendrier', path: '/calendar' },
  { icon: Eye, label: 'Watchlist', path: '/watchlist' },
  { icon: BarChart3, label: 'Insights', path: '/insights' },
  { icon: Building, label: 'Entreprise', path: '/business' },
  { icon: Settings, label: 'Paramètres', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <h1 className="text-xl font-bold text-foreground">
            Patri<span className="text-primary">PRO</span>
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
              collapsed && 'justify-center'
            )}
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon size={20} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
            U
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Utilisateur</p>
              <p className="text-xs text-muted-foreground truncate">user@patripro.fr</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
