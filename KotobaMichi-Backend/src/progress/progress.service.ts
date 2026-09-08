import { Injectable } from '@nestjs/common';
import { DbService } from '@/db/drizzle.service';
import { userProgress } from '@/db/schema';
import { inArray, and, eq } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class ProgressService {
  constructor(private dbService: DbService) {}
  private get db() {
    return this.dbService.db;
  }

  async trackProgress(
    userId: string,
    wordIds: string[],
    outcome: 'correct' | 'incorrect'
  ) {
    if (wordIds.length === 0) {
      return;
    }

    const existingProgress = await this.db.query.userProgress.findMany({
      where: and(
        eq(userProgress.userId, userId),
        inArray(userProgress.wordId, wordIds)
      ),
    });

    const existingProgressMap = new Map(
      existingProgress.map(p => [p.wordId, p])
    );
    const now = new Date();

    const updates: Promise<any>[] = [];
    const inserts: any[] = [];

    for (const wordId of wordIds) {
      const progress = existingProgressMap.get(wordId);
      if (progress) {
        // Update existing progress
        const newMasteryLevel =
          outcome === 'correct'
            ? Math.min(10, progress.masteryLevel + 1)
            : Math.max(0, progress.masteryLevel - 1);

        updates.push(
          this.db
            .update(userProgress)
            .set({
              masteryLevel: newMasteryLevel,
              lastReviewedAt: now,
              // TODO: Implement SRS logic for nextReviewAt
            })
            .where(eq(userProgress.id, progress.id))
        );
      } else {
        // Insert new progress
        inserts.push({
          id: uuidv7(),
          userId,
          wordId,
          masteryLevel: outcome === 'correct' ? 1 : 0,
          lastReviewedAt: now,
          // TODO: Implement SRS logic for nextReviewAt
        });
      }
    }

    if (inserts.length > 0) {
      await this.db.insert(userProgress).values(inserts);
    }

    await Promise.all(updates);
  }

  async getUserProgress(userId: string) {
    return this.db.query.userProgress.findMany({
      where: eq(userProgress.userId, userId),
      with: {
        word: true,
      },
      orderBy: (p, { desc }) => [desc(p.updatedAt)],
    });
  }
}
