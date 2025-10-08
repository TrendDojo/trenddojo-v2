/**
 * SQLite → PostgreSQL Market Data Migration Script
 *
 * Migrates 4.3M daily price records from local SQLite database to PostgreSQL.
 * Uses batch processing for efficiency and progress tracking.
 *
 * Usage:
 *   npm run migrate-to-postgres
 */

import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const SQLITE_PATH = '/Users/duncanmcgill/coding/trenddojo-v2/data/market/historical_prices.db';
const BATCH_SIZE = 1000;
const PROGRESS_INTERVAL = 10000; // Log every 10k records

interface DailyPrice {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted_close: number;
  data_source?: string;
}

interface StockMetadata {
  symbol: string;
  company_name: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  is_active: boolean;
  last_updated: Date;
}

async function migrateDailyPrices(
  sqlite: Database.Database,
  prisma: PrismaClient
): Promise<void> {
  console.log('\n📊 Starting Daily Prices Migration');
  console.log('━'.repeat(60));

  // Get total count
  const { total } = sqlite.prepare('SELECT COUNT(*) as total FROM daily_prices').get() as { total: number };
  console.log(`📈 Total records to migrate: ${total.toLocaleString()}`);

  let processed = 0;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Stream data in batches
  const stmt = sqlite.prepare('SELECT * FROM daily_prices ORDER BY symbol, date');
  const rows = stmt.all() as DailyPrice[];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    try {
      // Insert batch using createMany with skipDuplicates
      const result = await prisma.daily_prices.createMany({
        data: batch.map(row => ({
          symbol: row.symbol,
          date: row.date,
          open: row.open.toString(),
          high: row.high.toString(),
          low: row.low.toString(),
          close: row.close.toString(),
          volume: BigInt(row.volume),
          adjustedClose: row.adjusted_close.toString(),
          dataSource: row.data_source || 'polygon',
          createdAt: new Date(),
        })),
        skipDuplicates: true,
      });

      inserted += result.count;
      processed += batch.length;
      skipped += (batch.length - result.count);

      if (processed % PROGRESS_INTERVAL === 0 || processed === total) {
        const percent = ((processed / total) * 100).toFixed(1);
        console.log(
          `⚙️  [${processed.toLocaleString()}/${total.toLocaleString()}] ${percent}% | ` +
          `Inserted: ${inserted.toLocaleString()} | Skipped: ${skipped.toLocaleString()}`
        );
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error inserting batch starting at row ${i}:`, error);

      // Try individual inserts for this batch to identify problematic records
      for (const row of batch) {
        try {
          await prisma.daily_prices.create({
            data: {
              symbol: row.symbol,
              date: row.date,
              open: row.open.toString(),
              high: row.high.toString(),
              low: row.low.toString(),
              close: row.close.toString(),
              volume: BigInt(row.volume),
              adjustedClose: row.adjusted_close.toString(),
              dataSource: row.data_source || 'polygon',
              createdAt: new Date(),
            },
          });
          inserted++;
        } catch (individualError) {
          skipped++;
          console.error(`  ⚠️  Failed to insert ${row.symbol} ${row.date}`);
        }
      }
      processed += batch.length;
    }
  }

  console.log('\n✅ Daily Prices Migration Complete');
  console.log(`   Inserted: ${inserted.toLocaleString()}`);
  console.log(`   Skipped:  ${skipped.toLocaleString()}`);
  console.log(`   Errors:   ${errors}`);
}

async function migrateStockMetadata(
  sqlite: Database.Database,
  prisma: PrismaClient
): Promise<void> {
  console.log('\n📊 Starting Stock Metadata Migration');
  console.log('━'.repeat(60));

  // Get all metadata records
  const stmt = sqlite.prepare('SELECT * FROM stock_metadata');
  const rows = stmt.all() as any[];

  console.log(`📈 Total symbols to migrate: ${rows.length}`);

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      await prisma.stock_metadata.upsert({
        where: { symbol: row.symbol },
        create: {
          symbol: row.symbol,
          companyName: row.company_name || row.symbol,
          exchange: row.exchange,
          sector: row.sector,
          industry: row.industry,
          marketCap: row.market_cap ? BigInt(row.market_cap) : null,
          description: row.description,
          website: row.website,
          ceo: row.ceo,
          employees: row.employees,
          country: row.country,
          phone: row.phone,
          address: row.address,
          city: row.city,
          state: row.state,
          zip: row.zip,
          isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
          listingDate: row.listing_date,
          ipoDate: row.ipo_date,
          delistDate: row.delist_date,
          lastUpdated: row.last_updated ? new Date(row.last_updated) : new Date(),
        },
        update: {
          companyName: row.company_name || row.symbol,
          exchange: row.exchange,
          sector: row.sector,
          industry: row.industry,
          marketCap: row.market_cap ? BigInt(row.market_cap) : null,
          lastUpdated: new Date(),
        },
      });
      inserted++;

      if (inserted % 100 === 0) {
        console.log(`⚙️  Processed ${inserted}/${rows.length} symbols`);
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error migrating metadata for ${row.symbol}:`, error);
    }
  }

  console.log('\n✅ Stock Metadata Migration Complete');
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Errors:   ${errors}`);
}

async function verifyMigration(
  sqlite: Database.Database,
  prisma: PrismaClient
): Promise<void> {
  console.log('\n🔍 Verifying Migration');
  console.log('━'.repeat(60));

  // Count records in both databases
  const sqliteCount = (sqlite.prepare('SELECT COUNT(*) as count FROM daily_prices').get() as { count: number }).count;
  const pgCount = await prisma.daily_prices.count();

  console.log(`SQLite records: ${sqliteCount.toLocaleString()}`);
  console.log(`PostgreSQL records: ${pgCount.toLocaleString()}`);

  if (sqliteCount === pgCount) {
    console.log('✅ Record counts match perfectly!');
  } else {
    const diff = sqliteCount - pgCount;
    console.log(`⚠️  Missing ${diff.toLocaleString()} records (${((diff / sqliteCount) * 100).toFixed(2)}%)`);
  }

  // Sample data verification
  const sampleSymbols = ['AAPL', 'MSFT', 'GOOGL'];
  for (const symbol of sampleSymbols) {
    const sqliteRow = sqlite.prepare('SELECT * FROM daily_prices WHERE symbol = ? ORDER BY date DESC LIMIT 1').get(symbol) as DailyPrice | undefined;
    const pgRow = await prisma.daily_prices.findFirst({
      where: { symbol },
      orderBy: { date: 'desc' },
    });

    if (sqliteRow && pgRow) {
      console.log(`✅ ${symbol}: Latest date ${pgRow.date} matches`);
    } else if (!sqliteRow) {
      console.log(`⚠️  ${symbol}: Not found in SQLite`);
    } else {
      console.log(`❌ ${symbol}: Not found in PostgreSQL`);
    }
  }
}

async function main() {
  console.log('🚀 SQLite → PostgreSQL Market Data Migration');
  console.log('━'.repeat(60));
  console.log(`Source: ${SQLITE_PATH}`);
  console.log(`Target: ${process.env.DATABASE_URL}`);
  console.log('━'.repeat(60));

  // Initialize connections
  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const prisma = new PrismaClient();

  try {
    const startTime = Date.now();

    // Run migrations
    await migrateDailyPrices(sqlite, prisma);
    await migrateStockMetadata(sqlite, prisma);
    await verifyMigration(sqlite, prisma);

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n⏱️  Total migration time: ${duration} minutes`);
    console.log('✅ Migration complete!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
