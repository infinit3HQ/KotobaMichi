import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/drizzle.service';
import { kanjiCharacters } from '../src/db/schema';
import * as path from 'path';
import * as fs from 'fs';
import { v7 as uuidv7 } from 'uuid';

interface KanjiJsonItem {
  id: string;
  character: string;
  meaning: string;
  level: string;
  dominantReading?: string;
  onYomi?: string[];
  kunYomi?: string[];
  radicals: { character: string; meaning: string }[];
  mnemonic?: string;
  vocabulary: { word: string; reading: string; meaning: string }[];
}

async function importKanji() {
  console.log('🚀 Starting JLPT Kanji Master Import...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dbService = app.get(DbService);

    const filePath = path.resolve(process.cwd(), 'csv-imports/kanji.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Reading Kanji data from: ${filePath}`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const records: KanjiJsonItem[] = JSON.parse(raw);

    console.log(`📊 Found ${records.length} Kanji characters in dataset.`);

    let imported = 0;
    let errors = 0;

    for (const item of records) {
      try {
        await dbService.db.insert(kanjiCharacters).values({
          id: uuidv7(),
          level: item.level || 'N5',
          character: item.character,
          meaning: item.meaning,
          dominantReading: item.dominantReading || null,
          onYomi: item.onYomi || [],
          kunYomi: item.kunYomi || [],
          radicals: item.radicals || [],
          mnemonic: item.mnemonic || null,
          vocabulary: item.vocabulary || [],
        });
        imported++;
      } catch (err) {
        errors++;
        console.error(`❌ Error importing Kanji "${item.character}":`, err);
      }
    }

    console.log('\n=======================================');
    console.log(`✅ Kanji Import finished!`);
    console.log(`   Total in Dataset: ${records.length}`);
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

importKanji();
