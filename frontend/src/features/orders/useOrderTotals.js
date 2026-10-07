import { useMemo } from 'react';

const round2 = (n) => Math.round(n * 100) / 100;

export function useOrderTotals(items, productsById, settings) {
  return useMemo(() => {
    const requested = {};
    items.forEach(({ product_id: id, quantity }) => {
      if (id) requested[id] = (requested[id] ?? 0) + (Number(quantity) || 0);
    });

    const lines = items.map(({ product_id: id, quantity }) => {
      const product = productsById[id];
      const qty = Number(quantity) || 0;
      return {
        product,
        lineTotal: product ? round2(product.unit_price * qty) : 0,
        exceedsStock: Boolean(product && requested[id] > product.available_qty),
      };
    });

    const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    const taxRate = settings?.tax_rate_percent ?? 0;
    const tax = round2((subtotal * taxRate) / 100);
    const total = round2(subtotal + tax);
    const threshold = settings?.approval_threshold;

    return {
      lines,
      subtotal,
      taxRate,
      tax,
      total,
      threshold,
      requiresApproval: threshold !== undefined && total > threshold,
      hasStockIssue: lines.some((l) => l.exceedsStock),
    };
  }, [items, productsById, settings]);
}
