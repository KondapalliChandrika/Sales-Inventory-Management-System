import { useState } from 'react';

import { Card, PageHeader } from '@/components/ui';
import { cn } from '@/utils/cn';

import MovementsTab from './MovementsTab';
import StockLevelsTab from './StockLevelsTab';

const TABS = [
  { id: 'levels', label: 'Stock levels' },
  { id: 'movements', label: 'Stock ledger' },
];

export default function InventoryPage() {
  const [tab, setTab] = useState('levels');
  const [historyProduct, setHistoryProduct] = useState(null);

  const showHistory = (product) => {
    setHistoryProduct(product);
    setTab('movements');
  };

  return (
    <>
      <PageHeader title="Inventory" description="On hand = physical stock. Reserved = held for orders awaiting approval." />
      <Card className="overflow-hidden">
        <div className="flex gap-1 border-b border-border-200 px-4" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                '-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                tab === t.id
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-content-secondary hover:text-content-primary',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'levels' ? (
          <StockLevelsTab onShowHistory={showHistory} />
        ) : (
          <MovementsTab product={historyProduct} onClearProduct={() => setHistoryProduct(null)} />
        )}
      </Card>
    </>
  );
}
