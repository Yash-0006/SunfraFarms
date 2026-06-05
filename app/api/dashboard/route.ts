import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';

export async function GET(request: Request) {
  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const production: any = await query('SELECT * FROM egg_production');
    const sales: any = await query('SELECT * FROM egg_sale');

    let allTimeGoodEggs = 0;
    let allTimeDamagedEggs = 0;
    let allTimeBigEggs = 0;
    let allTimeSmallEggs = 0;
    
    let todayGoodEggs = 0;
    let todayDamagedEggs = 0;
    let todayBigEggs = 0;
    let todaySmallEggs = 0;

    const chartDataMap: Record<string, { date: string, good: number, damaged: number, big: number, small: number, sales: number, bigSales: number, smallSales: number }> = {};

    production.forEach((row: any) => {
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return; 
      
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const eggs = parseToTotalEggs(row.quantity);

      if (row.conditionn === 'Good') {
        allTimeGoodEggs += eggs;
        if (isToday) todayGoodEggs += eggs;
      } else if (row.conditionn === 'Damaged') {
        allTimeDamagedEggs += eggs;
        if (isToday) todayDamagedEggs += eggs;
      } else if (row.conditionn === 'Big') {
        allTimeBigEggs += eggs;
        if (isToday) todayBigEggs += eggs;
      } else if (row.conditionn === 'Small') {
        allTimeSmallEggs += eggs;
        if (isToday) todaySmallEggs += eggs;
      } else {
        // Fallback
        allTimeDamagedEggs += eggs;
        if (isToday) todayDamagedEggs += eggs;
      }

      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { date: dateStr, good: 0, damaged: 0, big: 0, small: 0, sales: 0, bigSales: 0, smallSales: 0 };
      
      if (row.conditionn === 'Good') chartDataMap[dateStr].good += eggs;
      else if (row.conditionn === 'Damaged') chartDataMap[dateStr].damaged += eggs;
      else if (row.conditionn === 'Big') chartDataMap[dateStr].big += eggs;
      else if (row.conditionn === 'Small') chartDataMap[dateStr].small += eggs;
      else chartDataMap[dateStr].damaged += eggs;
    });

    let allTimeSalesBigQty = 0;
    let allTimeSalesSmallQty = 0;
    let todaySalesBigQty = 0;
    let todaySalesSmallQty = 0;

    sales.forEach((row: any) => {
      const d = new Date(row.date);
      if (!row.date || isNaN(d.getTime())) return;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      
      const bigEggs = parseToTotalEggs(row.big_quantity);
      const smallEggs = parseToTotalEggs(row.small_quantity);

      allTimeSalesBigQty += bigEggs;
      allTimeSalesSmallQty += smallEggs;
      
      if (isToday) {
        todaySalesBigQty += bigEggs;
        todaySalesSmallQty += smallEggs;
      }

      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { date: dateStr, good: 0, damaged: 0, big: 0, small: 0, sales: 0, bigSales: 0, smallSales: 0 };

      chartDataMap[dateStr].bigSales += bigEggs;
      chartDataMap[dateStr].smallSales += smallEggs;
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
        damaged: normalizeQuantity(d.damaged),
        big: normalizeQuantity(d.big),
        small: normalizeQuantity(d.small),
        bigSales: normalizeQuantity(d.bigSales || 0),
        smallSales: normalizeQuantity(d.smallSales || 0)
      }));

    const metrics = {
      goodEggs: { allTime: normalizeQuantity(allTimeGoodEggs), today: normalizeQuantity(todayGoodEggs) },
      damagedEggs: { allTime: normalizeQuantity(allTimeDamagedEggs), today: normalizeQuantity(todayDamagedEggs) },
      bigEggs: { allTime: normalizeQuantity(allTimeBigEggs), today: normalizeQuantity(todayBigEggs) },
      smallEggs: { allTime: normalizeQuantity(allTimeSmallEggs), today: normalizeQuantity(todaySmallEggs) },
      salesBigQty: { allTime: normalizeQuantity(allTimeSalesBigQty), today: normalizeQuantity(todaySalesBigQty) },
      salesSmallQty: { allTime: normalizeQuantity(allTimeSalesSmallQty), today: normalizeQuantity(todaySalesSmallQty) },
      salesQty: { allTime: normalizeQuantity(allTimeSalesBigQty + allTimeSalesSmallQty), today: normalizeQuantity(todaySalesBigQty + todaySalesSmallQty) }
    };

    const toTime = (v: any) => { const t = new Date(v).getTime(); return isNaN(t) ? 0 : t; };

    const locationMap: Record<string, { location: string; good: number; damaged: number; big: number; small: number; date: string }> = {};
    production
      .sort((a: any, b: any) => toTime(b.date) - toTime(a.date))
      .forEach((row: any) => {
        const loc = row.location;
        if (!locationMap[loc]) {
          locationMap[loc] = { location: loc, good: 0, damaged: 0, big: 0, small: 0, date: row.date };
        }
        const eggs = parseToTotalEggs(row.quantity);
        if (row.conditionn === 'Good') locationMap[loc].good += eggs;
        else if (row.conditionn === 'Damaged') locationMap[loc].damaged += eggs;
        else if (row.conditionn === 'Big') locationMap[loc].big += eggs;
        else if (row.conditionn === 'Small') locationMap[loc].small += eggs;
        else locationMap[loc].damaged += eggs;
      });

    const recentProduction = Object.values(locationMap)
      .slice(0, 5)
      .map(r => ({
        location: r.location,
        date: r.date,
        goodQuantity: normalizeQuantity(r.good),
        damagedQuantity: normalizeQuantity(r.damaged),
        bigQuantity: normalizeQuantity(r.big),
        smallQuantity: normalizeQuantity(r.small),
      }));

    const recentSales = sales
      .sort((a: any, b: any) => toTime(b.date) - toTime(a.date))
      .slice(0, 5);

    return NextResponse.json({ metrics, chartData, recentProduction, recentSales });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
