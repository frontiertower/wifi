import { users, captiveUsers, events, vouchers, sessions, dailyStats, type User, type InsertUser, type CaptiveUser, type InsertCaptiveUser, type Event, type Voucher, type InsertVoucher, type Session, type DailyStats } from "@shared/schema";
import { db } from "./db";
import { eq, sql, count, and } from "drizzle-orm";

export class DatabaseStorage {
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

  async createCaptiveUser(insertCaptiveUser: InsertCaptiveUser): Promise<CaptiveUser> {
    const [user] = await db
      .insert(captiveUsers)
      .values(insertCaptiveUser)
      .returning();
    return user;
  }

  async updateCaptiveUserSession(userId: number, sessionId: string): Promise<void> {
    await db
      .update(captiveUsers)
      .set({ sessionId })
      .where(eq(captiveUsers.id, userId));
  }

  async getEventByName(name: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.name, name));
    return event || undefined;
  }

  async getEventByCode(code: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.code, code));
    return event || undefined;
  }

  async incrementEventAttendees(eventId: number): Promise<void> {
    // Get current count and increment
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (event) {
      await db
        .update(events)
        .set({ currentAttendees: (event.currentAttendees || 0) + 1 })
        .where(eq(events.id, eventId));
    }
  }

  async getDashboardStats(): Promise<any> {
    const [totalUsersResult] = await db.select({ count: count() }).from(captiveUsers);
    const [activeUsersResult] = await db.select({ count: count() }).from(captiveUsers).where(eq(captiveUsers.isActive, true));
    const [totalEventsResult] = await db.select({ count: count() }).from(events).where(eq(events.isActive, true));
    const [totalVouchersResult] = await db.select({ count: count() }).from(vouchers).where(eq(vouchers.isUsed, false));

    const totalDataUsage = await db.select({ total: sql<number>`SUM(${captiveUsers.dataUsed})` }).from(captiveUsers);
    const dataUsageGB = Math.round((totalDataUsage[0]?.total || 0) / 1024);

    // Get daily guest count
    const dailyGuestCount = await this.getDailyGuestCount();

    return {
      totalUsers: totalUsersResult.count,
      activeUsers: activeUsersResult.count,
      activeEvents: totalEventsResult.count,
      activeVouchers: totalVouchersResult.count,
      dataUsage: `${dataUsageGB}GB`,
      dailyGuestCount: dailyGuestCount
    };
  }

  async getDailyGuestCount(): Promise<number> {
    await this.checkAndResetDailyStats();
    const today = this.getTodayDateString();
    const [stats] = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.date, today));
    
    return stats?.guestCount || 0;
  }

  async incrementDailyGuestCount(): Promise<void> {
    await this.checkAndResetDailyStats();
    const today = this.getTodayDateString();
    
    const [existingStats] = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.date, today));

    if (existingStats) {
      await db
        .update(dailyStats)
        .set({ guestCount: existingStats.guestCount + 1 })
        .where(eq(dailyStats.date, today));
    } else {
      await db
        .insert(dailyStats)
        .values({
          date: today,
          guestCount: 1,
          lastResetAt: new Date()
        });
    }
  }

  private async checkAndResetDailyStats(): Promise<void> {
    const today = this.getTodayDateString();
    const [stats] = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.date, today));

    if (!stats || !stats.lastResetAt) {
      return;
    }

    const now = new Date();
    const lastReset = new Date(stats.lastResetAt);
    
    // Check if we need to reset (crossed 4am boundary)
    if (this.shouldResetAt4AM(lastReset, now)) {
      await db
        .update(dailyStats)
        .set({ 
          guestCount: 0,
          lastResetAt: now
        })
        .where(eq(dailyStats.date, today));
    }
  }

  private shouldResetAt4AM(lastReset: Date, now: Date): boolean {
    // Get 4am today
    const fourAMToday = new Date(now);
    fourAMToday.setHours(4, 0, 0, 0);

    // Get 4am yesterday
    const fourAMYesterday = new Date(fourAMToday);
    fourAMYesterday.setDate(fourAMYesterday.getDate() - 1);

    // If last reset was before today's 4am and now is after today's 4am
    if (lastReset < fourAMToday && now >= fourAMToday) {
      return true;
    }

    return false;
  }

  private getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  async getAllVouchers(): Promise<Voucher[]> {
    return await db.select().from(vouchers);
  }

  async createVouchers(voucherDataArray: InsertVoucher[]): Promise<Voucher[]> {
    const createdVouchers: Voucher[] = [];
    
    for (const voucherData of voucherDataArray) {
      const code = this.generateVoucherCode();
      const [voucher] = await db
        .insert(vouchers)
        .values({
          ...voucherData,
          code
        })
        .returning();
      createdVouchers.push(voucher);
    }
    
    return createdVouchers;
  }

  private generateVoucherCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEventsForDate(timezoneOffsetMinutes: number = 0, dateStr?: string): Promise<Event[]> {
    let targetDate: Date;

    if (dateStr) {
      // Parse the provided date string (YYYY-MM-DD format)
      const [year, month, day] = dateStr.split('-').map(Number);
      targetDate = new Date(year, month - 1, day);
    } else {
      // Use today's date in user's timezone
      const nowUtc = new Date();
      const userLocalTime = new Date(nowUtc.getTime() - (timezoneOffsetMinutes * 60 * 1000));
      targetDate = new Date(userLocalTime.getFullYear(), userLocalTime.getMonth(), userLocalTime.getDate());
    }

    // Get start and end of the target day
    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Convert to UTC for database comparison
    const startUtc = new Date(dayStart.getTime() + (timezoneOffsetMinutes * 60 * 1000));
    const endUtc = new Date(dayEnd.getTime() + (timezoneOffsetMinutes * 60 * 1000));

    return await db
      .select()
      .from(events)
      .where(
        // Event's start date is on the target date
        sql`${events.startDate} >= ${startUtc.toISOString()} AND ${events.startDate} < ${endUtc.toISOString()} AND ${events.isActive} = true`
      );
  }

  async createEvent(insertEvent: any): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async getActiveSessions(): Promise<any[]> {
    const activeSessions = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        startTime: sessions.startTime,
        endTime: sessions.endTime,
        ipAddress: sessions.ipAddress,
        macAddress: sessions.macAddress,
        bytesIn: sessions.bytesIn,
        bytesOut: sessions.bytesOut,
        isActive: sessions.isActive,
        user: {
          id: captiveUsers.id,
          name: captiveUsers.name,
          email: captiveUsers.email,
          role: captiveUsers.role,
          floor: captiveUsers.floor
        }
      })
      .from(sessions)
      .leftJoin(captiveUsers, eq(sessions.userId, captiveUsers.id))
      .where(eq(sessions.isActive, true));

    return activeSessions;
  }

  async getAllCaptiveUsers(): Promise<CaptiveUser[]> {
    return await db.select().from(captiveUsers).orderBy(sql`${captiveUsers.id} DESC`);
  }

  async revokeSession(sessionId: string): Promise<void> {
    await db
      .update(captiveUsers)
      .set({ isActive: false, sessionEnd: new Date() })
      .where(eq(captiveUsers.sessionId, sessionId));

    await db
      .update(sessions)
      .set({ isActive: false, endTime: new Date() })
      .where(
        and(
          eq(sessions.isActive, true),
          sql`${sessions.userId} IN (SELECT id FROM ${captiveUsers} WHERE ${captiveUsers.sessionId} = ${sessionId})`
        )
      );
  }
}

export const storage = new DatabaseStorage();
