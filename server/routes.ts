import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertCaptiveUserSchema, insertVoucherSchema, insertEventSchema } from "@shared/schema";

// Mock UniFi controller service
class UniFiService {
  async authorizeGuest(macAddress: string, duration: number, uploadLimit?: number, downloadLimit?: number, unifiParams?: any) {
    const sessionId = unifiParams?.id || `unifi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apMac = unifiParams?.ap || 'unknown';
    const ssid = unifiParams?.ssid || 'Unknown';

    console.log(`UniFi Authorization:`);
    console.log(`  Client MAC: ${macAddress}`);
    console.log(`  Session ID: ${sessionId}`);
    console.log(`  Access Point: ${apMac}`);
    console.log(`  SSID: ${ssid}`);
    console.log(`  Duration: ${duration} hours`);
    console.log(`  Upload Limit: ${uploadLimit || 'unlimited'} kbps`);
    console.log(`  Download Limit: ${downloadLimit || 'unlimited'} kbps`);

    return {
      success: true,
      sessionId: sessionId,
      message: `Guest authorized for ${duration} hours`,
      unifiData: {
        ap: apMac,
        ssid: ssid,
        clientMac: macAddress
      }
    };
  }

  async revokeGuest(sessionId: string) {
    console.log(`Mock UniFi: Revoking session ${sessionId}`);
    return { success: true, message: "Session revoked" };
  }

  async getActiveUsers() {
    return {
      success: true,
      users: [
        { sessionId: "session1", ipAddress: "192.168.1.100", macAddress: "00:11:22:33:44:55", duration: 3600 },
        { sessionId: "session2", ipAddress: "192.168.1.101", macAddress: "00:11:22:33:44:56", duration: 7200 }
      ]
    };
  }
}

const unifiService = new UniFiService();

export async function registerRoutes(app: Express): Promise<Server> {

  // UniFi captive portal status endpoint
  app.get("/guest/s/default/", (req, res) => {
    res.redirect("/");
  });

  // Handle UniFi authorization endpoint
  app.post("/guest/s/default/login", (req, res) => {
    res.redirect("/");
  });

  // Health check endpoint for UniFi
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "Frontier Tower Captive Portal",
      unifi_ready: true
    });
  });

  // Captive portal detection endpoints
  app.get("/generate_204", (req, res) => {
    res.redirect(302, "/");
  });

  app.get("/hotspot-detect.html", (req, res) => {
    res.redirect(302, "/");
  });

  app.get("/connecttest.txt", (req, res) => {
    res.redirect(302, "/");
  });

  app.get("/ncsi.txt", (req, res) => {
    res.redirect(302, "/");
  });

  // Member registration and authorization
  app.post("/api/register/member", async (req, res) => {
    try {
      const memberData = insertCaptiveUserSchema.extend({
        role: z.literal("member"),
        telegramUsername: z.string().optional(),
        floor: z.string().min(1),
        macAddress: z.string().optional(),
        unifiParams: z.object({
          id: z.string().optional(),
          ap: z.string().optional(),
          t: z.string().optional(),
          url: z.string().optional(),
          ssid: z.string().optional(),
          mac: z.string().optional(),
        }).optional(),
      }).parse(req.body);

      const clientMac = memberData.unifiParams?.mac || memberData.macAddress || "unknown";
      const user = await storage.createCaptiveUser(memberData);

      const unifiResult = await unifiService.authorizeGuest(
        clientMac,
        24,
        undefined,
        undefined,
        memberData.unifiParams
      );

      if (unifiResult.success) {
        await storage.updateCaptiveUserSession(user.id, unifiResult.sessionId);
      }

      res.json({
        success: true,
        user: user,
        session: unifiResult,
        message: "Member registered and authorized successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Guest registration and authorization
  app.post("/api/register/guest", async (req, res) => {
    try {
      const guestData = insertCaptiveUserSchema.extend({
        role: z.literal("guest"),
        name: z.string().min(1),
        telegramUsername: z.string().optional(),
        purpose: z.string().optional(),
        host: z.string().min(1),
        phone: z.string().optional(),
        macAddress: z.string().optional(),
        unifiParams: z.object({
          id: z.string().optional(),
          ap: z.string().optional(),
          t: z.string().optional(),
          url: z.string().optional(),
          ssid: z.string().optional(),
          mac: z.string().optional(),
        }).optional(),
      }).parse(req.body);

      const clientMac = guestData.unifiParams?.mac || guestData.macAddress || "unknown";
      const user = await storage.createCaptiveUser(guestData);

      // Increment daily guest count
      await storage.incrementDailyGuestCount();

      const unifiResult = await unifiService.authorizeGuest(
        clientMac,
        8,
        10240,
        10240,
        guestData.unifiParams
      );

      if (unifiResult.success) {
        await storage.updateCaptiveUserSession(user.id, unifiResult.sessionId);
      }

      res.json({
        success: true,
        user: user,
        session: unifiResult,
        message: "Guest registered and authorized successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Event registration and authorization
  app.post("/api/register/event", async (req, res) => {
    try {
      const eventData = insertCaptiveUserSchema.extend({
        role: z.literal("event"),
        name: z.string().min(1),
        telegramUsername: z.string().optional(),
        eventName: z.string().min(1),
        organization: z.string().min(1),
        registrationType: z.string().optional(),
        macAddress: z.string().optional(),
        unifiParams: z.object({
          id: z.string().optional(),
          ap: z.string().optional(),
          t: z.string().optional(),
          url: z.string().optional(),
          ssid: z.string().optional(),
          mac: z.string().optional(),
        }).optional(),
      }).parse(req.body);

      const clientMac = eventData.unifiParams?.mac || eventData.macAddress || "unknown";

      const event = await storage.getEventByName(eventData.eventName);
      if (!event || !event.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive event name"
        });
      }

      const user = await storage.createCaptiveUser(eventData);

      const unifiResult = await unifiService.authorizeGuest(
        clientMac,
        24,
        undefined,
        undefined,
        eventData.unifiParams
      );

      if (unifiResult.success) {
        await storage.updateCaptiveUserSession(user.id, unifiResult.sessionId);
        await storage.incrementEventAttendees(event.id);
      }

      res.json({
        success: true,
        user: user,
        session: unifiResult,
        event: event,
        message: "Event attendee registered and authorized successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({ success: true, stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics"
      });
    }
  });

  app.get("/api/admin/vouchers", async (req, res) => {
    try {
      const vouchers = await storage.getAllVouchers();
      res.json({ success: true, vouchers });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch vouchers"
      });
    }
  });

  app.post("/api/admin/vouchers", async (req, res) => {
    try {
      const voucherData = insertVoucherSchema.extend({
        count: z.number().min(1).max(100).optional().default(1),
      }).parse(req.body);

      const vouchers = await storage.createVouchers([voucherData]);
      res.json({
        success: true,
        vouchers,
        message: `${vouchers.length} voucher(s) created successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create vouchers"
      });
    }
  });

  app.get("/api/events/today", async (req, res) => {
    try {
      const timezoneOffset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const dateStr = req.query.date as string | undefined;
      const events = await storage.getEventsForDate(timezoneOffset, dateStr);
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events"
      });
    }
  });

  app.get("/api/admin/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch events"
      });
    }
  });

  app.post("/api/admin/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json({
        success: true,
        event,
        message: "Event created successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create event"
      });
    }
  });

  app.post("/api/admin/events/bulk-import", async (req, res) => {
    try {
      const { text } = z.object({
        text: z.string().min(10)
      }).parse(req.body);

      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an event extraction assistant. Extract event information from the provided text and return a JSON array of events. Each event should have:
- name: string (event title)
- description: string (brief description, max 200 chars)
- startDate: ISO 8601 datetime string
- endDate: ISO 8601 datetime string
- maxAttendees: number (estimate based on context, default 50)

Rules:
- Extract ALL events found in the text
- Use context clues for dates (e.g., "Tomorrow" = next day, "Nov 1" = November 1st of current/next year)
- If only start time is given, estimate endDate as 2-3 hours after start
- Generate concise, professional descriptions
- Return ONLY valid JSON array, no other text
- Current date for reference: ${new Date().toISOString()}`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
      });

      const eventsJson = completion.choices[0]?.message?.content || '[]';
      let parsedEvents;
      
      try {
        parsedEvents = JSON.parse(eventsJson);
      } catch (parseError) {
        const jsonMatch = eventsJson.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedEvents = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("AI did not return valid JSON");
        }
      }

      if (!Array.isArray(parsedEvents) || parsedEvents.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No events found in the provided text"
        });
      }

      const createdEvents = [];
      const failedEvents: Array<{ name: string; error: string }> = [];
      
      for (const eventData of parsedEvents) {
        try {
          const code = (eventData.name || 'EVENT')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 10) + new Date().getTime().toString().slice(-4);

          const newEvent = {
            name: eventData.name,
            code: code,
            description: eventData.description || '',
            startDate: new Date(eventData.startDate),
            endDate: new Date(eventData.endDate),
            maxAttendees: eventData.maxAttendees || 50,
          };

          // Validate against schema before creating
          const validatedEvent = insertEventSchema.parse(newEvent);

          // Check if dates are valid
          if (isNaN(validatedEvent.startDate.getTime()) || isNaN(validatedEvent.endDate.getTime())) {
            throw new Error('Invalid date format');
          }

          const event = await storage.createEvent(validatedEvent);
          createdEvents.push(event);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (eventError) {
          const eventName = eventData.name || 'Unknown Event';
          const errorMessage = eventError instanceof Error ? eventError.message : 'Unknown error';
          console.error(`Failed to create event: ${eventName}`, errorMessage);
          failedEvents.push({ name: eventName, error: errorMessage });
        }
      }

      // Fail if no events were successfully created
      if (createdEvents.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to import any events. All events had validation or parsing errors.",
          failedEvents
        });
      }

      // Return success with partial failure information if applicable
      const message = failedEvents.length > 0
        ? `Successfully imported ${createdEvents.length} event(s), ${failedEvents.length} failed`
        : `Successfully imported ${createdEvents.length} event(s)`;

      res.json({
        success: true,
        events: createdEvents,
        failedEvents: failedEvents.length > 0 ? failedEvents : undefined,
        message
      });
    } catch (error) {
      console.error('Error bulk importing events:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to import events"
      });
    }
  });

  app.get("/api/admin/sessions", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json({ success: true, sessions });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch active sessions"
      });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllCaptiveUsers();
      res.json({ success: true, users });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });
    }
  });

  app.delete("/api/admin/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await unifiService.revokeGuest(sessionId);
      await storage.revokeSession(sessionId);
      res.json({
        success: true,
        message: "Session revoked successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to revoke session"
      });
    }
  });

  app.get("/api/events/:code/validate", async (req, res) => {
    try {
      const { code } = req.params;
      const event = await storage.getEventByCode(code);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event code not found"
        });
      }

      if (!event.isActive) {
        return res.status(400).json({
          success: false,
          message: "Event is no longer active"
        });
      }

      res.json({
        success: true,
        event: {
          name: event.name,
          startDate: event.startDate,
          endDate: event.endDate,
          maxAttendees: event.maxAttendees,
          currentAttendees: event.currentAttendees
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to validate event code"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
