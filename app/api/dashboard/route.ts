import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseToTotalEggs, normalizeQuantity } from '@/lib/quantity-utils';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';
    
    // 1. Try to fetch from Redis Cache
    const cacheKey = `dashboard_stats_${period}`;
    if (redis.status === 'ready') {
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log(`[Cache Hit] Serving dashboard for period: ${period}`);
          return NextResponse.json(JSON.parse(cachedData));
        }
      } catch (redisError) {
        console.warn('Redis cache read failed, falling back to DB calculation:', redisError);
      }
    }

    console.log(`[Cache Miss] Calculating heavy SQL for period: ${period}...`);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const production: any = await query('SELECT * FROM egg_production');
    const sales: any = await query('SELECT * FROM egg_sale');
    const labour: any = await query('SELECT * FROM labour');
    const attendance: any = await query('SELECT * FROM labour_attendance');

    let allTimeGoodEggs = 0;
    let allTimeDamagedEggs = 0;
    let allTimeBigEggs = 0;
    let allTimeSmallEggs = 0;
    
    let todayGoodEggs = 0;
    let todayDamagedEggs = 0;
    let todayBigEggs = 0;
    let todaySmallEggs = 0;

    let activeWorkers = 0;
    let inactiveWorkers = 0;
    let presentToday = 0;
    let absentToday = 0;
    let halfDayToday = 0;

    const chartDataMap: Record<string, { date: string, good: number, damaged: number, big: number, small: number, sales: number, bigSales: number, smallSales: number, present: number, absent: number, half: number }> = {};

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

      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { date: dateStr, good: 0, damaged: 0, big: 0, small: 0, sales: 0, bigSales: 0, smallSales: 0, present: 0, absent: 0, half: 0 };
      
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

      if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { date: dateStr, good: 0, damaged: 0, big: 0, small: 0, sales: 0, bigSales: 0, smallSales: 0, present: 0, absent: 0, half: 0 };

      chartDataMap[dateStr].bigSales += bigEggs;
      chartDataMap[dateStr].smallSales += smallEggs;
    });

    // period is already extracted at the top
    let daysToInclude = 3650; // 10 years by default
    if (period === '7d') daysToInclude = 7;
    else if (period === '1m') daysToInclude = 30;
    else if (period === '3m') daysToInclude = 90;
    else if (period === '6m') daysToInclude = 180;
    else if (period === '1y') daysToInclude = 365;
    else if (period === '5y') daysToInclude = 1825;

    const cutoffTime = today.getTime() - daysToInclude * 24 * 60 * 60 * 1000;


    labour.forEach((row: any) => {
      if (row.status === 'active') activeWorkers++;
      else inactiveWorkers++;
    });

    attendance.forEach((row: any) => {
      const d = new Date(row.date);
      const attDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = attDateStr === todayStr;
      
      if (isToday) {
        if (row.status === 'P') presentToday++;
        else if (row.status === 'A') absentToday++;
        else if (row.status === 'P/2') halfDayToday++;
      }

      if (!chartDataMap[attDateStr]) chartDataMap[attDateStr] = { date: attDateStr, good: 0, damaged: 0, big: 0, small: 0, sales: 0, bigSales: 0, smallSales: 0, present: 0, absent: 0, half: 0 };
      
      if (row.status === 'P') chartDataMap[attDateStr].present++;
      else if (row.status === 'A') chartDataMap[attDateStr].absent++;
      else if (row.status === 'P/2') chartDataMap[attDateStr].half++;
    });

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
        smallSales: normalizeQuantity(d.smallSales || 0),
        present: d.present || 0,
        absent: d.absent || 0,
        half: d.half || 0,
      }));

    const metrics = {
      goodEggs: { allTime: normalizeQuantity(allTimeGoodEggs), today: normalizeQuantity(todayGoodEggs) },
      damagedEggs: { allTime: normalizeQuantity(allTimeDamagedEggs), today: normalizeQuantity(todayDamagedEggs) },
      bigEggs: { allTime: normalizeQuantity(allTimeBigEggs), today: normalizeQuantity(todayBigEggs) },
      smallEggs: { allTime: normalizeQuantity(allTimeSmallEggs), today: normalizeQuantity(todaySmallEggs) },
      salesBigQty: { allTime: normalizeQuantity(allTimeSalesBigQty), today: normalizeQuantity(todaySalesBigQty) },
      salesSmallQty: { allTime: normalizeQuantity(allTimeSalesSmallQty), today: normalizeQuantity(todaySalesSmallQty) },
      salesQty: { allTime: normalizeQuantity(allTimeSalesBigQty + allTimeSalesSmallQty), today: normalizeQuantity(todaySalesBigQty + todaySalesSmallQty) },
      labour: { active: activeWorkers, inactive: inactiveWorkers, presentToday, absentToday, halfDayToday }
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

    const todayAbsentees = attendance
      .filter((row: any) => row.date === todayStr && (row.status === 'A' || row.status === 'P/2'))
      .map((row: any) => {
        const worker = labour.find((l: any) => l.id === row.labour_id);
        return {
          name: worker ? worker.name : 'Unknown',
          role: worker ? worker.role : 'Unknown',
          status: row.status
        };
      });

    const responseData = { metrics, chartData, recentProduction, recentSales, todayAbsentees };

    // 2. Save calculation to Redis Cache for 60 seconds
    if (redis.status === 'ready') {
      try {
        await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60);
      } catch (redisError) {
        console.warn('Redis cache save failed:', redisError);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
