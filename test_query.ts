import { querySales } from './lib/ai/tools';

async function testQuery() {
  const result = await querySales({ date: '2026-06-04' });
  console.log(JSON.stringify(result, null, 2));
}

testQuery();
