import mysql from 'mysql2/promise';
import { Meilisearch } from 'meilisearch';
import path from 'path';
import fs from 'fs';

const envPathLocal = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envPathLocal)) process.loadEnvFile(envPathLocal);
else if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

const host = process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700';
const apiKey = process.env.MEILISEARCH_API_KEY || 'masterKey123';
const dbUrl = process.env.DATABASE_URL;

const searchClient = new Meilisearch({ host, apiKey });

async function sync() {
  if (!dbUrl) throw new Error("DATABASE_URL is missing");
  const pool = mysql.createPool(dbUrl);

  try {
    console.log('Fetching sales from MySQL...');
    const [sales]: any = await pool.execute('SELECT * FROM egg_sale');
    
    console.log(`Found ${sales.length} sales. Syncing to Meilisearch...`);
    const salesIndex = searchClient.index('sales');
    
    // Configure searchable fields
    await salesIndex.updateSettings({
      searchableAttributes: ['name', 'remarks', 'date'],
      sortableAttributes: ['date'],
    });

    const formattedSales = sales.map((sale: any) => ({
      id: sale.sale_id,
      name: sale.name,
      date: sale.date instanceof Date ? sale.date.toISOString().split('T')[0] : sale.date,
      remarks: sale.remarks,
      big_quantity: parseFloat(sale.big_quantity),
      small_quantity: parseFloat(sale.small_quantity)
    }));

    const task = await salesIndex.addDocuments(formattedSales);
    console.log(`✅ Upload initiated! Task ID: ${task.taskUid}`);
    console.log(`Your data is now ready for instant typo-tolerant search!`);

  } catch (err) {
    console.error('Error syncing:', err);
  } finally {
    await pool.end();
  }
}

sync();
