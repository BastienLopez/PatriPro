import { useState, useCallback } from 'react';
import {
  accounts as initialAccounts,
  savingsAccounts as initialSavingsAccounts,
  holdings as initialHoldings,
  incomes as initialIncomes,
  expenses as initialExpenses,
  loans as initialLoans,
  recurringEvents as initialRecurringEvents,
  companyProfile as initialCompanyProfile,
  quotes as initialQuotes,
  invoices as initialInvoices,
  businessSubscriptions as initialBusinessSubscriptions,
  taxDeclarations as initialTaxDeclarations,
  lifeInsuranceContracts as initialLifeInsuranceContracts,
  lifeInsuranceHoldings as initialLifeInsuranceHoldings,
  watchlist as initialWatchlist,
  generateId,
  Account,
  SavingsAccount,
  Holding,
  Income,
  Expense,
  Loan,
  RecurringEvent,
  CompanyProfile,
  Quote,
  Invoice,
  BusinessSubscription,
  TaxDeclaration,
  LifeInsuranceContract,
  LifeInsuranceHolding,
  WatchlistItem,
} from '@/lib/data';

// Generic CRUD hook
function useCrud<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState<T[]>(initialData);

  const add = useCallback((item: Omit<T, 'id'>) => {
    const newItem = { ...item, id: generateId() } as T;
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { items, setItems, add, update, remove };
}

// Main data store hook
export function useDataStore() {
  // Accounts
  const accountsStore = useCrud<Account>(initialAccounts);
  
  // Savings Accounts
  const savingsStore = useCrud<SavingsAccount>(initialSavingsAccounts);
  
  // Holdings
  const holdingsStore = useCrud<Holding>(initialHoldings);
  
  // Incomes
  const incomesStore = useCrud<Income>(initialIncomes);
  
  // Expenses
  const expensesStore = useCrud<Expense>(initialExpenses);
  
  // Loans
  const loansStore = useCrud<Loan>(initialLoans);
  
  // Recurring Events
  const eventsStore = useCrud<RecurringEvent>(initialRecurringEvents);
  
  // Company Profile (single item)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(initialCompanyProfile);
  const updateCompanyProfile = useCallback((updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Quotes
  const quotesStore = useCrud<Quote>(initialQuotes);
  
  // Invoices
  const invoicesStore = useCrud<Invoice>(initialInvoices);
  
  // Business Subscriptions
  const subscriptionsStore = useCrud<BusinessSubscription>(initialBusinessSubscriptions);
  
  // Tax Declarations
  const taxDeclarationsStore = useCrud<TaxDeclaration>(initialTaxDeclarations);
  
  // Life Insurance Contracts
  const lifeInsuranceContractsStore = useCrud<LifeInsuranceContract>(initialLifeInsuranceContracts);
  
  // Life Insurance Holdings
  const lifeInsuranceHoldingsStore = useCrud<LifeInsuranceHolding>(initialLifeInsuranceHoldings);
  
  // Watchlist
  const watchlistStore = useCrud<WatchlistItem>(initialWatchlist);

  return {
    // Accounts
    accounts: accountsStore.items,
    addAccount: accountsStore.add,
    updateAccount: accountsStore.update,
    removeAccount: accountsStore.remove,
    
    // Savings
    savingsAccounts: savingsStore.items,
    addSavingsAccount: savingsStore.add,
    updateSavingsAccount: savingsStore.update,
    removeSavingsAccount: savingsStore.remove,
    
    // Holdings
    holdings: holdingsStore.items,
    addHolding: holdingsStore.add,
    updateHolding: holdingsStore.update,
    removeHolding: holdingsStore.remove,
    
    // Incomes
    incomes: incomesStore.items,
    addIncome: incomesStore.add,
    updateIncome: incomesStore.update,
    removeIncome: incomesStore.remove,
    
    // Expenses
    expenses: expensesStore.items,
    addExpense: expensesStore.add,
    updateExpense: expensesStore.update,
    removeExpense: expensesStore.remove,
    
    // Loans
    loans: loansStore.items,
    addLoan: loansStore.add,
    updateLoan: loansStore.update,
    removeLoan: loansStore.remove,
    
    // Events
    recurringEvents: eventsStore.items,
    addRecurringEvent: eventsStore.add,
    updateRecurringEvent: eventsStore.update,
    removeRecurringEvent: eventsStore.remove,
    
    // Company Profile
    companyProfile,
    updateCompanyProfile,
    
    // Quotes
    quotes: quotesStore.items,
    addQuote: quotesStore.add,
    updateQuote: quotesStore.update,
    removeQuote: quotesStore.remove,
    
    // Invoices
    invoices: invoicesStore.items,
    addInvoice: invoicesStore.add,
    updateInvoice: invoicesStore.update,
    removeInvoice: invoicesStore.remove,
    
    // Business Subscriptions
    businessSubscriptions: subscriptionsStore.items,
    addBusinessSubscription: subscriptionsStore.add,
    updateBusinessSubscription: subscriptionsStore.update,
    removeBusinessSubscription: subscriptionsStore.remove,
    
    // Tax Declarations
    taxDeclarations: taxDeclarationsStore.items,
    addTaxDeclaration: taxDeclarationsStore.add,
    updateTaxDeclaration: taxDeclarationsStore.update,
    removeTaxDeclaration: taxDeclarationsStore.remove,
    
    // Life Insurance Contracts
    lifeInsuranceContracts: lifeInsuranceContractsStore.items,
    addLifeInsuranceContract: lifeInsuranceContractsStore.add,
    updateLifeInsuranceContract: lifeInsuranceContractsStore.update,
    removeLifeInsuranceContract: lifeInsuranceContractsStore.remove,
    
    // Life Insurance Holdings
    lifeInsuranceHoldings: lifeInsuranceHoldingsStore.items,
    addLifeInsuranceHolding: lifeInsuranceHoldingsStore.add,
    updateLifeInsuranceHolding: lifeInsuranceHoldingsStore.update,
    removeLifeInsuranceHolding: lifeInsuranceHoldingsStore.remove,
    
    // Watchlist
    watchlist: watchlistStore.items,
    addWatchlistItem: watchlistStore.add,
    updateWatchlistItem: watchlistStore.update,
    removeWatchlistItem: watchlistStore.remove,
  };
}

export type DataStore = ReturnType<typeof useDataStore>;
