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
    
    // Count users registered today
    const [usersToday] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(sql`DATE(${captiveUsers.createdAt}) = CURRENT_DATE`);
    
    // Count only events happening today (where today falls within start_date and end_date range)
    const [eventsToday] = await db.select({ count: count() })
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          sql`CURRENT_DATE >= DATE(${events.startDate})`,
          sql`CURRENT_DATE <= DATE(${events.endDate})`
        )
      );
    
    const [totalVouchersResult] = await db.select({ count: count() }).from(vouchers).where(eq(vouchers.isUsed, false));

    const totalDataUsage = await db.select({ total: sql<number>`SUM(${captiveUsers.dataUsed})` }).from(captiveUsers);
    const dataUsageGB = Math.round((totalDataUsage[0]?.total || 0) / 1024);

    // Get daily guest count (guests registered today)
    const dailyGuestCount = await this.getDailyGuestCount();

    // Analytics totals
    const [totalMembers] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(eq(captiveUsers.role, "member"));
    
    const [totalGuests] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(eq(captiveUsers.role, "guest"));
    
    const [totalEventUsers] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(eq(captiveUsers.role, "event"));
    
    const [totalEventsResult] = await db.select({ count: count() }).from(events);

    return {
      totalUsers: totalUsersResult.count,
      usersToday: usersToday.count,
      eventsToday: eventsToday.count,
      activeVouchers: totalVouchersResult.count,
      dataUsage: `${dataUsageGB}GB`,
      guestsToday: dailyGuestCount,
      // Analytics
      totalMembers: totalMembers.count,
      totalGuests: totalGuests.count,
      totalEventUsers: totalEventUsers.count,
      totalEvents: totalEventsResult.count
    };
  }

  async getDailyGuestCount(): Promise<number> {
    const today = this.getTodayDateString();
    const [stats] = await db
      .select()
      .from(dailyStats)
      .where(eq(dailyStats.date, today));
    
    return stats?.guestCount || 0;
  }

  async getFloorStats(): Promise<Record<string, number>> {
    // Get all users
    const allUsers = await db.select({
      role: captiveUsers.role,
      floor: captiveUsers.floor
    }).from(captiveUsers);

    // Initialize floor counts for all floors 2-16 (skipping only 13)
    const floorCounts: Record<string, number> = {};
    const floors = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15', '16'];
    floors.forEach(floor => floorCounts[floor] = 0);
    floorCounts['unknown'] = 0;

    // Count users per floor based on their role
    allUsers.forEach(user => {
      if (user.role === 'event') {
        // Event users go to 2nd floor
        floorCounts['2'] = (floorCounts['2'] || 0) + 1;
      } else if (user.role === 'guest') {
        // Guest users go to 16th floor
        floorCounts['16'] = (floorCounts['16'] || 0) + 1;
      } else if (user.role === 'member') {
        // Member users go to their selected floor
        const memberFloor = user.floor || 'unknown';
        if (floors.includes(memberFloor)) {
          floorCounts[memberFloor] = (floorCounts[memberFloor] || 0) + 1;
        } else {
          floorCounts['unknown'] = (floorCounts['unknown'] || 0) + 1;
        }
      }
    });

    return floorCounts;
  }

  async incrementDailyGuestCount(): Promise<void> {
    const today = this.getTodayDateString();
    const now = new Date();
    
    // Atomic upsert: insert new row or increment existing count
    // This handles both first-of-day registration and concurrent increments safely
    await db.execute(sql`
      INSERT INTO daily_stats (date, guest_count, last_reset_at, created_at)
      VALUES (${today}, 1, ${now.toISOString()}, ${now.toISOString()})
      ON CONFLICT (date) DO UPDATE SET
        guest_count = CASE
          WHEN daily_stats.last_reset_at < (CURRENT_DATE + INTERVAL '4 hours')
               AND NOW() >= (CURRENT_DATE + INTERVAL '4 hours')
          THEN 1
          ELSE daily_stats.guest_count + 1
        END,
        last_reset_at = CASE
          WHEN daily_stats.last_reset_at < (CURRENT_DATE + INTERVAL '4 hours')
               AND NOW() >= (CURRENT_DATE + INTERVAL '4 hours')
          THEN NOW()
          ELSE daily_stats.last_reset_at
        END
    `);
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
