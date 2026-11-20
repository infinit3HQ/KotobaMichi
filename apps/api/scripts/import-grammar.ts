import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/drizzle.service';
import { grammarPoints } from '../src/db/schema';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { v7 as uuidv7 } from 'uuid';

interface CsvGrammarRow {
  'Grammar Point': string;
  'Meaning': string;
  'Formation': string;
  'Example (Japanese)': string;
  'Example (Romaji)': string;
  'Example (English)': string;
  'JLPT Level': string;
}

function cleanLevel(raw: string): string {
  if (!raw) return 'N5';
  const match = raw.match(/N[1-5]/i);
  return match ? match[0].toUpperCase() : 'N5';
}

async function importGrammar() {
  console.log('🚀 Starting JLPT Grammar CSV Import...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dbService = app.get(DbService);

    const filePath = path.resolve(process.cwd(), 'csv-imports/grammar.csv');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Reading CSV from: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const records: CsvGrammarRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`📊 Found ${records.length} grammar points in CSV.`);

    let imported = 0;
    let errors = 0;

    for (const row of records) {
      try {
        const level = cleanLevel(row['JLPT Level']);
        const point = row['Grammar Point']?.trim();
        const meaning = row['Meaning']?.trim();
        const formation = row['Formation']?.trim() || null;
        const exampleJapanese = row['Example (Japanese)']?.trim();
        const exampleRomaji = row['Example (Romaji)']?.trim() || null;
        const exampleEnglish = row['Example (English)']?.trim() || '';

        if (!point || !meaning || !exampleJapanese) {
          continue;
        }

        await dbService.db.insert(grammarPoints).values({
          id: uuidv7(),
          level,
          point,
          meaning,
          formation,
          exampleJapanese,
          exampleRomaji,
          exampleEnglish,
        });

        imported++;
      } catch (err) {
        errors++;
        console.error(`❌ Error importing point "${row['Grammar Point']}":`, err);
      }
    }

    console.log('\n=======================================');
    console.log(`✅ Import finished!`);
    console.log(`   Total in CSV: ${records.length}`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Errors: ${errors}`);
    console.log('=======================================\n');

    await app.close();
    process.exit(0);
  } catch (err) {
    console.error('💥 Fatal import error:', err);
    process.exit(1);
  }
}

importGrammar();
