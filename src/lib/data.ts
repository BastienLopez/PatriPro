// Types
export type AccountType = 'CURRENT' | 'SAVINGS' | 'PEA' | 'CTO' | 'CRYPTO_WALLET' | 'LIFE_INSURANCE';
export type SavingsType = 'LIVRET_A' | 'LIVRET_JEUNE' | 'LDDS' | 'LEP' | 'PEL' | 'CEL' | 'COMPTE_A_TERME' | 'AUTRE_LIVRET';
export type AssetType = 'STOCK' | 'ETF' | 'CRYPTO' | 'FUND' | 'CASH' | 'FONDS_EURO' | 'UC';
export type TransactionType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAW' | 'INTEREST' | 'DIVIDEND';
export type ExpenseCategory = 'HOUSING' | 'FOOD' | 'SUBSCRIPTIONS' | 'TRANSPORT' | 'LEISURE' | 'HEALTH' | 'UTILITIES' | 'BANKING' | 'OTHER';
export type RecurringEventType = 'INCOME' | 'BILL' | 'LOAN_PAYMENT' | 'OTHER';

// Business Types
export type LegalStatus = 'MICRO_ENTREPRISE' | 'SASU' | 'SARL' | 'EURL' | 'AUTO_ENTREPRENEUR' | 'OTHER';
export type ActivityType = 'BIC_VENTE' | 'BIC_SERVICE' | 'BNC_SERVICE';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REFUSED';
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
export type BillingPeriod = 'MONTHLY' | 'YEARLY';
export type LifeInsuranceType = 'FONDS_EURO' | 'MULTISUPPORT';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
}

export interface SavingsAccount {
  id: string;
  name: string;
  type: SavingsType;
  rate: number;
  balance: number;
  ceiling: number | null;
  openedAt: string;
}

export interface Holding {
  id: string;
  accountId: string;
  name: string;
  symbol: string;
  isin: string | null;
  assetType: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  ter: number;
}

export interface Income {
  id: string;
  label: string;
  amount: number;
  frequency: 'MONTHLY' | 'ONCE' | 'YEARLY';
  dayOfMonth?: number;
}

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
  frequency: 'MONTHLY' | 'ONCE' | 'YEARLY';
  dayOfMonth?: number;
}

export interface Loan {
  id: string;
  name: string;
  principal: number;
  annualRate: number;
  termYears: number;
  startDate: string;
  monthlyPayment: number;
  remainingPrincipal: number;
  remainingMonths: number;
}

export interface RecurringEvent {
  id: string;
  type: RecurringEventType;
  label: string;
  amount: number;
  category?: ExpenseCategory;
  dayOfMonth: number;
}

