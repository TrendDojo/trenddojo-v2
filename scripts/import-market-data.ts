#!/usr/bin/env tsx
/**
 * Market Data Import Script
 * Usage: npm run import-data <file.csv|file.json>
 */

import path from 'path';
import fs from 'fs';
import { MarketDatabase } from '../src/lib/market-data/database/MarketDatabase';
import { BulkImporter } from '../src/lib/market-data/import/BulkImporter';

// Import function
async function importData(filePath: string, options: any) {
  console.log(`\n📊 Market Data Import`);
  console.log('━'.repeat(50));

  // Validate file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const fileExt = path.extname(filePath).toLowerCase();
  const fileSize = fs.statSync(filePath).size;

  console.log(`📁 File: ${path.basename(filePath)}`);
  console.log(`📏 Size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📋 Format: ${fileExt.substring(1).toUpperCase()}`);
  console.log('');

  // Initialize database
  const db = new MarketDatabase();
  await db.initialize();

  // Create importer
  const importer = new BulkImporter(db);
  importer.setBatchSize(parseInt(options.batchSize));
  importer.setValidation(options.validate !== false);

  const startTime = Date.now();

  try {
    // Import based on file type
    if (fileExt === '.csv') {
      await importer.importCSV(filePath, {
        skipDuplicates: options.skipDuplicates,
        onProgress: (progress) => {
          process.stdout.write(
            `\r⚙️  Processing: ${progress.processedRecords} records | ` +
            `${progress.percentComplete.toFixed(1)}% complete | ` +
            `Failed: ${progress.failedRecords}`
          );
        }
      });
    } else if (fileExt === '.json') {
      await importer.importJSON(filePath, {
        skipDuplicates: options.skipDuplicates,
        onProgress: (progress) => {
          process.stdout.write(
            `\r⚙️  Processing: ${progress.processedRecords}/${progress.totalRecords} | ` +
            `${progress.percentComplete.toFixed(1)}% complete | ` +
            `Failed: ${progress.failedRecords}`
          );
        }
      });
    } else {
      throw new Error(`Unsupported file format: ${fileExt}`);
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n\n✅ Import completed in ${duration.toFixed(2)} seconds`);

    // Show stats after import
    const stats = db.getStats();
    console.log(`\n📈 Database Statistics:`);
    console.log(`   Total Symbols: ${stats.totalSymbols.toLocaleString()}`);
    console.log(`   Total Records: ${stats.totalRecords.toLocaleString()}`);
    console.log(`   Date Range: ${stats.earliestDate} to ${stats.latestDate}`);
    console.log(`   Database Size: ${(stats.databaseSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error(`\n❌ Import failed:`, error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Show database statistics
async function showStats() {
  console.log(`\n📊 Market Database Statistics`);
  console.log('━'.repeat(50));

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const stats = db.getStats();
    const symbols = db.getSymbols();

    console.log(`📈 Overview:`);
    console.log(`   Total Symbols: ${stats.totalSymbols.toLocaleString()}`);
    console.log(`   Total Records: ${stats.totalRecords.toLocaleString()}`);
    console.log(`   Date Range: ${stats.earliestDate || 'N/A'} to ${stats.latestDate || 'N/A'}`);
    console.log(`   Database Size: ${(stats.databaseSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Last Updated: ${stats.lastUpdated}`);

    if (symbols.length > 0) {
      console.log(`\n📝 Sample Symbols: ${symbols.slice(0, 10).join(', ')}${symbols.length > 10 ? '...' : ''}`);
    }

  } catch (error) {
    console.error(`❌ Failed to get stats:`, error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Backup database
async function backupDatabase(outputPath: string) {
  console.log(`\n💾 Creating Database Backup`);
  console.log('━'.repeat(50));

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const resolvedPath = path.resolve(outputPath);
    db.backup(resolvedPath);
    const size = fs.statSync(resolvedPath).size;

    console.log(`✅ Backup created successfully`);
    console.log(`📁 Location: ${resolvedPath}`);
    console.log(`📏 Size: ${(size / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error(`❌ Backup failed:`, error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Vacuum database
async function vacuumDatabase() {
  console.log(`\n🧹 Vacuuming Database`);
  console.log('━'.repeat(50));

  const db = new MarketDatabase();
  await db.initialize();

  try {
    const statsBefore = db.getStats();
    console.log(`📏 Size before: ${(statsBefore.databaseSize / 1024 / 1024).toFixed(2)} MB`);

    db.vacuum();

    const statsAfter = db.getStats();
    const saved = statsBefore.databaseSize - statsAfter.databaseSize;

    console.log(`📏 Size after: ${(statsAfter.databaseSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✅ Space reclaimed: ${(saved / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error(`❌ Vacuum failed:`, error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Main execution
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'import':
      if (!arg) {
        console.error('❌ Please provide a file to import');
        process.exit(1);
      }
      await importData(arg, { skipDuplicates: false, batchSize: '1000', validate: true });
      break;

    case 'stats':
      await showStats();
      break;

    case 'backup':
      if (!arg) {
        console.error('❌ Please provide an output file');
        process.exit(1);
      }
      await backupDatabase(arg);
      break;

    case 'vacuum':
      await vacuumDatabase();
      break;

    default:
      console.log(`
Market Data Import Tool

Usage:
  npm run import-data <command> [args]

Commands:
  import <file>   Import data from CSV or JSON file
  stats           Show database statistics
  backup <file>   Backup database to file
  vacuum          Vacuum database to reclaim space

Examples:
  npm run import-data import data/sp500.csv
  npm run market-stats
  npm run market-backup backup.json
  npm run market-vacuum
      `);
  }
}

// Run main function
main().catch(console.error);