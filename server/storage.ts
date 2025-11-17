import { users, captiveUsers, events, vouchers, sessions, dailyStats, settings, type User, type InsertUser, type CaptiveUser, type InsertCaptiveUser, type Event, type Voucher, type InsertVoucher, type Session, type DailyStats } from "@shared/schema";
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
    
    // Count members registered after 4am today (or after 4am yesterday if before 4am now)
    const [membersToday] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(
        and(
          eq(captiveUsers.role, "member"),
          sql`${captiveUsers.createdAt} >= CASE 
            WHEN EXTRACT(HOUR FROM NOW()) >= 4 
            THEN CURRENT_DATE + INTERVAL '4 hours'
            ELSE CURRENT_DATE - INTERVAL '1 day' + INTERVAL '4 hours'
          END`
        )
      );
    
    // Count only events starting today (where start_date is today)
    const [eventsToday] = await db.select({ count: count() })
      .from(events)
      .where(
        and(
          eq(events.isActive, true),
          sql`DATE(${events.startDate}) = CURRENT_DATE`
        )
      );
    
    const [totalVouchersResult] = await db.select({ count: count() }).from(vouchers).where(eq(vouchers.isUsed, false));

    const totalDataUsage = await db.select({ total: sql<number>`SUM(${captiveUsers.dataUsed})` }).from(captiveUsers);
    const dataUsageGB = Math.round((totalDataUsage[0]?.total || 0) / 1024);

    // Count guests registered after 4am today (same logic as users today)
    const [guestsTodayResult] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(
        and(
          eq(captiveUsers.role, "guest"),
          sql`${captiveUsers.createdAt} >= CASE 
            WHEN EXTRACT(HOUR FROM NOW()) >= 4 
            THEN CURRENT_DATE + INTERVAL '4 hours'
            ELSE CURRENT_DATE - INTERVAL '1 day' + INTERVAL '4 hours'
          END`
        )
      );

    // Count event guests registered after 4am today (same logic as users today)
    const [eventGuestsTodayResult] = await db.select({ count: count() })
      .from(captiveUsers)
      .where(
        and(
          eq(captiveUsers.role, "event"),
          sql`${captiveUsers.createdAt} >= CASE 
            WHEN EXTRACT(HOUR FROM NOW()) >= 4 
            THEN CURRENT_DATE + INTERVAL '4 hours'
            ELSE CURRENT_DATE - INTERVAL '1 day' + INTERVAL '4 hours'
          END`
        )
      );

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
      membersToday: membersToday.count,
      eventsToday: eventsToday.count,
      activeVouchers: totalVouchersResult.count,
      dataUsage: `${dataUsageGB}GB`,
      guestsToday: guestsTodayResult.count,
      eventGuestsToday: eventGuestsTodayResult.count,
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

  async getFloorStats(): Promise<Record<string, { count: number; names: string[] }>> {
    // Get users who registered after 4am today (same logic as daily counters)
    const allUsers = await db.select({
      role: captiveUsers.role,
      floor: captiveUsers.floor,
      name: captiveUsers.name
    })
    .from(captiveUsers)
    .where(sql`${captiveUsers.createdAt} >= CASE 
      WHEN EXTRACT(HOUR FROM NOW()) >= 4 
      THEN CURRENT_DATE + INTERVAL '4 hours'
      ELSE CURRENT_DATE - INTERVAL '1 day' + INTERVAL '4 hours'
    END`);

    // Initialize floor data for all floors 2-16 (skipping only 13)
    const floorData: Record<string, { count: number; names: string[] }> = {};
    const floors = ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '14', '15', '16'];
    floors.forEach(floor => floorData[floor] = { count: 0, names: [] });
    floorData['unknown'] = { count: 0, names: [] };

    // Organize users per floor based on their role
    const usersByFloor: Record<string, string[]> = {};
    floors.forEach(floor => usersByFloor[floor] = []);
    usersByFloor['unknown'] = [];

    allUsers.forEach(user => {
      // Extract first name from full name
      const fullName = user.name || 'Unknown';
      const firstName = fullName.split(' ')[0];
      
      if (user.role === 'event') {
        // Event users go to 2nd floor
        usersByFloor['2'].push(firstName);
      } else if (user.role === 'guest') {
        // Guest users go to 16th floor
        usersByFloor['16'].push(firstName);
      } else if (user.role === 'member') {
        // Member users go to their selected floor
        const memberFloor = user.floor || 'unknown';
        if (floors.includes(memberFloor)) {
          usersByFloor[memberFloor].push(firstName);
        } else {
          usersByFloor['unknown'].push(firstName);
        }
      }
    });

    // Populate floor data with counts and limited names (max 5)
    Object.keys(usersByFloor).forEach(floor => {
      floorData[floor] = {
        count: usersByFloor[floor].length,
        names: usersByFloor[floor].slice(0, 5) // Limit to 5 names
      };
    });

    return floorData;
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

  async upsertEventByExternalId(eventData: any): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .onConflictDoUpdate({
        target: events.externalId,
        set: {
          name: eventData.name,
          description: eventData.description,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          host: eventData.host,
          originalLocation: eventData.originalLocation,
          color: eventData.color,
          source: eventData.source,
          maxAttendees: eventData.maxAttendees,
        }
      })
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

  async getSettings(): Promise<Record<string, string>> {
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value || '';
    }
    return settingsMap;
  }

  async saveSettings(data: Record<string, string | undefined>): Promise<void> {
    // Always clear all UniFi settings first to prevent mode switching issues
    const allUnifiKeys = [
      'unifi_api_type',
      'unifi_controller_url',
      'unifi_api_key',
      'unifi_username',
      'unifi_password',
      'unifi_site'
    ];

    // Delete all existing UniFi settings
    for (const key of allUnifiKeys) {
      await db.delete(settings).where(eq(settings.key, key));
    }

    // Insert only the provided values
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        await db
          .insert(settings)
          .values({ key, value });
      }
    }
  }
}

export const storage = new DatabaseStorage();
