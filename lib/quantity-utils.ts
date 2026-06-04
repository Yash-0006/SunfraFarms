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
