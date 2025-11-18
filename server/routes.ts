import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertCaptiveUserSchema, insertVoucherSchema, insertEventSchema, insertBookingSchema } from "@shared/schema";
import fetch from "node-fetch";
import https from "https";
import { SiweMessage } from "siwe";
import { randomBytes } from "crypto";

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

        // Step 1: Login - try legacy endpoint first, then newer endpoint
        let loginResponse = await fetch(`${controllerUrl}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
          agent: httpsAgent
        });

        // Fallback to newer auth endpoint if legacy login fails
        if (!loginResponse.ok) {
          console.log('Legacy login failed, trying newer auth endpoint...');
          loginResponse = await fetch(`${controllerUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, remember: true }),
            agent: httpsAgent
          });

          if (!loginResponse.ok) {
            throw new Error('Failed to authenticate with UniFi controller');
          }
        }

        const setCookies = loginResponse.headers.raw()['set-cookie'] || [];
        const cookies = setCookies.join('; ');

        // Extract CSRF token if present (newer controllers)
        let csrfToken = '';
        for (const cookie of setCookies) {
          const match = cookie.match(/csrf_token=([^;]+)/);
          if (match) {
            csrfToken = match[1];
            console.log('CSRF token detected, will include in requests');
            break;
          }
        }

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

        // Try classic path first, then UniFi OS path
        const authPaths = [
          `${controllerUrl}/api/s/${siteId}/cmd/stamgr`,
          `${controllerUrl}/proxy/network/api/s/${siteId}/cmd/stamgr`
        ];

        let authSuccess = false;
        let authData: any = null;

        for (const authPath of authPaths) {
          const headers: any = {
            'Content-Type': 'application/json',
            'Cookie': cookies
          };

          // Add CSRF token header if present
          if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
          }

          try {
            const authResponse = await fetch(authPath, {
              method: 'POST',
              headers,
              body: JSON.stringify(authPayload),
              agent: httpsAgent
            });

            authData = await authResponse.json();

            if (authData.meta?.rc === 'ok') {
              console.log(`✓ Guest authorized successfully using ${authPath.includes('proxy') ? 'UniFi OS' : 'classic'} path`);
              authSuccess = true;
              break;
            }
          } catch (error) {
            console.log(`Failed to authorize using ${authPath}, trying next...`);
            continue;
          }
        }

        if (authSuccess) {
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

        throw new Error(authData?.meta?.msg || 'Authorization failed on all paths');
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

  // Verify guest password
  app.post("/api/verify-guest-password", async (req, res) => {
    try {
      const schema = z.object({
        password: z.string().min(1),
      });

      const { password } = schema.parse(req.body);
      const settings = await storage.getSettings();
      const storedPassword = settings.guest_password || "makesomething";

      if (password === storedPassword) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Incorrect password" });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to verify password"
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
        tourInterest: z.enum(["yes", "maybe", "no"]).optional(),
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

      // Check if event exists in database
      const event = await storage.getEventByName(eventData.eventName);
      
      // Allow custom events (not in database) or active database events
      if (event && !event.isActive) {
        return res.status(400).json({
          success: false,
          message: "Event is no longer active"
        });
      }

      const user = await storage.createCaptiveUser(eventData);
      
      // Only increment attendees if this is a database event
      if (event) {
        await storage.incrementEventAttendees(event.id);
      }

      res.json({
        success: true,
        user: user,
        event: event || { name: eventData.eventName, isCustom: true },
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

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getUpcomingEvents();
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

  app.post("/api/admin/events/sync", async (req, res) => {
    const externalEventSchema = z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional().default(''),
      startsAt: z.string(),
      endsAt: z.string(),
      host: z.string().optional(),
      location: z.string().optional(),
      originalLocation: z.string().optional(),
      color: z.string().optional(),
      url: z.string().optional(),
      source: z.string().optional().default('external'),
    });

    try {
      const externalApiUrl = "https://studio--frontier-tower-timeline.us-central1.hosted.app/api/events";
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      let response;
      try {
        response = await fetch(externalApiUrl, { 
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error("External API request timed out after 10 seconds");
        }
        throw new Error(`Failed to connect to external API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
      }

      if (!response.ok) {
        throw new Error(`External API returned status ${response.status}`);
      }

      let rawData;
      try {
        rawData = await response.json();
      } catch (parseError) {
        throw new Error("Failed to parse external API response as JSON");
      }

      if (!Array.isArray(rawData)) {
        throw new Error("External API did not return an array");
      }

      const syncedEvents = [];
      const failedEvents: Array<{ id: string; error: string }> = [];

      for (const rawEvent of rawData) {
        try {
          const externalEvent = externalEventSchema.parse(rawEvent);
          
          const code = externalEvent.id
            .replace(/[^A-Za-z0-9]/g, '')
            .substring(0, 20)
            .toUpperCase();

          const startDate = new Date(externalEvent.startsAt);
          const endDate = new Date(externalEvent.endsAt);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Invalid dates for event ${externalEvent.id}: startsAt=${externalEvent.startsAt}, endsAt=${externalEvent.endsAt}`);
            throw new Error('Invalid date format');
          }

          const eventData: any = {
            name: externalEvent.name,
            code: code,
            description: externalEvent.description,
            startDate,
            endDate,
            host: externalEvent.host || null,
            originalLocation: externalEvent.originalLocation || externalEvent.location || null,
            color: externalEvent.color || null,
            externalId: externalEvent.id,
            source: externalEvent.source,
            maxAttendees: 100,
          };
          
          if (externalEvent.url) {
            eventData.url = externalEvent.url;
          }

          const event = await storage.upsertEventByExternalId(eventData);
          syncedEvents.push(event);
        } catch (eventError) {
          const eventId = typeof rawEvent === 'object' && rawEvent && 'id' in rawEvent ? String(rawEvent.id) : 'Unknown ID';
          const errorMessage = eventError instanceof Error ? eventError.message : 'Unknown error';
          console.error(`Failed to sync event ${eventId}:`, errorMessage, rawEvent);
          failedEvents.push({ id: eventId, error: errorMessage });
        }
      }

      if (syncedEvents.length === 0 && failedEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Failed to sync any events",
          failedEvents
        });
      }

      const message = failedEvents.length > 0
        ? `Successfully synced ${syncedEvents.length} event(s), ${failedEvents.length} failed`
        : `Successfully synced ${syncedEvents.length} event(s)`;

      console.log(`Event sync completed: ${syncedEvents.length} synced, ${failedEvents.length} failed`);
      
      res.json({
        success: true,
        events: syncedEvents,
        failedEvents: failedEvents.length > 0 ? failedEvents : undefined,
        message
      });
    } catch (error) {
      console.error('Error syncing events:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync events from external feed";
      res.status(500).json({
        success: false,
        message: errorMessage
      });
    }
  });

  // Scrape event images from Luma URLs
  app.post("/api/admin/events/scrape-images", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const now = new Date();
      
      // Filter for future events with URLs
      const eventsWithUrls = events.filter(event => 
        event.url && 
        new Date(event.endDate) >= now
      );
      
      if (eventsWithUrls.length === 0) {
        return res.json({
          success: true,
          message: "No future events with URLs to scrape",
          scrapedCount: 0,
          failedCount: 0
        });
      }

      const { load } = await import('cheerio');
      const scrapedImages = [];
      const failedScrapes: Array<{ id: number; name: string; error: string }> = [];

      // Process all future events (remove the 10 event limit for this operation)
      const eventsToScrape = eventsWithUrls;
      console.log(`Starting image scrape for ${eventsToScrape.length} future events`);

      for (const event of eventsToScrape) {
        try {
          const lumaUrl = `https://lu.ma/${event.url}`;
          console.log(`Scraping image for event: ${event.name} from ${lumaUrl}`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);

          let response;
          try {
            response = await fetch(lumaUrl, {
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            clearTimeout(timeout);
          } catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              throw new Error("Request timed out");
            }
            throw new Error(`Fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
          }

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const html = await response.text();
          const $ = load(html);
          
          // Try multiple selectors to find the event image
          let imageUrl = null;
          
          // Try Open Graph image
          imageUrl = $('meta[property="og:image"]').attr('content');
          
          // Try Twitter image
          if (!imageUrl) {
            imageUrl = $('meta[name="twitter:image"]').attr('content');
          }
          
          // Try main event image
          if (!imageUrl) {
            imageUrl = $('img[class*="event"]').first().attr('src');
          }
          
          // Try any image with event-related class or in hero section
          if (!imageUrl) {
            imageUrl = $('img[class*="hero"], img[class*="cover"]').first().attr('src');
          }

          if (imageUrl) {
            // Ensure it's a full URL
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = 'https://lu.ma' + imageUrl;
            }
            
            // Update event with image URL
            await storage.updateEventImage(event.id, imageUrl);
            scrapedImages.push({
              id: event.id,
              name: event.name,
              imageUrl
            });
            console.log(`✓ Found image for "${event.name}": ${imageUrl.substring(0, 80)}...`);
          } else {
            throw new Error("No image found in HTML");
          }
          
          // Longer delay to avoid rate limiting (2 seconds between requests)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (scrapeError) {
          const errorMessage = scrapeError instanceof Error ? scrapeError.message : 'Unknown error';
          console.error(`Failed to scrape image for "${event.name}":`, errorMessage);
          failedScrapes.push({
            id: event.id,
            name: event.name,
            error: errorMessage
          });
          // Small delay even on error
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const message = failedScrapes.length > 0
        ? `Scraped ${scrapedImages.length} image(s), ${failedScrapes.length} failed`
        : `Successfully scraped ${scrapedImages.length} image(s)`;

      console.log(`Image scraping completed: ${scrapedImages.length} succeeded, ${failedScrapes.length} failed`);

      res.json({
        success: true,
        scrapedCount: scrapedImages.length,
        failedCount: failedScrapes.length,
        scrapedImages,
        failedScrapes: failedScrapes.length > 0 ? failedScrapes : undefined,
        message
      });
    } catch (error) {
      console.error('Error scraping event images:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to scrape event images"
      });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      let bookingData = req.body;
      
      // If eventId is provided, populate event details from the selected event
      if (bookingData.eventId) {
        const event = await storage.getEventById(bookingData.eventId);
        if (!event) {
          return res.status(404).json({
            success: false,
            message: "Selected event not found"
          });
        }
        
        // Use event details to populate booking before validation
        bookingData = {
          ...bookingData,
          eventName: event.name,
          eventDescription: event.description || "",
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.originalLocation || "Frontier Tower"
        };
      }
      
      // Validate after enrichment
      const validatedData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedData);
      res.json({ success: true, booking });
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking data",
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: "Failed to create booking"
      });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bookings"
      });
    }
  });

  // Directory Listings Routes
  app.get("/api/directory", async (req, res) => {
    try {
      const listings = await storage.getAllDirectoryListings();
      res.json({ success: true, listings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch directory listings"
      });
    }
  });

  app.post("/api/directory", async (req, res) => {
    try {
      const data = req.body;
      
      // Validate that company listings have companyName
      if (data.type === "company" && !data.companyName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Company name is required for company listings"
        });
      }
      
      // Validate that person listings have firstName and lastName
      if (data.type === "person" && (!data.firstName?.trim() || !data.lastName?.trim())) {
        return res.status(400).json({
          success: false,
          message: "First name and last name are required for person listings"
        });
      }
      
      const listing = await storage.createDirectoryListing(data);
      res.json({ success: true, listing });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create directory listing"
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

  // Export users as CSV
  app.get("/api/admin/users/export", async (req, res) => {
    try {
      const users = await storage.getAllCaptiveUsers();
      
      // CSV headers
      const headers = [
        'ID',
        'Name',
        'Email',
        'Role',
        'Phone Number',
        'Telegram Username',
        'Floor',
        'Host Contact',
        'Event Name',
        'Tour Interest',
        'MAC Address',
        'Registered At'
      ];
      
      // Helper function to escape CSV values
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      // Build CSV rows
      const rows = users.map(user => [
        escapeCSV(user.id),
        escapeCSV(user.name),
        escapeCSV(user.email),
        escapeCSV(user.role),
        escapeCSV(user.phoneNumber),
        escapeCSV(user.telegramUsername),
        escapeCSV(user.floor),
        escapeCSV(user.hostContact),
        escapeCSV(user.eventName),
        escapeCSV(user.tourInterest),
        escapeCSV(user.macAddress),
        escapeCSV(user.createdAt)
      ].join(','));
      
      // Combine headers and rows
      const csv = [headers.join(','), ...rows].join('\n');
      
      // Set headers for file download
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="frontier-tower-users-${timestamp}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Error exporting users:', error);
      res.status(500).json({
        success: false,
        message: "Failed to export users"
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
        guest_password: z.string().min(1).optional(),
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
