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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private golfRounds: Map<number, GolfRound>;
  private golfHoles: Map<number, GolfHole>;
  private currentUserId: number;
  private currentRoundId: number;
  private currentHoleId: number;

  constructor() {
    this.users = new Map();
    this.golfRounds = new Map();
    this.golfHoles = new Map();
    this.currentUserId = 1;
    this.currentRoundId = 1;
    this.currentHoleId = 1;
    
    // Create a default user
    this.createUser({
      username: "mike",
      password: "password",
      name: "Mike"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGolfRound(insertRound: InsertGolfRound): Promise<GolfRound> {
    const id = this.currentRoundId++;
    const round: GolfRound = {
      ...insertRound,
      id,
      totalScore: null,
      isCompleted: false,
      currentHole: 1,
      date: new Date(),
    };
    this.golfRounds.set(id, round);

    // Create 18 holes with default par values
    const standardPars = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 4];
    const standardYardages = [387, 425, 165, 520, 410, 380, 175, 390, 485, 395, 145, 400, 375, 515, 160, 420, 405, 385];
    
    for (let i = 1; i <= 18; i++) {
      await this.createGolfHole({
        roundId: id,
        holeNumber: i,
        par: standardPars[i - 1],
        yardage: standardYardages[i - 1],
        score: null,
        putts: null,
        fairwayInRegulation: null,
        greenInRegulation: null,
        notes: null,
      });
    }

    return round;
  }

  async getGolfRound(id: number): Promise<RoundWithHoles | undefined> {
    const round = this.golfRounds.get(id);
    if (!round) return undefined;

    const holes = await this.getGolfHoles(id);
    return { ...round, holes };
  }

  async getUserGolfRounds(userId: number): Promise<RoundWithHoles[]> {
    const userRounds = Array.from(this.golfRounds.values())
      .filter(round => round.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const roundsWithHoles: RoundWithHoles[] = [];
    for (const round of userRounds) {
      const holes = await this.getGolfHoles(round.id);
      roundsWithHoles.push({ ...round, holes });
    }

    return roundsWithHoles;
  }

  async updateGolfRound(id: number, updates: Partial<GolfRound>): Promise<GolfRound | undefined> {
    const round = this.golfRounds.get(id);
    if (!round) return undefined;

    const updatedRound = { ...round, ...updates };
    this.golfRounds.set(id, updatedRound);
    return updatedRound;
  }

  async deleteGolfRound(id: number): Promise<boolean> {
    const deleted = this.golfRounds.delete(id);
    // Also delete associated holes
    Array.from(this.golfHoles.values())
      .filter(hole => hole.roundId === id)
      .forEach(hole => this.golfHoles.delete(hole.id));
    return deleted;
  }

  async createGolfHole(insertHole: InsertGolfHole): Promise<GolfHole> {
    const id = this.currentHoleId++;
    const hole: GolfHole = { ...insertHole, id };
    this.golfHoles.set(id, hole);
    return hole;
  }

  async updateGolfHole(roundId: number, holeNumber: number, updates: UpdateGolfHole): Promise<GolfHole | undefined> {
    const hole = Array.from(this.golfHoles.values())
      .find(h => h.roundId === roundId && h.holeNumber === holeNumber);
    
    if (!hole) return undefined;

    const updatedHole = { ...hole, ...updates };
    this.golfHoles.set(hole.id, updatedHole);

    // Update round totals if score was updated
    if (updates.score !== undefined) {
      await this.updateRoundTotals(roundId);
    }

    return updatedHole;
  }

  async getGolfHoles(roundId: number): Promise<GolfHole[]> {
    return Array.from(this.golfHoles.values())
      .filter(hole => hole.roundId === roundId)
      .sort((a, b) => a.holeNumber - b.holeNumber);
  }

  async getUserStats(userId: number): Promise<RoundStats> {
    const userRounds = Array.from(this.golfRounds.values())
      .filter(round => round.userId === userId && round.isCompleted);

    if (userRounds.length === 0) {
      return {
        averageScore: 0,
        firPercentage: 0,
        girPercentage: 0,
        averagePutts: 0,
        totalRounds: 0,
      };
    }

    const allHoles = Array.from(this.golfHoles.values())
      .filter(hole => userRounds.some(round => round.id === hole.roundId))
      .filter(hole => hole.score !== null);

    const totalScore = userRounds.reduce((sum, round) => sum + (round.totalScore || 0), 0);
    const averageScore = totalScore / userRounds.length;

    const holesWithFIR = allHoles.filter(hole => hole.fairwayInRegulation !== null);
    const firHits = holesWithFIR.filter(hole => hole.fairwayInRegulation === true).length;
    const firPercentage = holesWithFIR.length > 0 ? (firHits / holesWithFIR.length) * 100 : 0;

    const holesWithGIR = allHoles.filter(hole => hole.greenInRegulation !== null);
    const girHits = holesWithGIR.filter(hole => hole.greenInRegulation === true).length;
    const girPercentage = holesWithGIR.length > 0 ? (girHits / holesWithGIR.length) * 100 : 0;

    const holesWithPutts = allHoles.filter(hole => hole.putts !== null);
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
    const activeRound = Array.from(this.golfRounds.values())
      .find(round => round.userId === userId && !round.isCompleted);

    if (!activeRound) return undefined;

    const holes = await this.getGolfHoles(activeRound.id);
    return { ...activeRound, holes };
  }

  private async updateRoundTotals(roundId: number): Promise<void> {
    const round = this.golfRounds.get(roundId);
    if (!round) return;

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

export const storage = new MemStorage();
