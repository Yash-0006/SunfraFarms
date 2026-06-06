/**
 * AI Tool Executors for SunfraFarms
 * These functions are called by the AI when it decides to use a tool.
 * They use the existing db.query() function to interact with the database.
 */

import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity, formatTraysLooseDisplay } from '@/lib/quantity-utils';

// ============== READ TOOLS ==============

export async function queryProduction(params: { date?: string; period?: string }) {
  try {
    const rows: any = await query('SELECT * FROM egg_production ORDER BY id DESC', []);

    const today = new Date();
    
    const filteredRows = rows.filter((row: any) => {
      if (!row.date) return false;
      const d = new Date(row.date);
      if (isNaN(d.getTime())) return false;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (params.date) {
        return dateStr === params.date;
      } else if (params.period && params.period !== 'all') {
        let days = 0;
        if (params.period === 'today') days = 0;
        else if (params.period === 'yesterday') days = 1;
        else if (params.period === 'week') days = 7;
        else if (params.period === 'month') days = 30;
        else if (params.period === 'year') days = 365;

        if (params.period === 'today' || params.period === 'yesterday') {
          const targetDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
          const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
          return dateStr === targetStr;
        } else {
          const cutoff = today.getTime() - days * 24 * 60 * 60 * 1000;
          return d.getTime() >= cutoff;
        }
      }
      return true;
    });

    // Group by location
    const grouped: Record<string, { good: number; damaged: number; big: number; small: number }> = {};
    filteredRows.forEach((row: any) => {
      const loc = row.location;
      if (!grouped[loc]) grouped[loc] = { good: 0, damaged: 0, big: 0, small: 0 };
      const eggs = parseToTotalEggs(row.quantity);
      if (row.conditionn === 'Good') grouped[loc].good += eggs;
      else if (row.conditionn === 'Damaged') grouped[loc].damaged += eggs;
      else if (row.conditionn === 'Big') grouped[loc].big += eggs;
      else if (row.conditionn === 'Small') grouped[loc].small += eggs;
      else grouped[loc].damaged += eggs;
    });

    const result = Object.entries(grouped).map(([location, data]) => ({
      location,
      goodEggs: `${formatTraysLooseDisplay(normalizeQuantity(data.good))}`,
      damagedEggs: `${formatTraysLooseDisplay(normalizeQuantity(data.damaged))}`,
      bigEggs: `${formatTraysLooseDisplay(normalizeQuantity(data.big))}`,
      smallEggs: `${formatTraysLooseDisplay(normalizeQuantity(data.small))}`,
      totalEggs: data.good + data.damaged + data.big + data.small,
    }));

    const totalAllEggs = Object.values(grouped).reduce((sum, d) => sum + d.good + d.damaged + d.big + d.small, 0);

    return {
      success: true,
      data: result,
      summary: {
        totalLocations: result.length,
        totalEggs: totalAllEggs,
        totalTraysLoose: formatTraysLooseDisplay(normalizeQuantity(totalAllEggs)),
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch production data' };
  }
}

export async function querySales(params: { date?: string; period?: string }) {
  try {
    const rows: any = await query('SELECT * FROM egg_sale ORDER BY id DESC', []);

    const today = new Date();
    
    const filteredRows = rows.filter((row: any) => {
      if (!row.date) return false;
      const d = new Date(row.date);
      if (isNaN(d.getTime())) return false;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (params.date) {
        return dateStr === params.date;
      } else if (params.period && params.period !== 'all') {
        let days = 0;
        if (params.period === 'today') days = 0;
        else if (params.period === 'yesterday') days = 1;
        else if (params.period === 'week') days = 7;
        else if (params.period === 'month') days = 30;
        else if (params.period === 'year') days = 365;

        if (params.period === 'today' || params.period === 'yesterday') {
          const targetDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
          const targetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
          return dateStr === targetStr;
        } else {
          const cutoff = today.getTime() - days * 24 * 60 * 60 * 1000;
          return d.getTime() >= cutoff;
        }
      }
      return true;
    });

    let totalBig = 0;
    let totalSmall = 0;

    const result = filteredRows.map((row: any) => {
      const bigEggs = parseToTotalEggs(row.big_quantity);
      const smallEggs = parseToTotalEggs(row.small_quantity);
      totalBig += bigEggs;
      totalSmall += smallEggs;
      return {
        id: row.id,
        buyerName: row.name,
        bigQuantity: formatTraysLooseDisplay(row.big_quantity),
        smallQuantity: formatTraysLooseDisplay(row.small_quantity),
        remarks: row.remarks || '',
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      };
    });

    return {
      success: true,
      data: result,
      summary: {
        totalRecords: result.length,
        totalBigEggs: formatTraysLooseDisplay(normalizeQuantity(totalBig)),
        totalSmallEggs: formatTraysLooseDisplay(normalizeQuantity(totalSmall)),
        totalAllEggs: totalBig + totalSmall,
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch sales data' };
  }
}

export async function queryDashboard() {
  try {
    const production: any = await query('SELECT * FROM egg_production');
    const sales: any = await query('SELECT * FROM egg_sale');

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let allGood = 0, allDamaged = 0, allBig = 0, allSmall = 0;
    let todayGood = 0, todayDamaged = 0, todayBig = 0, todaySmall = 0;

    production.forEach((row: any) => {
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const eggs = parseToTotalEggs(row.quantity);

      if (row.conditionn === 'Good') { allGood += eggs; if (isToday) todayGood += eggs; }
      else if (row.conditionn === 'Damaged') { allDamaged += eggs; if (isToday) todayDamaged += eggs; }
      else if (row.conditionn === 'Big') { allBig += eggs; if (isToday) todayBig += eggs; }
      else if (row.conditionn === 'Small') { allSmall += eggs; if (isToday) todaySmall += eggs; }
      else { allDamaged += eggs; if (isToday) todayDamaged += eggs; }
    });

    let allSalesBig = 0, allSalesSmall = 0;
    let todaySalesBig = 0, todaySalesSmall = 0;

    sales.forEach((row: any) => {
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const big = parseToTotalEggs(row.big_quantity);
      const small = parseToTotalEggs(row.small_quantity);
      allSalesBig += big; allSalesSmall += small;
      if (isToday) { todaySalesBig += big; todaySalesSmall += small; }
    });

    const totalProd = allGood + allDamaged + allBig + allSmall;
    const totalSales = allSalesBig + allSalesSmall;
    const stock = totalProd - totalSales;
    const bigStock = allBig - allSalesBig;
    const smallStock = allSmall - allSalesSmall;

    return {
      success: true,
      data: {
        production: {
          allTime: {
            total: formatTraysLooseDisplay(normalizeQuantity(totalProd)),
            good: formatTraysLooseDisplay(normalizeQuantity(allGood)),
            damaged: formatTraysLooseDisplay(normalizeQuantity(allDamaged)),
            big: formatTraysLooseDisplay(normalizeQuantity(allBig)),
            small: formatTraysLooseDisplay(normalizeQuantity(allSmall)),
          },
          today: {
            total: formatTraysLooseDisplay(normalizeQuantity(todayGood + todayDamaged + todayBig + todaySmall)),
            good: formatTraysLooseDisplay(normalizeQuantity(todayGood)),
            damaged: formatTraysLooseDisplay(normalizeQuantity(todayDamaged)),
            big: formatTraysLooseDisplay(normalizeQuantity(todayBig)),
            small: formatTraysLooseDisplay(normalizeQuantity(todaySmall)),
          }
        },
        sales: {
          allTime: {
            total: formatTraysLooseDisplay(normalizeQuantity(totalSales)),
            big: formatTraysLooseDisplay(normalizeQuantity(allSalesBig)),
            small: formatTraysLooseDisplay(normalizeQuantity(allSalesSmall)),
          },
          today: {
            total: formatTraysLooseDisplay(normalizeQuantity(todaySalesBig + todaySalesSmall)),
            big: formatTraysLooseDisplay(normalizeQuantity(todaySalesBig)),
            small: formatTraysLooseDisplay(normalizeQuantity(todaySalesSmall)),
          }
        },
        stock: {
          total: formatTraysLooseDisplay(normalizeQuantity(stock)),
          big: formatTraysLooseDisplay(normalizeQuantity(bigStock)),
          small: formatTraysLooseDisplay(normalizeQuantity(smallStock)),
        }
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch dashboard data' };
  }
}

// ============== WRITE TOOLS ==============

export async function addProduction(params: {
  location: string;
  goodTrays?: number; goodLoose?: number;
  damagedTrays?: number; damagedLoose?: number;
  bigTrays?: number; bigLoose?: number;
  smallTrays?: number; smallLoose?: number;
}) {
  try {
    // LLM Hallucination Guard
    const loc = (params.location || '').toLowerCase().trim();
    if (!loc || loc === 'unknown' || loc === 'dummy' || loc === 'test' || loc === 'shed') {
      return { success: false, error: 'SYSTEM ERROR: You hallucinated the location. Stop using this tool immediately and ask the user for the real location/shed name.' };
    }

    const getQty = (trays: any = 0, loose: any = 0) => {
      const t = parseFloat(trays) || 0;
      const l = parseFloat(loose) || 0;
      if (t === 0 && l === 0) return '';
      return (t + (l / 100)).toFixed(2);
    };

    const goodQty = getQty(params.goodTrays, params.goodLoose);
    const damagedQty = getQty(params.damagedTrays, params.damagedLoose);
    const bigQty = getQty(params.bigTrays, params.bigLoose);
    const smallQty = getQty(params.smallTrays, params.smallLoose);

    if (!goodQty && !damagedQty && !bigQty && !smallQty) {
      return { success: false, error: 'SYSTEM ERROR: Missing quantities. Stop using this tool immediately and ask the user how many trays or loose eggs were collected.' };
    }

    const inserts = [
      { condition: 'Good', qty: goodQty },
      { condition: 'Damaged', qty: damagedQty },
      { condition: 'Big', qty: bigQty },
      { condition: 'Small', qty: smallQty },
    ];

    let inserted = 0;
    for (const insert of inserts) {
      if (insert.qty && parseFloat(insert.qty) > 0) {
        await query(
          'INSERT INTO egg_production (location, conditionn, quantity, date) VALUES (?, ?, ?, NOW())',
          [params.location, insert.condition, insert.qty]
        );
        inserted++;
      }
    }

    return {
      success: true,
      message: `Production record added for "${params.location}" with ${inserted} egg type(s).`,
      action: 'navigate',
      url: '/admin/godown/production',
      details: {
        location: params.location,
        good: goodQty || '0',
        damaged: damagedQty || '0',
        big: bigQty || '0',
        small: smallQty || '0',
      }
    };
  } catch (error) {
    return { success: false, error: 'Failed to add production record' };
  }
}

export async function addSale(params: {
  name: string;
  bigTrays?: number; bigLoose?: number;
  smallTrays?: number; smallLoose?: number;
  remarks?: string;
}) {
  try {
    // LLM Hallucination Guard
    const buyer = (params.name || '').toLowerCase().trim();
    if (!buyer || buyer === 'unknown' || buyer === 'dummy' || buyer === 'test' || buyer === 'buyer') {
      return { success: false, error: 'SYSTEM ERROR: You hallucinated the buyer name. Stop using this tool immediately and ask the user for the real buyer name.' };
    }

    const getQty = (trays: any = 0, loose: any = 0) => {
      const t = parseFloat(trays) || 0;
      const l = parseFloat(loose) || 0;
      if (t === 0 && l === 0) return '';
      return (t + (l / 100)).toFixed(2);
    };

    const bigQty = getQty(params.bigTrays, params.bigLoose);
    const smallQty = getQty(params.smallTrays, params.smallLoose);

    if (!bigQty && !smallQty) {
      return { success: false, error: 'SYSTEM ERROR: Missing quantities. Stop using this tool immediately and ask the user how many big or small eggs were sold.' };
    }

    const result: any = await query(
      'INSERT INTO egg_sale (name, big_quantity, small_quantity, remarks, date) VALUES (?, ?, ?, ?, NOW())',
      [params.name, bigQty || '0', smallQty || '0', params.remarks || '']
    );

    return {
      success: true,
      message: `Sale recorded! ${params.name} bought ${bigQty ? formatTraysLooseDisplay(parseFloat(bigQty)) + ' big eggs' : ''}${bigQty && smallQty ? ' and ' : ''}${smallQty ? formatTraysLooseDisplay(parseFloat(smallQty)) + ' small eggs' : ''}.`,
      insertedId: result.insertId,
      action: 'navigate',
      url: '/admin/godown/sales',
    };
  } catch (error) {
    return { success: false, error: 'Failed to record sale' };
  }
}

export async function deleteSale(params: { id: number }) {
  try {
    await query('DELETE FROM egg_sale WHERE id = ?', [parseInt(params.id as any)]);
    return { success: true, message: `Sale record #${params.id} has been deleted.` };
  } catch (error) {
    return { success: false, error: 'Failed to delete sale record' };
  }
}

export async function deleteProduction(params: { location: string }) {
  try {
    await query('DELETE FROM egg_production WHERE location = ?', [params.location]);
    return { success: true, message: `All production records for "${params.location}" have been deleted.` };
  } catch (error) {
    return { success: false, error: 'Failed to delete production records' };
  }
}

// ============== UI TOOLS (Return data for frontend) ==============

export function fillForm(params: { formType: string; fields: Record<string, string> }) {
  return {
    success: true,
    action: 'fill_form',
    formType: params.formType,
    fields: params.fields,
    message: `Form fields prepared. Click "Fill Form" to auto-fill the ${params.formType} form.`,
  };
}

export function navigatePage(params: { page: string }) {
  const pageMap: Record<string, string> = {
    dashboard: '/admin/dashboard',
    production: '/admin/godown/production',
    sales: '/admin/godown/sales',
    godown: '/admin/godown',
    settings: '/admin/settings',
  };

  return {
    success: true,
    action: 'navigate',
    url: pageMap[params.page] || '/admin/dashboard',
    message: `Navigate to ${params.page} page.`,
  };
}

// ============== TOOL EXECUTOR ==============

export async function executeTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'query_production':
      return await queryProduction(args);
    case 'query_sales':
      return await querySales(args);
    case 'query_dashboard':
      return await queryDashboard();
    case 'add_production':
      return await addProduction(args);
    case 'add_sale':
      return await addSale(args);
    case 'delete_sale':
      return await deleteSale(args);
    case 'delete_production':
      return await deleteProduction(args);
    case 'fill_form':
      return fillForm(args);
    case 'navigate_page':
      return navigatePage(args);
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}
