import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertCaptiveUserSchema, insertVoucherSchema, insertEventSchema } from "@shared/schema";
import fetch from "node-fetch";
import https from "https";

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

  // UniFi Guest Authorization Endpoint
  // This endpoint is called by the frontend after registration to grant internet access
  // Supports both Modern API (9.1.105+) and Legacy API
  app.post("/api/authorize-guest", async (req, res) => {
    try {
      const schema = z.object({
        acceptTou: z.literal("true"),
        accessPointMacAddress: z.string(),
        macAddress: z.string(),
        email: z.string().email().optional(),
        browser: z.string().optional(),
        operatingSystem: z.string().optional(),
        ipAddress: z.string().optional(),
      });

      const data = schema.parse(req.body);

      // Get settings from database (fallback to env vars for backwards compatibility)
      const dbSettings = await storage.getSettings();
      const apiType = dbSettings.unifi_api_type || (process.env.UNIFI_API_KEY ? 'modern' : process.env.UNIFI_USERNAME ? 'legacy' : 'none');
      const controllerUrl = dbSettings.unifi_controller_url || process.env.UNIFI_CONTROLLER_URL;
      const apiKey = dbSettings.unifi_api_key || process.env.UNIFI_API_KEY;
      const username = dbSettings.unifi_username || process.env.UNIFI_USERNAME;
      const password = dbSettings.unifi_password || process.env.UNIFI_PASSWORD;
      const siteId = dbSettings.unifi_site || process.env.UNIFI_SITE || "default";

      console.log('UniFi Authorization Request:', {
        macAddress: data.macAddress,
        accessPoint: data.accessPointMacAddress,
        controllerConfigured: !!controllerUrl,
        apiType: apiType
      });

      // If UniFi controller not configured or set to none, return mock success
      if (!controllerUrl || apiType === 'none') {
        console.warn('⚠️  UniFi controller not configured - returning mock authorization');
        return res.json({
          response: 200,
          description: "200 OK (Mock Mode)",
          payload: {
            macAddress: data.macAddress,
            minutesLeft: 1440,
            secondsLeft: 59,
            expireOn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date().toISOString(),
            valid: true
          }
        });
      }

      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      const macNormalized = data.macAddress.toUpperCase().replace(/-/g, ':');

      // Modern API (Network Application 9.1.105+)
      if (apiType === 'modern' && apiKey) {
        console.log('Using Modern UniFi API (9.1.105+)');

        // Step 1: Get client by MAC address
        const clientsResponse = await fetch(
          `${controllerUrl}/v1/sites/${siteId}/clients?filter=macAddress.eq('${macNormalized}')`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            agent: httpsAgent
          }
        );

        if (!clientsResponse.ok) {
          throw new Error(`Failed to get client: ${clientsResponse.status}`);
        }

        const clients = await clientsResponse.json() as any[];
        
        if (!clients || clients.length === 0) {
          console.warn('⚠️ Client not found, may not be connected yet');
          return res.status(404).json({
            response: 404,
            description: "Client not found",
            message: "Client not connected to network"
          });
        }

        const client = clients[0];
        const clientId = client.id;

        // Step 2: Authorize the client
        const authResponse = await fetch(
          `${controllerUrl}/v1/sites/${siteId}/clients/${clientId}/actions`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              action: "AUTHORIZE_GUEST_ACCESS",
              timeLimitMinutes: 1440, // 24 hours
            }),
            agent: httpsAgent
          }
        );

        if (!authResponse.ok) {
          throw new Error(`Authorization failed: ${authResponse.status}`);
        }

        console.log('✓ Guest authorized successfully (Modern API)');
        return res.json({
          response: 200,
          description: "200 OK",
          payload: {
            macAddress: data.macAddress,
            minutesLeft: 1440,
            secondsLeft: 59,
            expireOn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date().toISOString(),
            valid: true
          }
        });
      }

      // Legacy API (older controllers)
      if (apiType === 'legacy' && username && password) {
        console.log('Using Legacy UniFi API');

        // Step 1: Login
        const loginResponse = await fetch(`${controllerUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          agent: httpsAgent
        });

        if (!loginResponse.ok) {
          throw new Error('Failed to authenticate with UniFi controller');
        }

        const setCookies = loginResponse.headers.raw()['set-cookie'] || [];
        const cookies = setCookies.join('; ');

        // Step 2: Authorize guest
        const macLower = data.macAddress.toLowerCase().replace(/-/g, ':');
        const authPayload: any = {
          cmd: 'authorize-guest',
          mac: macLower,
          minutes: 1440,
        };

        if (data.accessPointMacAddress && data.accessPointMacAddress !== 'unknown') {
          authPayload.ap_mac = data.accessPointMacAddress;
        }

        const authResponse = await fetch(`${controllerUrl}/api/s/${siteId}/cmd/stamgr`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies
          },
          body: JSON.stringify(authPayload),
          agent: httpsAgent
        });

        const authData: any = await authResponse.json();

        if (authData.meta?.rc === 'ok') {
          console.log('✓ Guest authorized successfully (Legacy API)');
          return res.json({
            response: 200,
            description: "200 OK",
            payload: {
              macAddress: data.macAddress,
              minutesLeft: 1440,
              secondsLeft: 59,
              expireOn: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              lastLogin: new Date().toISOString(),
              valid: true
            }
          });
        }

        throw new Error(authData.meta?.msg || 'Authorization failed');
      }

      // No credentials configured
      throw new Error('UniFi credentials not configured');

    } catch (error) {
      console.error('✗ Authorization error:', error instanceof Error ? error.message : error);
      return res.status(500).json({
        response: 500,
        description: "Internal Server Error",
        message: error instanceof Error ? error.message : "Authorization failed"
      });
    }
  });

  // Member registration
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

      const user = await storage.createCaptiveUser(memberData);

      res.json({
        success: true,
        user: user,
        message: "Member registered successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Guest registration
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

      const user = await storage.createCaptiveUser(guestData);

      // Increment daily guest count
      await storage.incrementDailyGuestCount();

      res.json({
        success: true,
        user: user,
        message: "Guest registered successfully"
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });

  // Event registration
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

      const event = await storage.getEventByName(eventData.eventName);
      if (!event || !event.isActive) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive event name"
        });
      }

      const user = await storage.createCaptiveUser(eventData);
      await storage.incrementEventAttendees(event.id);

      res.json({
        success: true,
        user: user,
        event: event,
        message: "Event attendee registered successfully"
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

  app.get("/api/admin/floor-stats", async (req, res) => {
    try {
      const floorStats = await storage.getFloorStats();
      res.json({ success: true, floorStats });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch floor statistics"
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

  // Settings endpoints
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch settings"
      });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const baseSchema = z.object({
        unifi_api_type: z.enum(['modern', 'legacy', 'none']),
        unifi_controller_url: z.string().optional(),
        unifi_api_key: z.string().optional(),
        unifi_username: z.string().optional(),
        unifi_password: z.string().optional(),
        unifi_site: z.string().optional(),
      });

      const data = baseSchema.parse(req.body);

      // Validate required fields based on API type
      if (data.unifi_api_type === 'modern') {
        if (!data.unifi_controller_url || !data.unifi_api_key) {
          return res.status(400).json({
            success: false,
            message: "Modern API requires Controller URL and API Key"
          });
        }
      } else if (data.unifi_api_type === 'legacy') {
        if (!data.unifi_controller_url || !data.unifi_username || !data.unifi_password) {
          return res.status(400).json({
            success: false,
            message: "Legacy API requires Controller URL, Username, and Password"
          });
        }
      }

      await storage.saveSettings(data);

      res.json({
        success: true,
        message: "Settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid settings data",
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to save settings"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
