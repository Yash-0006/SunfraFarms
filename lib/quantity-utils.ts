/**
 * Utility functions for handling egg quantities.
 * The format is a float `[trays].[eggs]`.
 * 1 tray = 30 eggs.
 * Examples: 
 * 1.30 -> normalizes to 2.00
 * 1.29 -> remains 1.29
 * 0.50 -> normalizes to 1.20 (50 eggs = 1 tray, 20 eggs)
 */

export function parseToTotalEggs(quantity: number | string): number {
  const qty = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(qty)) return 0;

  const trays = Math.floor(qty);
  // Using Math.round to avoid floating point precision issues like 1.29 - 1 = 0.289999
  const eggs = Math.round((qty - trays) * 100);
  
  return (trays * 30) + eggs;
}

export function normalizeQuantity(totalEggs: number): number {
  if (totalEggs < 0) return 0;
  
  const trays = Math.floor(totalEggs / 30);
  const remainingEggs = totalEggs % 30;
  
  // Convert back to [trays].[eggs] format
  return trays + (remainingEggs / 100);
}

export function normalizeInputQuantity(inputQty: number | string): number {
    return normalizeQuantity(parseToTotalEggs(inputQty));
}

// Display format utility (e.g. 1.05 instead of 1.5 if 5 eggs)
export function formatQuantityDisplay(quantity: number): string {
    return quantity.toFixed(2);
}

// Display format for Trays and Loose (e.g. 5 Trays, 15 Loose)
export function formatTraysLooseDisplay(quantity: number | string): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num) || num === 0) return '—';
  
  const total = Math.round(num * 100);
  const trays = Math.floor(num);
  const loose = total - (trays * 100);

  const formattedTrays = trays >= 1000 ? formatCompactNumber(trays) : trays.toString();

  if (loose > 0) {
    return `${formattedTrays} Trays, ${loose} Loose`;
  }
  return `${formattedTrays} Trays`;
}

// Utility to shrink font size for very large numbers
export function getDynamicFontSize(value: string | number, defaultSize: number = 34): string {
  const len = String(value).length;
  if (len > 12) return `${Math.floor(defaultSize * 0.55)}px`;
  if (len > 9) return `${Math.floor(defaultSize * 0.7)}px`;
  if (len > 7) return `${Math.floor(defaultSize * 0.85)}px`;
  return `${defaultSize}px`;
}

// Compact formatter (K, M, B)
export function formatCompactNumber(quantity: number | string): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return '0';
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
}
