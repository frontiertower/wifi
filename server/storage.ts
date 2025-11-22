import { users, captiveUsers, events, vouchers, sessions, dailyStats, settings, bookings, directoryListings, tourBookings, eventHostBookings, membershipApplications, chatInviteRequests, privateOfficeRentals, authenticatedMembers, wifiPasswords, type User, type InsertUser, type CaptiveUser, type InsertCaptiveUser, type Event, type Voucher, type InsertVoucher, type Session, type DailyStats, type Booking, type InsertBooking, type DirectoryListing, type InsertDirectoryListing, type TourBooking, type InsertTourBooking, type EventHostBooking, type InsertEventHostBooking, type MembershipApplication, type InsertMembershipApplication, type ChatInviteRequest, type InsertChatInviteRequest, type PrivateOfficeRental, type InsertPrivateOfficeRental, type AuthenticatedMember, type WifiPassword, type InsertWifiPassword } from "@shared/schema";
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

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
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

  async getUpcomingEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.isActive, true))
      .orderBy(sql`${events.startDate} ASC`);
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

  async updateEventImage(eventId: number, imageUrl: string): Promise<void> {
    await db
      .update(events)
      .set({ imageUrl })
      .where(eq(events.id, eventId));
  }

  async deleteEventsWithoutUrls(): Promise<number> {
    const result = await db
      .delete(events)
      .where(
        sql`${events.url} IS NULL OR ${events.url} = ''`
      )
      .returning({ id: events.id });
    
    return result.length;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .update(events)
      .set({ isHidden: true })
      .where(eq(events.id, id))
      .returning();
    return result.length > 0;
  }

  async deduplicateEvents(): Promise<{ mergedCount: number; deletedCount: number }> {
    // Get all events
    const allEvents = await db.select().from(events);
    
    // Group by name (case-insensitive)
    const eventGroups = new Map<string, Event[]>();
    allEvents.forEach(event => {
      const key = event.name.trim().toLowerCase();
      if (!eventGroups.has(key)) {
        eventGroups.set(key, []);
      }
      eventGroups.get(key)!.push(event);
    });
    
    let mergedCount = 0;
    let deletedCount = 0;
    
    // Process duplicates
    for (const [_, duplicates] of Array.from(eventGroups.entries())) {
      if (duplicates.length > 1) {
        // Find Luma and Frontier Tower versions
        const lumaEvent = duplicates.find((e: Event) => e.source === 'luma');
        const ftEvent = duplicates.find((e: Event) => e.source === 'frontier-tower');
        
        // Keep the event with the best data (prefer one with both URL and description)
        const primaryEvent = lumaEvent || ftEvent || duplicates[0];
        
        // Merge data: prefer Luma for URL/imageUrl, FT for description
        const mergedData = {
          url: lumaEvent?.url || ftEvent?.url || primaryEvent.url,
          imageUrl: lumaEvent?.imageUrl || ftEvent?.imageUrl || primaryEvent.imageUrl,
          description: ftEvent?.description || lumaEvent?.description || primaryEvent.description,
        };
        
        // Update the primary event with merged data
        await db
          .update(events)
          .set(mergedData)
          .where(eq(events.id, primaryEvent.id));
        
        // Delete all duplicates except the primary
        const idsToDelete = duplicates
          .filter((e: Event) => e.id !== primaryEvent.id)
          .map((e: Event) => e.id);
        
        if (idsToDelete.length > 0) {
          for (const id of idsToDelete) {
            await db.delete(events).where(eq(events.id, id));
          }
          deletedCount += idsToDelete.length;
          mergedCount++;
        }
      }
    }
    
    return { mergedCount, deletedCount };
  }

  async upsertEventByExternalId(eventData: any): Promise<Event> {
    const updateFields: any = {
      name: eventData.name,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate,
      host: eventData.host,
      originalLocation: eventData.originalLocation,
      color: eventData.color,
      source: eventData.source,
      maxAttendees: eventData.maxAttendees,
      currentAttendees: eventData.currentAttendees,
    };
    
    if (eventData.url !== undefined) {
      updateFields.url = eventData.url;
    }
    
    const [event] = await db
      .insert(events)
      .values(eventData)
      .onConflictDoUpdate({
        target: events.externalId,
        set: updateFields
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

    // Insert or update all provided values
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== '') {
        await db
          .insert(settings)
          .values({ key, value })
          .onConflictDoUpdate({
            target: settings.key,
            set: { value, updatedAt: new Date() }
          });
      }
    }
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(sql`${bookings.createdAt} DESC`);
  }

  async getBookingById(id: number): Promise<Booking | null> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));
    return booking || null;
  }

  async createDirectoryListing(listingData: InsertDirectoryListing): Promise<DirectoryListing> {
    const [listing] = await db
      .insert(directoryListings)
      .values(listingData)
      .returning();
    return listing;
  }

  async getAllDirectoryListings(): Promise<DirectoryListing[]> {
    return await db.select().from(directoryListings).orderBy(sql`${directoryListings.companyName} ASC`);
  }

  async getDirectoryListingById(id: number): Promise<DirectoryListing | null> {
    const [listing] = await db
      .select()
      .from(directoryListings)
      .where(eq(directoryListings.id, id));
    return listing || null;
  }

  async updateDirectoryListing(id: number, listingData: Partial<InsertDirectoryListing>): Promise<DirectoryListing | null> {
    const [listing] = await db
      .update(directoryListings)
      .set(listingData)
      .where(eq(directoryListings.id, id))
      .returning();
    return listing || null;
  }

  async deleteDirectoryListing(id: number): Promise<boolean> {
    const result = await db
      .delete(directoryListings)
      .where(eq(directoryListings.id, id))
      .returning();
    return result.length > 0;
  }

  async createTourBooking(bookingData: InsertTourBooking): Promise<TourBooking> {
    const [booking] = await db
      .insert(tourBookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getAllTourBookings(): Promise<TourBooking[]> {
    return await db.select().from(tourBookings).orderBy(sql`${tourBookings.createdAt} DESC`);
  }

  async getTourBookingById(id: number): Promise<TourBooking | null> {
    const [booking] = await db
      .select()
      .from(tourBookings)
      .where(eq(tourBookings.id, id));
    return booking || null;
  }

  async createEventHostBooking(bookingData: InsertEventHostBooking): Promise<EventHostBooking> {
    const [booking] = await db
      .insert(eventHostBookings)
      .values(bookingData)
      .returning();
    return booking;
  }

  async getAllEventHostBookings(): Promise<EventHostBooking[]> {
    return await db.select().from(eventHostBookings).orderBy(sql`${eventHostBookings.createdAt} DESC`);
  }

  async getEventHostBookingById(id: number): Promise<EventHostBooking | null> {
    const [booking] = await db
      .select()
      .from(eventHostBookings)
      .where(eq(eventHostBookings.id, id));
    return booking || null;
  }

  async createMembershipApplication(applicationData: InsertMembershipApplication): Promise<MembershipApplication> {
    const [application] = await db
      .insert(membershipApplications)
      .values(applicationData)
      .returning();
    return application;
  }

  async getAllMembershipApplications(): Promise<MembershipApplication[]> {
    return await db.select().from(membershipApplications).orderBy(sql`${membershipApplications.createdAt} DESC`);
  }

  async getMembershipApplicationById(id: number): Promise<MembershipApplication | null> {
    const [application] = await db
      .select()
      .from(membershipApplications)
      .where(eq(membershipApplications.id, id));
    return application || null;
  }

  async createChatInviteRequest(requestData: InsertChatInviteRequest): Promise<ChatInviteRequest> {
    const [request] = await db
      .insert(chatInviteRequests)
      .values(requestData)
      .returning();
    return request;
  }

  async getAllChatInviteRequests(): Promise<ChatInviteRequest[]> {
    return await db.select().from(chatInviteRequests).orderBy(sql`${chatInviteRequests.createdAt} DESC`);
  }

  async getChatInviteRequestById(id: number): Promise<ChatInviteRequest | null> {
    const [request] = await db
      .select()
      .from(chatInviteRequests)
      .where(eq(chatInviteRequests.id, id));
    return request || null;
  }

  async createPrivateOfficeRental(rentalData: InsertPrivateOfficeRental): Promise<PrivateOfficeRental> {
    const [rental] = await db
      .insert(privateOfficeRentals)
      .values(rentalData)
      .returning();
    return rental;
  }

  async getAllPrivateOfficeRentals(): Promise<PrivateOfficeRental[]> {
    return await db.select().from(privateOfficeRentals).orderBy(sql`${privateOfficeRentals.createdAt} DESC`);
  }

  async getPrivateOfficeRentalById(id: number): Promise<PrivateOfficeRental | null> {
    const [rental] = await db
      .select()
      .from(privateOfficeRentals)
      .where(eq(privateOfficeRentals.id, id));
    return rental || null;
  }

  // OAuth Authentication Methods
  
  async saveOAuthSession(cookieId: string, data: { codeVerifier: string; csrfToken: string }): Promise<void> {
    // Only update transient PKCE/CSRF fields without overwriting existing tokens
    const existing = await this.getAuthenticatedMember(cookieId);
    
    if (existing) {
      await db
        .update(authenticatedMembers)
        .set({
          codeVerifier: data.codeVerifier,
          csrfToken: data.csrfToken,
          updatedAt: new Date(),
        })
        .where(eq(authenticatedMembers.cookieId, cookieId));
    } else {
      await db
        .insert(authenticatedMembers)
        .values({
          cookieId,
          codeVerifier: data.codeVerifier,
          csrfToken: data.csrfToken,
        });
    }
  }

  async getOAuthSession(cookieId: string): Promise<AuthenticatedMember | null> {
    const [session] = await db
      .select()
      .from(authenticatedMembers)
      .where(eq(authenticatedMembers.cookieId, cookieId));
    return session || null;
  }

  async saveOAuthTokens(
    cookieId: string,
    data: {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresAt: Date;
      ftUserId: string;
      userInfo: any;
    }
  ): Promise<void> {
    await db
      .update(authenticatedMembers)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
        ftUserId: data.ftUserId,
        userInfo: data.userInfo,
        codeVerifier: null,  // Clear PKCE data after successful auth
        csrfToken: null,
        updatedAt: new Date(),
      })
      .where(eq(authenticatedMembers.cookieId, cookieId));
  }

  async getAuthenticatedMember(cookieId: string): Promise<AuthenticatedMember | null> {
    const [member] = await db
      .select()
      .from(authenticatedMembers)
      .where(eq(authenticatedMembers.cookieId, cookieId));
    return member || null;
  }

  async updateOAuthTokens(
    cookieId: string,
    data: {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresAt: Date;
    }
  ): Promise<void> {
    await db
      .update(authenticatedMembers)
      .set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        tokenType: data.tokenType,
        expiresAt: data.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(authenticatedMembers.cookieId, cookieId));
  }

  async deleteOAuthSession(cookieId: string): Promise<void> {
    await db
      .delete(authenticatedMembers)
      .where(eq(authenticatedMembers.cookieId, cookieId));
  }

  async getAllWifiPasswords(): Promise<WifiPassword[]> {
    return await db
      .select()
      .from(wifiPasswords)
      .where(eq(wifiPasswords.isActive, true))
      .orderBy(sql`${wifiPasswords.createdAt} ASC`);
  }

  async addWifiPassword(password: string, description?: string): Promise<WifiPassword> {
    const [newPassword] = await db
      .insert(wifiPasswords)
      .values({
        password: password.trim(),
        description,
        isActive: true,
      })
      .returning();
    return newPassword;
  }

  async deleteWifiPassword(id: number): Promise<void> {
    await db
      .delete(wifiPasswords)
      .where(eq(wifiPasswords.id, id));
  }

  async ensureDefaultWifiPasswords(): Promise<void> {
    const existingPasswords = await this.getAllWifiPasswords();
    
    if (existingPasswords.length === 0) {
      const defaultPasswords = [
        { password: "welovexeno", description: "Default password 1" },
        { password: "makesomething", description: "Default password 2" },
        { password: "frontiertower995", description: "Default password 3" },
      ];

      for (const pwd of defaultPasswords) {
        try {
          await this.addWifiPassword(pwd.password, pwd.description);
        } catch (error) {
          console.error(`Failed to add default password ${pwd.password}:`, error);
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
