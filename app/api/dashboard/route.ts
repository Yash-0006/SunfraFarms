import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';

export async function GET() {
  try {
    // Get today's date string in local YYYY-MM-DD format
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Fetch all production and sales to calculate accurate totals due to Tray/Egg format
    const production: any = await query('SELECT * FROM egg_production');
    const sales: any = await query('SELECT * FROM egg_sale');

    let allTimeGoodEggs = 0;
    let allTimeBadEggs = 0;
    let todayGoodEggs = 0;
    let todayBadEggs = 0;

    // Chart data grouped by date (YYYY-MM-DD)
    const chartDataMap: Record<string, { date: string, good: number, bad: number }> = {};

    production.forEach((row: any) => {
      const d = new Date(row.date_added);
      if (!row.date_added || isNaN(d.getTime())) return; // skip rows with invalid dates
      
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const eggs = parseToTotalEggs(row.quantity);

      if (row.conditionn === 'Good') {
        allTimeGoodEggs += eggs;
        if (isToday) todayGoodEggs += eggs;
      } else {
        allTimeBadEggs += eggs;
        if (isToday) todayBadEggs += eggs;
      }

      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { date: dateStr, good: 0, bad: 0 };
      
      if (row.conditionn === 'Good') {
        chartDataMap[dateStr].good += eggs;
      } else {
        chartDataMap[dateStr].bad += eggs;
      }
    });

    let allTimeSalesQty = 0;
    let todaySalesQty = 0;

    sales.forEach((row: any) => {
      const d = new Date(row.date_added);
      if (!row.date_added || isNaN(d.getTime())) return; // skip rows with invalid dates
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const eggs = parseToTotalEggs(row.quantity);

      allTimeSalesQty += eggs;
      
      if (isToday) {
        todaySalesQty += eggs;
      }
    });

    // Format chart data (last 7 active days)
    const chartData = Object.values(chartDataMap)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7)
      .map(d => ({
        date: d.date,
        good: normalizeQuantity(d.good),
        bad: normalizeQuantity(d.bad)
      }));

    // Format final response
    const metrics = {
      goodEggs: {
        allTime: normalizeQuantity(allTimeGoodEggs),
        today: normalizeQuantity(todayGoodEggs),
      },
      badEggs: {
        allTime: normalizeQuantity(allTimeBadEggs),
        today: normalizeQuantity(todayBadEggs),
      },
      salesQty: {
        allTime: normalizeQuantity(allTimeSalesQty),
        today: normalizeQuantity(todaySalesQty),
      }
    };

    // Recent activity
    const toTime = (v: any) => { const t = new Date(v).getTime(); return isNaN(t) ? 0 : t; };

    // Group production by location — each location shown once with good + bad combined
    const locationMap: Record<string, { location: string; good: number; bad: number; date_added: string }> = {};
    production
      .sort((a: any, b: any) => toTime(b.date_added) - toTime(a.date_added))
      .forEach((row: any) => {
        const loc = row.location;
        if (!locationMap[loc]) {
          locationMap[loc] = { location: loc, good: 0, bad: 0, date_added: row.date_added };
        }
        const eggs = parseToTotalEggs(row.quantity);
        if (row.conditionn === 'Good') locationMap[loc].good += eggs;
        else locationMap[loc].bad += eggs;
      });

    const recentProduction = Object.values(locationMap)
      .slice(0, 5)
      .map(r => ({
        location: r.location,
        date_added: r.date_added,
        goodQuantity: normalizeQuantity(r.good),
        badQuantity: normalizeQuantity(r.bad),
      }));

    const recentSales = sales
      .sort((a: any, b: any) => toTime(b.date_added) - toTime(a.date_added))
      .slice(0, 5);

    return NextResponse.json({
      metrics,
      chartData,
      recentProduction,
      recentSales
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