// Business Interfaces
export interface CompanyProfile {
  id: string;
  legalStatus: LegalStatus;
  activityType: ActivityType;
  name: string;
  siret: string;
  address: string;
  vatNumber?: string;
  creationDate: string;
  usesVersementLiberatoire: boolean;
  socialRate: number;
  incomeTaxRate: number;
  cfeRate: number;
  trainingContributionRate: number;
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface Quote {
  id: string;
  number: string;
  clientName: string;
  clientCompany?: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone?: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  lines: QuoteLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  quoteId?: string;
  clientName: string;
  clientCompany?: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lines: QuoteLine[];
  subtotal: number;
  taxAmount: number;
  total: number;
  paymentDate?: string;
}

export interface BusinessSubscription {
  id: string;
  name: string;
  amount: number;
  billingPeriod: BillingPeriod;
  nextBillingDate: string;
  category: string;
  paymentMethod: string;
}

export interface TaxDeclaration {
  id: string;
  period: string;
  periodType: 'MONTHLY' | 'QUARTERLY';
  declaredTurnover: number;
  socialPaid: number;
  incomeTaxPaid: number;
  netIncome: number;
  declaredAt: string;
}

export interface LifeInsuranceContract {
  id: string;
  name: string;
  insurer: string;
  type: LifeInsuranceType;
  currency: string;
  managementFeesRate: number;
  guaranteedRate: number;
  openedAt: string;
  initialDeposit: number;
}

export interface LifeInsuranceHolding {
  id: string;
  contractId: string;
  assetName: string;
  isin?: string;
  symbol?: string;
  assetType: 'FONDS_EURO' | 'UC';
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  assetType: AssetType;
  currentPrice: number;
  change24h: number;
  change7d: number;
  change1m: number;
}

// Default rates by activity type (2025)
export const defaultRatesByActivity: Record<ActivityType, { socialRate: number; incomeTaxRate: number }> = {
  BIC_VENTE: { socialRate: 12.3, incomeTaxRate: 1.0 },
  BIC_SERVICE: { socialRate: 21.2, incomeTaxRate: 1.7 },
  BNC_SERVICE: { socialRate: 24.6, incomeTaxRate: 2.2 },
};

// Demo Data
export let accounts: Account[] = [
  { id: '1', name: 'Compte courant Boursorama', type: 'CURRENT', currency: 'EUR', balance: 500 },
  { id: '4', name: 'PEA Boursorama', type: 'PEA', currency: 'EUR', balance: 0 },
  { id: '5', name: 'CTO Trade Republic', type: 'CTO', currency: 'EUR', balance: 0 },
  { id: '6', name: 'Wallet Crypto', type: 'CRYPTO_WALLET', currency: 'EUR', balance: 0 },
];

export let savingsAccounts: SavingsAccount[] = [
  { id: 's1', name: 'Livret A', type: 'LIVRET_A', rate: 3.0, balance: 2322, ceiling: 22950, openedAt: '2020-01-15' },
  { id: 's2', name: 'Livret Jeune', type: 'LIVRET_JEUNE', rate: 4.0, balance: 1662, ceiling: 1600, openedAt: '2018-06-01' },
  { id: 's3', name: 'LDDS', type: 'LDDS', rate: 3.0, balance: 5000, ceiling: 12000, openedAt: '2021-03-10' },
  { id: 's4', name: 'LEP', type: 'LEP', rate: 5.0, balance: 3500, ceiling: 10000, openedAt: '2022-01-01' },
  { id: 's5', name: 'PEL', type: 'PEL', rate: 2.25, balance: 8000, ceiling: 61200, openedAt: '2024-01-15' },
];

export let holdings: Holding[] = [
  // PEA Holdings
  {
    id: 'h1',
    accountId: '4',
    name: 'Amundi MSCI World PEA UCITS ETF Acc',
    symbol: 'AM.PEA MS.WLD',
    isin: 'FR001400U5Q4',
    assetType: 'ETF',
    quantity: 703,
    buyPrice: 5.39,
    currentPrice: 5.39,
    ter: 0.38,
  },
  {
    id: 'h2',
    accountId: '4',
    name: 'Amundi MSCI EM ESG UCITS ETF',
    symbol: 'PEAEM',
    isin: 'FR0013412020',
    assetType: 'ETF',
    quantity: 42,
    buyPrice: 28.27,
    currentPrice: 28.27,
    ter: 0.20,
  },
  {
    id: 'h3',
    accountId: '4',
    name: 'Amundi MSCI EMU UCITS ETF',
    symbol: 'AM.EMUMSC',
    isin: 'FR0010655704',
    assetType: 'ETF',
    quantity: 63,
    buyPrice: 16.64,
    currentPrice: 16.64,
    ter: 0.12,
  },
  {
    id: 'h4',
    accountId: '4',
    name: 'S&P 500 Swap PEA UCITS ETF',
    symbol: 'SP500PEA',
    isin: 'FR0011871128',
    assetType: 'ETF',
    quantity: 139,
    buyPrice: 5.67,
    currentPrice: 5.67,
    ter: 0.15,
  },
  // CTO Holdings
  {
    id: 'h5',
    accountId: '5',
    name: 'NVIDIA',
    symbol: 'NVDA',
    isin: 'US67066G1040',
    assetType: 'STOCK',
    quantity: 1.194815,
    buyPrice: 155.67,
    currentPrice: 155.67,
    ter: 0,
  },
  {
    id: 'h6',
    accountId: '5',
    name: 'Apple',
    symbol: 'AAPL',
    isin: 'US0378331005',
    assetType: 'STOCK',
    quantity: 0.507674,
    buyPrice: 246.22,
    currentPrice: 246.22,
    ter: 0,
  },
  {
    id: 'h7',
    accountId: '5',
    name: 'Physical Gold (USD)',
    symbol: 'XAUUSD',
    isin: 'GB00B00FHZ82',
    assetType: 'FUND',
    quantity: 1.006404,
    buyPrice: 695.55,
    currentPrice: 695.55,
    ter: 0.40,
  },
  {
    id: 'h8',
    accountId: '5',
    name: 'Amazon',
    symbol: 'AMZN',
    isin: 'US0231351067',
    assetType: 'STOCK',
    quantity: 0.278427,
    buyPrice: 204.72,
    currentPrice: 204.72,
    ter: 0,
  },
  // Crypto Holdings
  {
    id: 'h9',
    accountId: '6',
    name: 'Bitcoin',
    symbol: 'BTC',
    isin: null,
    assetType: 'CRYPTO',
    quantity: 0.02489924,
    buyPrice: 78315.64,
    currentPrice: 78315.64,
    ter: 0,
  },
  {
    id: 'h10',
    accountId: '6',
    name: 'Ethereum',
    symbol: 'ETH',
    isin: null,
    assetType: 'CRYPTO',
    quantity: 0.04192014,
    buyPrice: 2624.04,
    currentPrice: 2624.04,
    ter: 0,
  },
];

export let incomes: Income[] = [
  { id: 'i1', label: 'Salaire', amount: 1300, frequency: 'MONTHLY', dayOfMonth: 28 },
  { id: 'i2', label: 'CAF', amount: 300, frequency: 'MONTHLY', dayOfMonth: 5 },
  { id: 'i3', label: 'Prime', amount: 170, frequency: 'MONTHLY', dayOfMonth: 28 },
];

export let expenses: Expense[] = [
  { id: 'e1', label: 'Loyer', category: 'HOUSING', amount: 505, frequency: 'MONTHLY', dayOfMonth: 1 },
  { id: 'e2', label: 'Assurance habitation', category: 'HOUSING', amount: 15, frequency: 'MONTHLY', dayOfMonth: 5 },
  { id: 'e3', label: 'Courses', category: 'FOOD', amount: 250, frequency: 'MONTHLY' },
  { id: 'e4', label: 'Spotify', category: 'SUBSCRIPTIONS', amount: 7.07, frequency: 'MONTHLY', dayOfMonth: 5 },
  { id: 'e5', label: 'ChatGPT Plus', category: 'SUBSCRIPTIONS', amount: 20, frequency: 'MONTHLY', dayOfMonth: 10 },
  { id: 'e6', label: 'Box + Tel', category: 'UTILITIES', amount: 50, frequency: 'MONTHLY', dayOfMonth: 15 },
  { id: 'e7', label: 'Élec & eau & gaz', category: 'UTILITIES', amount: 163.50, frequency: 'MONTHLY', dayOfMonth: 20 },
  { id: 'e8', label: 'Frais bancaires', category: 'BANKING', amount: 10, frequency: 'MONTHLY', dayOfMonth: 1 },
  { id: 'e9', label: 'UberEats', category: 'FOOD', amount: 60, frequency: 'MONTHLY' },
  { id: 'e10', label: 'Sorties', category: 'LEISURE', amount: 50, frequency: 'MONTHLY' },
];

export let loans: Loan[] = [
  {
    id: 'l1',
    name: 'Prêt immobilier appartement',
    principal: 150000,
    annualRate: 2.5,
    termYears: 20,
    startDate: '2022-01-01',
    monthlyPayment: 795.98,
    remainingPrincipal: 138500,
    remainingMonths: 216,
  },
];

export let recurringEvents: RecurringEvent[] = [
  { id: 're1', type: 'INCOME', label: 'Salaire', amount: 1300, dayOfMonth: 28 },
  { id: 're2', type: 'INCOME', label: 'CAF', amount: 300, dayOfMonth: 5 },
  { id: 're3', type: 'BILL', label: 'Loyer', amount: 505, category: 'HOUSING', dayOfMonth: 1 },
  { id: 're4', type: 'BILL', label: 'Spotify', amount: 7.07, category: 'SUBSCRIPTIONS', dayOfMonth: 5 },
  { id: 're5', type: 'BILL', label: 'Netflix', amount: 13.49, category: 'SUBSCRIPTIONS', dayOfMonth: 8 },
  { id: 're6', type: 'BILL', label: 'Box Internet', amount: 30, category: 'UTILITIES', dayOfMonth: 15 },
  { id: 're7', type: 'BILL', label: 'Électricité', amount: 80, category: 'UTILITIES', dayOfMonth: 20 },
  { id: 're8', type: 'LOAN_PAYMENT', label: 'Prêt immo', amount: 795.98, dayOfMonth: 5 },
];

// Business Demo Data
export let companyProfile: CompanyProfile = {
  id: 'cp1',
  legalStatus: 'MICRO_ENTREPRISE',
  activityType: 'BNC_SERVICE',
  name: 'Micro-entreprise Bastien - Développement web',
  siret: '00000000000000',
  address: 'Adresse de démo, 51100 Reims',
  creationDate: '2023-01-01',
  usesVersementLiberatoire: true,
  socialRate: 24.6,
  incomeTaxRate: 2.2,
  cfeRate: 0,
  trainingContributionRate: 0.2,
};

export let quotes: Quote[] = [
  {
    id: 'q1',
    number: 'DV-2024-001',
    clientName: 'Jean Dupont',
    clientCompany: 'Startup Innovation SAS',
    clientAddress: '123 Rue de Paris, 75001 Paris',
    clientEmail: 'jean@startup.fr',
    clientPhone: '0612345678',
    issueDate: '2024-11-01',
    validUntil: '2024-12-01',
    status: 'ACCEPTED',
    lines: [
      { id: 'ql1', description: 'Développement site web vitrine', quantity: 1, unitPrice: 2500, vatRate: 0 },
      { id: 'ql2', description: 'Intégration CMS', quantity: 1, unitPrice: 800, vatRate: 0 },
    ],
    subtotal: 3300,
    taxAmount: 0,
    total: 3300,
  },
  {
    id: 'q2',
    number: 'DV-2024-002',
    clientName: 'Marie Martin',
    clientCompany: 'Agence Créative',
    clientAddress: '45 Avenue des Champs, 69001 Lyon',
    clientEmail: 'marie@agence.fr',
    issueDate: '2024-11-15',
    validUntil: '2024-12-15',
    status: 'SENT',
    lines: [
      { id: 'ql3', description: 'Application mobile React Native', quantity: 1, unitPrice: 8000, vatRate: 0 },
    ],
    subtotal: 8000,
    taxAmount: 0,
    total: 8000,
  },
];

export let invoices: Invoice[] = [
  {
    id: 'inv1',
    number: 'FA-2024-001',
    quoteId: 'q1',
    clientName: 'Jean Dupont',
    clientCompany: 'Startup Innovation SAS',
    clientAddress: '123 Rue de Paris, 75001 Paris',
    clientEmail: 'jean@startup.fr',
    clientPhone: '0612345678',
    issueDate: '2024-11-05',
    dueDate: '2024-12-05',
    status: 'PAID',
    lines: [
      { id: 'il1', description: 'Développement site web vitrine', quantity: 1, unitPrice: 2500, vatRate: 0 },
      { id: 'il2', description: 'Intégration CMS', quantity: 1, unitPrice: 800, vatRate: 0 },
    ],
    subtotal: 3300,
    taxAmount: 0,
    total: 3300,
    paymentDate: '2024-11-20',
  },
  {
    id: 'inv2',
    number: 'FA-2024-002',
    clientName: 'Pierre Durand',
    clientCompany: 'Tech Solutions',
    clientAddress: '78 Rue du Commerce, 33000 Bordeaux',
    clientEmail: 'pierre@tech.fr',
    issueDate: '2024-10-15',
    dueDate: '2024-11-15',
    status: 'PAID',
    lines: [
      { id: 'il3', description: 'Consulting technique', quantity: 5, unitPrice: 400, vatRate: 0 },
    ],
    subtotal: 2000,
    taxAmount: 0,
    total: 2000,
    paymentDate: '2024-11-10',
  },
];

export let businessSubscriptions: BusinessSubscription[] = [
  { id: 'bs1', name: 'GitHub Pro', amount: 4, billingPeriod: 'MONTHLY', nextBillingDate: '2025-01-15', category: 'Outils dev', paymentMethod: 'CB' },
  { id: 'bs2', name: 'Vercel Pro', amount: 20, billingPeriod: 'MONTHLY', nextBillingDate: '2025-01-10', category: 'Hébergement', paymentMethod: 'CB' },
  { id: 'bs3', name: 'Notion Plus', amount: 8, billingPeriod: 'MONTHLY', nextBillingDate: '2025-01-05', category: 'SaaS', paymentMethod: 'CB' },
  { id: 'bs4', name: 'ChatGPT Plus', amount: 20, billingPeriod: 'MONTHLY', nextBillingDate: '2025-01-10', category: 'IA', paymentMethod: 'CB' },
  { id: 'bs5', name: 'OVH VPS', amount: 72, billingPeriod: 'YEARLY', nextBillingDate: '2025-06-01', category: 'Hébergement', paymentMethod: 'Prélèvement' },
  { id: 'bs6', name: 'Figma', amount: 144, billingPeriod: 'YEARLY', nextBillingDate: '2025-03-15', category: 'Design', paymentMethod: 'CB' },
];

export let taxDeclarations: TaxDeclaration[] = [
  { id: 'td1', period: 'T3 2024', periodType: 'QUARTERLY', declaredTurnover: 5300, socialPaid: 1303.80, incomeTaxPaid: 116.60, netIncome: 3879.60, declaredAt: '2024-10-15' },
  { id: 'td2', period: 'T2 2024', periodType: 'QUARTERLY', declaredTurnover: 4200, socialPaid: 1033.20, incomeTaxPaid: 92.40, netIncome: 3074.40, declaredAt: '2024-07-15' },
];

export let lifeInsuranceContracts: LifeInsuranceContract[] = [
  {
    id: 'lic1',
    name: 'Boursorama Vie',
    insurer: 'Generali',
    type: 'MULTISUPPORT',
    currency: 'EUR',
    managementFeesRate: 0.75,
    guaranteedRate: 2.5,
    openedAt: '2022-06-15',
    initialDeposit: 1000,
  },
];

export let lifeInsuranceHoldings: LifeInsuranceHolding[] = [
  { id: 'lih1', contractId: 'lic1', assetName: 'Fonds Euro Generali', assetType: 'FONDS_EURO', quantity: 1, buyPrice: 3000, currentPrice: 3150 },
  { id: 'lih2', contractId: 'lic1', assetName: 'Amundi MSCI World', isin: 'LU1681043599', symbol: 'CW8', assetType: 'UC', quantity: 50, buyPrice: 40, currentPrice: 45 },
  { id: 'lih3', contractId: 'lic1', assetName: 'Lyxor CAC 40', isin: 'FR0007052782', symbol: 'CAC', assetType: 'UC', quantity: 30, buyPrice: 60, currentPrice: 65 },
];

export let watchlist: WatchlistItem[] = [
  { id: 'w1', symbol: 'TSLA', name: 'Tesla', assetType: 'STOCK', currentPrice: 248.50, change24h: 2.5, change7d: -3.2, change1m: 8.5 },
  { id: 'w2', symbol: 'MSFT', name: 'Microsoft', assetType: 'STOCK', currentPrice: 378.90, change24h: 0.8, change7d: 1.5, change1m: 4.2 },
  { id: 'w3', symbol: 'SOL', name: 'Solana', assetType: 'CRYPTO', currentPrice: 145.30, change24h: -1.2, change7d: 5.8, change1m: 25.3 },
];

// Utility functions
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function getHoldingValue(holding: Holding): number {
  return holding.quantity * holding.currentPrice;
}

export function getHoldingPnL(holding: Holding): number {
  return (holding.currentPrice - holding.buyPrice) * holding.quantity;
}

export function getHoldingPnLPercent(holding: Holding): number {
  if (holding.buyPrice === 0) return 0;
  return ((holding.currentPrice - holding.buyPrice) / holding.buyPrice) * 100;
}

export function getTotalPatrimony(): number {
  const cashAccounts = accounts
    .filter(a => a.type === 'CURRENT')
    .reduce((sum, a) => sum + a.balance, 0);
  
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  
  const investedAssets = holdings.reduce((sum, h) => sum + getHoldingValue(h), 0);
  
  const lifeInsuranceTotal = lifeInsuranceHoldings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  
  return cashAccounts + savingsTotal + investedAssets + lifeInsuranceTotal;
}

export function getTotalLiabilities(): number {
  return loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
}

export function getNetPatrimony(): number {
  return getTotalPatrimony() - getTotalLiabilities();
}

export function getTotalMonthlyIncome(): number {
  return incomes.reduce((sum, i) => sum + i.amount, 0);
}

export function getTotalMonthlyExpenses(): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getMonthlyCashflow(): number {
  return getTotalMonthlyIncome() - getTotalMonthlyExpenses();
}

export function getSavingsRate(): number {
  const income = getTotalMonthlyIncome();
  if (income === 0) return 0;
  return (getMonthlyCashflow() / income) * 100;
}

export function getExpensesByCategory(): { category: string; amount: number; percent: number }[] {
  const total = getTotalMonthlyExpenses();
  const categoryMap = new Map<string, number>();
  
  expenses.forEach(e => {
    const current = categoryMap.get(e.category) || 0;
    categoryMap.set(e.category, current + e.amount);
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percent: (amount / total) * 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getAssetAllocation(): { name: string; value: number; color: string }[] {
  const cashAccounts = accounts
    .filter(a => a.type === 'CURRENT')
    .reduce((sum, a) => sum + a.balance, 0);
  
  const savingsTotal = savingsAccounts.reduce((sum, a) => sum + a.balance, 0);
  
  const peaValue = holdings
    .filter(h => h.accountId === '4')
    .reduce((sum, h) => sum + getHoldingValue(h), 0);
  
  const ctoValue = holdings
    .filter(h => h.accountId === '5')
    .reduce((sum, h) => sum + getHoldingValue(h), 0);
  
  const cryptoValue = holdings
    .filter(h => h.accountId === '6')
    .reduce((sum, h) => sum + getHoldingValue(h), 0);
  
  const lifeInsuranceValue = lifeInsuranceHoldings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  
  return [
    { name: 'Cash', value: cashAccounts, color: 'hsl(217, 91%, 60%)' },
    { name: 'Livrets', value: savingsTotal, color: 'hsl(189, 94%, 43%)' },
    { name: 'PEA', value: peaValue, color: 'hsl(142, 71%, 45%)' },
    { name: 'CTO', value: ctoValue, color: 'hsl(262, 83%, 58%)' },
    { name: 'Crypto', value: cryptoValue, color: 'hsl(47, 96%, 53%)' },
    { name: 'Assurance-vie', value: lifeInsuranceValue, color: 'hsl(340, 82%, 52%)' },
  ];
}

export function getPatrimonyHistory(): { date: string; value: number }[] {
  const baseValue = getTotalPatrimony();
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  return months.map((month, index) => {
    const variation = 1 + (Math.random() * 0.15 - 0.05) * (index / 12);
    return {
      date: month,
      value: baseValue * (0.7 + (index * 0.025)) * variation,
    };
  });
}

// Business utility functions
export function calculateCharges(turnover: number, profile: CompanyProfile) {
  const social = turnover * (profile.socialRate / 100);
  const incomeTax = profile.usesVersementLiberatoire ? turnover * (profile.incomeTaxRate / 100) : 0;
  const cfp = turnover * (profile.trainingContributionRate / 100);
  const cfe = turnover * (profile.cfeRate / 100);
  const totalCharges = social + incomeTax + cfp + cfe;
  const netIncome = turnover - totalCharges;
  
  return { social, incomeTax, cfp, cfe, totalCharges, netIncome };
}

export function getBusinessRevenue(): number {
  return invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.total, 0);
}

export function getBusinessSubscriptionsCost(): { monthly: number; yearly: number } {
  const monthly = businessSubscriptions
    .filter(s => s.billingPeriod === 'MONTHLY')
    .reduce((sum, s) => sum + s.amount, 0);
  const yearly = businessSubscriptions
    .filter(s => s.billingPeriod === 'YEARLY')
    .reduce((sum, s) => sum + s.amount, 0);
  
  return { monthly, yearly: monthly * 12 + yearly };
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const count = quotes.length + 1;
  return `DV-${year}-${count.toString().padStart(3, '0')}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const count = invoices.length + 1;
  return `FA-${year}-${count.toString().padStart(3, '0')}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const categoryLabels: Record<ExpenseCategory, string> = {
  HOUSING: 'Logement',
  FOOD: 'Alimentation',
  SUBSCRIPTIONS: 'Abonnements',
  TRANSPORT: 'Transport',
  LEISURE: 'Loisirs',
  HEALTH: 'Santé',
  UTILITIES: 'Charges',
  BANKING: 'Frais bancaires',
  OTHER: 'Autres',
};

export const categoryColors: Record<ExpenseCategory, string> = {
  HOUSING: 'hsl(217, 91%, 60%)',
  FOOD: 'hsl(142, 71%, 45%)',
  SUBSCRIPTIONS: 'hsl(262, 83%, 58%)',
  TRANSPORT: 'hsl(47, 96%, 53%)',
  LEISURE: 'hsl(340, 82%, 52%)',
  HEALTH: 'hsl(189, 94%, 43%)',
  UTILITIES: 'hsl(24, 94%, 50%)',
  BANKING: 'hsl(0, 0%, 45%)',
  OTHER: 'hsl(0, 0%, 60%)',
};

export const savingsTypeLabels: Record<SavingsType, string> = {
  LIVRET_A: 'Livret A',
  LIVRET_JEUNE: 'Livret Jeune',
  LDDS: 'LDDS',
  LEP: 'LEP',
  PEL: 'PEL',
  CEL: 'CEL',
  COMPTE_A_TERME: 'Compte à terme',
  AUTRE_LIVRET: 'Autre livret',
};

export const legalStatusLabels: Record<LegalStatus, string> = {
  MICRO_ENTREPRISE: 'Micro-entreprise',
  SASU: 'SASU',
  SARL: 'SARL',
  EURL: 'EURL',
  AUTO_ENTREPRENEUR: 'Auto-entrepreneur',
  OTHER: 'Autre',
};

export const activityTypeLabels: Record<ActivityType, string> = {
  BIC_VENTE: 'BIC - Vente de marchandises',
  BIC_SERVICE: 'BIC - Prestations de services',
  BNC_SERVICE: 'BNC - Prestations de services libérales',
};

// Auto-tagging rules
export const autoTagRules: { keyword: string; category: ExpenseCategory }[] = [
  { keyword: 'uber', category: 'FOOD' },
  { keyword: 'spotify', category: 'SUBSCRIPTIONS' },
  { keyword: 'netflix', category: 'SUBSCRIPTIONS' },
  { keyword: 'edf', category: 'UTILITIES' },
  { keyword: 'engie', category: 'UTILITIES' },
  { keyword: 'loyer', category: 'HOUSING' },
  { keyword: 'carrefour', category: 'FOOD' },
  { keyword: 'leclerc', category: 'FOOD' },
  { keyword: 'sncf', category: 'TRANSPORT' },
  { keyword: 'ratp', category: 'TRANSPORT' },
  { keyword: 'amazon', category: 'OTHER' },
  { keyword: 'pharmacie', category: 'HEALTH' },
];

export function autoTagExpense(label: string): ExpenseCategory {
  const lowerLabel = label.toLowerCase();
  for (const rule of autoTagRules) {
    if (lowerLabel.includes(rule.keyword)) {
      return rule.category;
    }
  }
  return 'OTHER';
}
