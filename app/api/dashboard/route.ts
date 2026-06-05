import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';

export async function GET(request: Request) {
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
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return; // skip rows with invalid dates
      
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
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return; // skip rows with invalid dates
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const eggs = parseToTotalEggs(row.quantity);

      allTimeSalesQty += eggs;
      
      if (isToday) {
        todaySalesQty += eggs;
      }
    });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d';

    let daysToInclude = 7;
    if (period === '1m') daysToInclude = 30;
    else if (period === '3m') daysToInclude = 90;
    else if (period === '6m') daysToInclude = 180;
    else if (period === '1y') daysToInclude = 365;
    else if (period === '5y') daysToInclude = 1825;

    const cutoffTime = today.getTime() - daysToInclude * 24 * 60 * 60 * 1000;

    const chartData = Object.values(chartDataMap)
      .filter(d => new Date(d.date).getTime() >= cutoffTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
    const locationMap: Record<string, { location: string; good: number; bad: number; date: string }> = {};
    production
      .sort((a: any, b: any) => toTime(b.date) - toTime(a.date))
      .forEach((row: any) => {
        const loc = row.location;
        if (!locationMap[loc]) {
          locationMap[loc] = { location: loc, good: 0, bad: 0, date: row.date };
        }
        const eggs = parseToTotalEggs(row.quantity);
        if (row.conditionn === 'Good') locationMap[loc].good += eggs;
        else locationMap[loc].bad += eggs;
      });

    const recentProduction = Object.values(locationMap)
      .slice(0, 5)
      .map(r => ({
        location: r.location,
        date: r.date,
        goodQuantity: normalizeQuantity(r.good),
        badQuantity: normalizeQuantity(r.bad),
      }));

    const recentSales = sales
      .sort((a: any, b: any) => toTime(b.date) - toTime(a.date))
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
