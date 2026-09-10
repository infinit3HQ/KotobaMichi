import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/drizzle.service';
import { exampleSentences } from '../src/db/schema';
import * as path from 'path';
import * as fs from 'fs';
import { v7 as uuidv7 } from 'uuid';

interface SentenceItem {
  id: string;
  word: string;
  category: string;
  sentenceJapanese: string;
  sentenceRomaji: string;
  sentenceEnglish: string;
}

async function importSentences() {
  console.log('🚀 Starting Authentic Japanese Sentences Import (5,193 items)...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dbService = app.get(DbService);

    const filePath = path.resolve(process.cwd(), 'csv-imports/sentences.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📁 Reading sentences data from: ${filePath}`);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const records: SentenceItem[] = JSON.parse(raw);

    console.log(`📊 Found ${records.length} sentences in dataset.`);

    const BATCH_SIZE = 250;
    let imported = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      const rows = batch.map((item) => ({
        id: uuidv7(),
        word: item.word || null,
        category: item.category || 'General',
        sentenceJapanese: item.sentenceJapanese,
        sentenceRomaji: item.sentenceRomaji || null,
        sentenceEnglish: item.sentenceEnglish,
      }));

      await dbService.db.insert(exampleSentences).values(rows);
      imported += rows.length;
      console.log(`✅ Imported ${imported} / ${records.length} sentences...`);
    }

    console.log(`\n🎉 Sentences import finished! Successfully imported ${imported} sentences.`);
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during sentences import:', error);
    process.exit(1);
  }
}

importSentences();
