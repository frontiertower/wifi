import { users, captiveUsers, events, type User, type InsertUser, type CaptiveUser, type InsertCaptiveUser, type Event } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
    // Mock implementation for now
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalEvents: 0,
      totalVouchers: 0
    };
  }

  async getAllVouchers(): Promise<any[]> {
    // Mock implementation for now
    return [];
  }

  async createVouchers(vouchers: any[]): Promise<any[]> {
    // Mock implementation for now
    return [];
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
    // Mock implementation for now
    return [];
  }

  async revokeSession(sessionId: string): Promise<void> {
    // Mock implementation for now
  }
}

export const storage = new DatabaseStorage();
