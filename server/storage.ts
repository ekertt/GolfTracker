import { 
  users, 
  golfRounds, 
  golfHoles,
  type User, 
  type InsertUser,
  type GolfRound,
  type InsertGolfRound,
  type GolfHole,
  type InsertGolfHole,
  type UpdateGolfHole,
  type RoundWithHoles,
  type RoundStats
} from "@shared/schema";
import { db } from "./db";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Golf round methods
  createGolfRound(round: InsertGolfRound): Promise<GolfRound>;
  getGolfRound(id: number): Promise<RoundWithHoles | undefined>;
  getUserGolfRounds(userId: number): Promise<RoundWithHoles[]>;
  updateGolfRound(id: number, updates: Partial<GolfRound>): Promise<GolfRound | undefined>;
  deleteGolfRound(id: number): Promise<boolean>;

  // Golf hole methods
  createGolfHole(hole: InsertGolfHole): Promise<GolfHole>;
  updateGolfHole(roundId: number, holeNumber: number, updates: UpdateGolfHole): Promise<GolfHole | undefined>;
  getGolfHoles(roundId: number): Promise<GolfHole[]>;

  // Statistics methods
  getUserStats(userId: number): Promise<RoundStats>;
  getActiveRound(userId: number): Promise<RoundWithHoles | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGolfRound(insertRound: InsertGolfRound): Promise<GolfRound> {
    const [round] = await db
      .insert(golfRounds)
      .values({
        ...insertRound,
        totalPar: insertRound.totalPar || 72,
      })
      .returning();

    // Create 18 holes with default par values
    const standardPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 4];
    const standardYardages = [387, 425, 165, 520, 410, 380, 175, 390, 485, 395, 145, 400, 375, 515, 160, 420, 405, 385];
    
    const holeInserts = [];
    for (let i = 1; i <= 18; i++) {
      holeInserts.push({
        roundId: round.id,
        holeNumber: i,
        par: standardPars[i - 1],
        yardage: standardYardages[i - 1] || null,
        score: null,
        putts: null,
        fairwayInRegulation: null,
        greenInRegulation: null,
        notes: null,
      });
    }

    await db.insert(golfHoles).values(holeInserts);
    return round;
  }

  async getGolfRound(id: number): Promise<RoundWithHoles | undefined> {
    const [round] = await db.select().from(golfRounds).where(eq(golfRounds.id, id));
    if (!round) return undefined;

    const holes = await this.getGolfHoles(id);
    return { ...round, holes };
  }

  async getUserGolfRounds(userId: number): Promise<RoundWithHoles[]> {
    const userRounds = await db.select().from(golfRounds).where(eq(golfRounds.userId, userId));
    
    const roundsWithHoles: RoundWithHoles[] = [];
    for (const round of userRounds) {
      const holes = await this.getGolfHoles(round.id);
      roundsWithHoles.push({ ...round, holes });
    }

    return roundsWithHoles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async updateGolfRound(id: number, updates: Partial<GolfRound>): Promise<GolfRound | undefined> {
    const [updatedRound] = await db
      .update(golfRounds)
      .set(updates)
      .where(eq(golfRounds.id, id))
      .returning();
    return updatedRound || undefined;
  }

  async deleteGolfRound(id: number): Promise<boolean> {
    // Delete associated holes first
    await db.delete(golfHoles).where(eq(golfHoles.roundId, id));
    
    // Delete the round
    const result = await db.delete(golfRounds).where(eq(golfRounds.id, id));
    return (result.rowCount || 0) > 0;
  }

  async createGolfHole(insertHole: InsertGolfHole): Promise<GolfHole> {
    const [hole] = await db
      .insert(golfHoles)
      .values({
        ...insertHole,
        yardage: insertHole.yardage ?? null,
        score: insertHole.score ?? null,
        putts: insertHole.putts ?? null,
        fairwayInRegulation: insertHole.fairwayInRegulation ?? null,
        greenInRegulation: insertHole.greenInRegulation ?? null,
        notes: insertHole.notes ?? null,
      })
      .returning();
    return hole;
  }

  async updateGolfHole(roundId: number, holeNumber: number, updates: UpdateGolfHole): Promise<GolfHole | undefined> {
    const [updatedHole] = await db
      .update(golfHoles)
      .set(updates)
      .where(eq(golfHoles.roundId, roundId))
      .returning();

    // Update round totals if score was updated
    if (updates.score !== undefined) {
      await this.updateRoundTotals(roundId);
    }

    return updatedHole || undefined;
  }

  async getGolfHoles(roundId: number): Promise<GolfHole[]> {
    return await db
      .select()
      .from(golfHoles)
      .where(eq(golfHoles.roundId, roundId))
      .orderBy(golfHoles.holeNumber);
  }

  async getUserStats(userId: number): Promise<RoundStats> {
    const userRounds = await db
      .select()
      .from(golfRounds)
      .where(eq(golfRounds.userId, userId) && eq(golfRounds.isCompleted, true));

    if (userRounds.length === 0) {
      return {
        averageScore: 0,
        firPercentage: 0,
        girPercentage: 0,
        averagePutts: 0,
        totalRounds: 0,
      };
    }

    const roundIds = userRounds.map(r => r.id);
    const allHoles = await db
      .select()
      .from(golfHoles)
      .where(inArray(golfHoles.roundId, roundIds));

    const completedHoles = allHoles.filter(hole => hole.score !== null);

    const totalScore = userRounds.reduce((sum, round) => sum + (round.totalScore || 0), 0);
    const averageScore = totalScore / userRounds.length;

    const holesWithFIR = completedHoles.filter(hole => hole.fairwayInRegulation !== null);
    const firHits = holesWithFIR.filter(hole => hole.fairwayInRegulation === true).length;
    const firPercentage = holesWithFIR.length > 0 ? (firHits / holesWithFIR.length) * 100 : 0;

    const holesWithGIR = completedHoles.filter(hole => hole.greenInRegulation !== null);
    const girHits = holesWithGIR.filter(hole => hole.greenInRegulation === true).length;
    const girPercentage = holesWithGIR.length > 0 ? (girHits / holesWithGIR.length) * 100 : 0;

    const holesWithPutts = completedHoles.filter(hole => hole.putts !== null);
    const totalPutts = holesWithPutts.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const averagePutts = holesWithPutts.length > 0 ? totalPutts / holesWithPutts.length : 0;

    return {
      averageScore,
      firPercentage,
      girPercentage,
      averagePutts,
      totalRounds: userRounds.length,
    };
  }

  async getActiveRound(userId: number): Promise<RoundWithHoles | undefined> {
    const [activeRound] = await db
      .select()
      .from(golfRounds)
      .where(eq(golfRounds.userId, userId) && eq(golfRounds.isCompleted, false));

    if (!activeRound) return undefined;

    const holes = await this.getGolfHoles(activeRound.id);
    return { ...activeRound, holes };
  }

  private async updateRoundTotals(roundId: number): Promise<void> {
    const holes = await this.getGolfHoles(roundId);
    const completedHoles = holes.filter(hole => hole.score !== null);
    
    if (completedHoles.length > 0) {
      const totalScore = completedHoles.reduce((sum, hole) => sum + (hole.score || 0), 0);
      const currentHole = holes.findIndex(hole => hole.score === null) + 1;
      const isCompleted = completedHoles.length === 18;

      await this.updateGolfRound(roundId, {
        totalScore,
        currentHole: isCompleted ? 18 : Math.min(currentHole, 18),
        isCompleted,
      });
    }
  }
}

export const storage = new DatabaseStorage();
