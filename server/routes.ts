import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertCaptiveUserSchema, insertVoucherSchema, insertEventSchema, insertBookingSchema, insertTourBookingSchema, insertPrivateOfficeRentalSchema, insertEventHostBookingSchema, insertMembershipApplicationSchema, insertChatInviteRequestSchema, insertJobApplicationSchema, insertJobListingSchema, insertResidencyBookingSchema } from "@shared/schema";
import fetch from "node-fetch";
import https from "https";
import { SiweMessage } from "siwe";
import { randomBytes } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateCSRFToken,
  getOAuthLoginUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  revokeToken,
  getUserInfo,
} from "./oauth";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads", "logos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure directory for event images
const eventsUploadsDir = path.join(process.cwd(), "uploads", "events");
if (!fs.existsSync(eventsUploadsDir)) {
  fs.mkdirSync(eventsUploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  }
});

// Helper function to verify image file signature (magic bytes)
function verifyImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  
  // Check common image file signatures
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  
  return false;
}

// Helper function to download an image from a URL and return as base64 data URL
// Images are stored in the database as base64 to persist across deployments
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const maxSize = 2 * 1024 * 1024; // 2MB max for base64 storage
  const maxDuration = 15000; // 15 seconds max download time
  const abortController = new AbortController();
  let downloadTimer: NodeJS.Timeout | null = null;
  
  try {
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
      timeout: 8000
    });

    // Set up overall download timeout
    downloadTimer = setTimeout(() => {
      abortController.abort();
    }, maxDuration);

    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      agent: httpsAgent,
      signal: abortController.signal as any
    } as any);

    if (!response.ok) {
      throw new Error(`Failed to download image: HTTP ${response.status}`);
    }

    // Validate content type is an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      abortController.abort();
      throw new Error(`Invalid content type: ${contentType}. Expected an image.`);
    }

    // Check content length header if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      abortController.abort();
      throw new Error(`Image too large: ${contentLength} bytes. Max size is ${maxSize} bytes.`);
    }

    // Stream download with size limit enforcement
    const chunks: Buffer[] = [];
    let totalSize = 0;

    if (!response.body) {
      abortController.abort();
      throw new Error('Response body is null');
    }

    try {
      for await (const chunk of response.body as any) {
        // Check size BEFORE adding chunk and abort immediately if it would exceed limit
        if (totalSize + chunk.length > maxSize) {
          abortController.abort();
          if (response.body && typeof (response.body as any).cancel === 'function') {
            try { (response.body as any).cancel(); } catch (e) { /* ignore */ }
          }
          throw new Error(`Downloaded data exceeds maximum size of ${maxSize} bytes`);
        }
        
        totalSize += chunk.length;
        chunks.push(chunk);
      }
    } catch (streamError) {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
      if (response.body && typeof (response.body as any).cancel === 'function') {
        try { (response.body as any).cancel(); } catch (e) { /* ignore */ }
      }
      throw new Error(`Stream error: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
    } finally {
      if (downloadTimer) {
        clearTimeout(downloadTimer);
      }
    }

    const buffer = Buffer.concat(chunks);
    
    // Verify the file is actually an image by checking file signature
    if (!verifyImageSignature(buffer)) {
      throw new Error('Downloaded file is not a valid image (invalid file signature)');
    }
    
    // Determine MIME type for data URL
    let mimeType = 'image/jpeg'; // default
    if (contentType.includes('png')) {
      mimeType = 'image/png';
    } else if (contentType.includes('webp')) {
      mimeType = 'image/webp';
    } else if (contentType.includes('gif')) {
      mimeType = 'image/gif';
    }
    
    // Convert to base64 data URL
    const base64 = buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    if (!abortController.signal.aborted) {
      abortController.abort();
    }
    if (downloadTimer) {
      clearTimeout(downloadTimer);
    }
    console.error(`Failed to download image from ${imageUrl}:`, error);
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files (logos and event images) statically
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

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

  // iOS WiFi Configuration Profile endpoint
  // Serves the .mobileconfig file with proper MIME type for iOS installation
  app.get("/api/wifi-profile", async (req, res) => {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      
      const profilePath = path.join(process.cwd(), "client/public/wifi-frontiertower_1763457398454.mobileconfig");
      const profileData = await fs.readFile(profilePath, "utf-8");
      
      // Set the correct MIME type for iOS configuration profiles
      res.setHeader("Content-Type", "application/x-apple-aspen-config");
      // Use "inline" instead of "attachment" so iOS opens it for installation instead of downloading
      res.setHeader("Content-Disposition", 'inline; filename="FrontierTower-WiFi.mobileconfig"');
      res.send(profileData);
    } catch (error) {
      console.error("Error serving WiFi profile:", error);
      res.status(500).json({ error: "Failed to load WiFi profile" });
    }
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
      
      // Get settings to check if password is required
      const settings = await storage.getSettings();
      const passwordRequired = settings.password_required === 'true';
      
      // If password is not required, always allow
      if (!passwordRequired) {
        res.json({ success: true });
        return;
      }
      
      // Ensure default passwords exist
      await storage.ensureDefaultWifiPasswords();
      
      // Get all active WiFi passwords from database
      const wifiPasswords = await storage.getAllWifiPasswords();
      
      // Normalize password: trim whitespace and convert to lowercase for comparison
      const normalizedPassword = password.trim().toLowerCase();
      
      // Check if password matches any of the active WiFi passwords
      const allowedPasswords = wifiPasswords.map(p => p.password.trim().toLowerCase());

      if (allowedPasswords.includes(normalizedPassword)) {
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
        organization: z.string().optional(),
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
  
  // Middleware to verify admin session
  const verifyAdminSession = async (req: any, res: any, next: any) => {
    try {
      const sessionToken = req.cookies.admin_session;

      if (!sessionToken) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No session",
        });
      }

      const session = await storage.getAdminLoginByToken(sessionToken);

      if (!session) {
        res.clearCookie("admin_session");
        return res.status(401).json({
          success: false,
          message: "Unauthorized - Invalid session",
        });
      }

      req.adminSession = session;
      next();
    } catch (error) {
      console.error("Session verification error:", error);
      res.status(500).json({
        success: false,
        message: "Session verification failed",
      });
    }
  };

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      // Universal password for all admin users
      const adminPassword = "thereisnotry";

      if (password !== adminPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Assign role based on email or default to Owner
      let role = "Owner";

      // Generate session token
      const sessionToken = randomBytes(32).toString("hex");

      // Store admin login
      await storage.createAdminLogin({
        email,
        role: role,
        sessionToken,
      });

      // Set session cookie
      res.cookie("admin_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.json({
        success: true,
        message: "Login successful",
        role: role,
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
      });
    }
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      const sessionToken = req.cookies.admin_session;

      if (sessionToken) {
        await storage.deleteAdminSession(sessionToken);
      }

      res.clearCookie("admin_session");
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
      });
    }
  });

  app.get("/api/admin/session", async (req, res) => {
    try {
      const sessionToken = req.cookies.admin_session;

      if (!sessionToken) {
        return res.json({
          success: false,
          authenticated: false,
        });
      }

      const session = await storage.getAdminLoginByToken(sessionToken);

      if (!session) {
        res.clearCookie("admin_session");
        return res.json({
          success: false,
          authenticated: false,
        });
      }

      res.json({
        success: true,
        authenticated: true,
        email: session.email,
        role: session.role,
      });
    } catch (error) {
      console.error("Admin session check error:", error);
      res.json({
        success: false,
        authenticated: false,
      });
    }
  });

  app.get("/api/admin/logins", verifyAdminSession, async (req, res) => {
    try {
      const logins = await storage.getAllAdminLogins();
      res.json({
        success: true,
        logins,
      });
    } catch (error) {
      console.error("Failed to fetch admin logins:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch admin logins",
      });
    }
  });

  app.get("/api/admin/stats", verifyAdminSession, async (req, res) => {
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

  app.get("/api/admin/floor-stats", verifyAdminSession, async (req, res) => {
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

  app.get("/api/admin/vouchers", verifyAdminSession, async (req, res) => {
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

  app.post("/api/admin/vouchers", verifyAdminSession, async (req, res) => {
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

  app.get("/api/admin/events", verifyAdminSession, async (req, res) => {
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

  app.delete("/api/admin/events/:id", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID"
        });
      }

      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete event"
      });
    }
  });

  app.post("/api/admin/events/:id/unhide", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID"
        });
      }

      const unhidden = await storage.unhideEvent(id);
      
      if (!unhidden) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error unhiding event:', error);
      res.status(500).json({
        success: false,
        message: "Failed to unhide event"
      });
    }
  });

  app.post("/api/admin/events", verifyAdminSession, async (req, res) => {
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

  app.post("/api/admin/events/bulk-import", verifyAdminSession, async (req, res) => {
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
          // Generate a friendly event code from the event name
          const nameWords = (eventData.name || 'EVENT')
            .split(/\s+/)
            .slice(0, 3)
            .join('')
            .replace(/[^A-Za-z0-9]/g, '')
            .substring(0, 8)
            .toUpperCase();
          
          // Add a 3-character random suffix for uniqueness
          const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
          const code = `${nameWords}${randomSuffix}`.substring(0, 12);

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

  app.post("/api/admin/events/cleanup", verifyAdminSession, async (req, res) => {
    try {
      const result = await storage.deduplicateEvents();
      res.json({
        success: true,
        mergedCount: result.mergedCount,
        deletedCount: result.deletedCount,
        message: `Deduplicated ${result.mergedCount} event${result.mergedCount !== 1 ? 's' : ''}, removed ${result.deletedCount} duplicate${result.deletedCount !== 1 ? 's' : ''}`
      });
    } catch (error) {
      console.error('Error deduplicating events:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to deduplicate events"
      });
    }
  });

  app.post("/api/admin/events/sync", verifyAdminSession, async (req, res) => {
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
      maxAttendees: z.number().optional(),
      currentAttendees: z.number().optional(),
    });

    try {
      // First, delete all events without URLs (cleanup duplicates)
      const deletedCount = await storage.deleteEventsWithoutUrls();
      console.log(`Deleted ${deletedCount} event(s) without URLs during cleanup`);

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
          
          // Generate a friendly event code from the event name
          // Take first 2-3 words, remove special characters, limit to 8 chars, add random suffix
          const nameWords = externalEvent.name
            .split(/\s+/)
            .slice(0, 3)
            .join('')
            .replace(/[^A-Za-z0-9]/g, '')
            .substring(0, 8)
            .toUpperCase();
          
          // Add a 3-character random suffix for uniqueness
          const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
          const code = `${nameWords}${randomSuffix}`.substring(0, 12);

          const startDate = new Date(externalEvent.startsAt);
          const endDate = new Date(externalEvent.endsAt);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error(`Invalid dates for event ${externalEvent.id}: startsAt=${externalEvent.startsAt}, endsAt=${externalEvent.endsAt}`);
            throw new Error('Invalid date format');
          }

          // Extract Luma URL from description
          let lumaUrl = externalEvent.url;
          if (!lumaUrl && externalEvent.description) {
            const urlMatch = externalEvent.description.match(/https?:\/\/(?:lu\.ma|luma\.com)\/[^\s\n]+/);
            if (urlMatch) {
              // Strip trailing punctuation that might be part of the sentence
              lumaUrl = urlMatch[0].replace(/[.,;:!?)}\]]+$/, '').trim();
              // Ensure https prefix
              if (lumaUrl && !lumaUrl.startsWith('http')) {
                lumaUrl = `https://${lumaUrl}`;
              }
            }
          }
          
          // Normalize URL if present
          if (lumaUrl) {
            lumaUrl = lumaUrl.trim();
            if (!lumaUrl.startsWith('http')) {
              lumaUrl = `https://${lumaUrl}`;
            }
          }

          // Clean location by removing "Frontier Tower @" prefix
          let cleanedLocation = externalEvent.originalLocation || externalEvent.location || null;
          if (cleanedLocation && typeof cleanedLocation === 'string') {
            cleanedLocation = cleanedLocation.replace(/^Frontier Tower @\s*/i, '').trim() || null;
          }

          const eventData: any = {
            name: externalEvent.name,
            code: code,
            description: externalEvent.description,
            startDate,
            endDate,
            host: externalEvent.host || null,
            originalLocation: cleanedLocation,
            color: externalEvent.color || null,
            externalId: externalEvent.id,
            source: externalEvent.source,
            maxAttendees: externalEvent.maxAttendees || null,
            currentAttendees: externalEvent.currentAttendees || null,
          };
          
          if (lumaUrl) {
            eventData.url = lumaUrl;
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

      let message = `Successfully synced ${syncedEvents.length} event(s)`;
      if (deletedCount > 0) {
        message += `, cleaned up ${deletedCount} duplicate(s)`;
      }
      if (failedEvents.length > 0) {
        message += `, ${failedEvents.length} failed`;
      }

      console.log(`Event sync completed: ${syncedEvents.length} synced, ${deletedCount} deleted, ${failedEvents.length} failed`);
      
      res.json({
        success: true,
        events: syncedEvents,
        deletedCount,
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
  app.post("/api/admin/events/scrape-images", verifyAdminSession, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      const now = new Date();
      
      // Filter for future events with URLs that don't have a stored image
      const eventsWithUrls = events.filter(event => {
        if (!event.url || new Date(event.endDate) < now) return false;
        
        // Skip if we already have a base64 image stored
        if (event.imageUrl && event.imageUrl.startsWith('data:image/')) {
          console.log(`Skipping "${event.name}" - already has stored image`);
          return false;
        }
        return true;
      });
      
      if (eventsWithUrls.length === 0) {
        return res.json({
          success: true,
          message: "No future events need image scraping",
          scrapedCount: 0,
          failedCount: 0,
          skippedCount: events.filter(e => e.url && new Date(e.endDate) >= now).length
        });
      }

      const { load } = await import('cheerio');
      const scrapedImages: Array<{ id: number; name: string; imageUrl: string; originalImageUrl: string }> = [];
      const failedScrapes: Array<{ id: number; name: string; error: string }> = [];

      console.log(`Starting image scrape for ${eventsWithUrls.length} events (${events.filter(e => e.url && new Date(e.endDate) >= now).length - eventsWithUrls.length} already have images)`);

      // Create HTTPS agent with shorter timeout
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        keepAlive: true,
        timeout: 8000
      });

      // Process a single event's image
      const scrapeEventImage = async (event: typeof events[0]): Promise<{ success: boolean; result?: any; error?: string }> => {
        try {
          if (!event.url) return { success: false, error: "No URL" };
          
          const eventUrl = event.url.trim();
          const lumaUrl = eventUrl.startsWith('http') ? eventUrl : `https://lu.ma/${eventUrl}`;
          console.log(`Scraping: ${event.name}`);
          
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          
          try {
            const response = await fetch(lumaUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              },
              agent: httpsAgent,
              redirect: 'follow',
              signal: controller.signal as any
            } as any);
            
            clearTimeout(timeout);

            if (!response.ok) {
              return { success: false, error: `HTTP ${response.status}` };
            }

            const html = await response.text();
            const $ = load(html);
            
            // Try to find the event image
            let imageUrl = $('meta[property="og:image"]').attr('content') ||
                          $('meta[name="twitter:image"]').attr('content') ||
                          $('img[class*="event"]').first().attr('src') ||
                          $('img[class*="hero"], img[class*="cover"]').first().attr('src');

            if (!imageUrl) {
              return { success: false, error: "No image found" };
            }

            // Ensure it's a full URL
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              imageUrl = 'https://lu.ma' + imageUrl;
            }
            
            console.log(`Found image for "${event.name}"`);
            
            // Download the image and convert to base64 for persistent storage
            const base64Image = await downloadImageAsBase64(imageUrl);
            
            // Update event with base64 image AND store original URL as fallback
            await storage.updateEventImage(event.id, base64Image, imageUrl);
            
            return {
              success: true,
              result: {
                id: event.id,
                name: event.name,
                imageUrl: base64Image.substring(0, 50) + '...',
                originalImageUrl: imageUrl
              }
            };
          } catch (fetchError) {
            clearTimeout(timeout);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
              return { success: false, error: "Timeout" };
            }
            return { success: false, error: fetchError instanceof Error ? fetchError.message : 'Fetch failed' };
          }
        } catch (err) {
          return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
      }

      // Process events in parallel batches of 3 to avoid timeouts
      const BATCH_SIZE = 3;
      for (let i = 0; i < eventsWithUrls.length; i += BATCH_SIZE) {
        const batch = eventsWithUrls.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(event => scrapeEventImage(event)));
        
        results.forEach((result, idx) => {
          const event = batch[idx];
          if (result.success && result.result) {
            scrapedImages.push(result.result);
            console.log(`✓ Saved image for "${event.name}"`);
          } else {
            console.error(`✗ Failed "${event.name}": ${result.error}`);
            failedScrapes.push({
              id: event.id,
              name: event.name,
              error: result.error || 'Unknown error'
            });
          }
        });
        
        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < eventsWithUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
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

  app.get("/api/bookings", verifyAdminSession, async (req, res) => {
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

  // Serve uploaded logos
  app.use("/uploads/logos", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, (req, res, next) => {
    try {
      // Iteratively decode until stable to prevent double-encoding attacks
      let decodedPath = req.path;
      let prevDecoded = '';
      let iterations = 0;
      const maxIterations = 5;
      
      while (decodedPath !== prevDecoded && iterations < maxIterations) {
        prevDecoded = decodedPath;
        try {
          decodedPath = decodeURIComponent(decodedPath);
        } catch (e) {
          return res.status(400).json({ error: "Invalid path encoding" });
        }
        iterations++;
      }
      
      // Reject if still contains percent-encoding
      if (decodedPath.includes('%')) {
        return res.status(400).json({ error: "Invalid path encoding" });
      }
      
      // Remove leading slashes and resolve to absolute path
      const safePath = decodedPath.replace(/^\/+/, '');
      const resolvedPath = path.resolve(uploadsDir, safePath);
      
      // Use path.relative to ensure the resolved path doesn't escape the base directory
      const relativePath = path.relative(uploadsDir, resolvedPath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || relativePath.includes('..')) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.sendFile(resolvedPath, (err) => {
        if (err) {
          res.status(404).json({ error: "File not found" });
        }
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid path" });
    }
  });

  // Serve uploaded event images
  app.use("/uploads/events", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, (req, res, next) => {
    try {
      // Iteratively decode until stable to prevent double-encoding attacks
      let decodedPath = req.path;
      let prevDecoded = '';
      let iterations = 0;
      const maxIterations = 5;
      
      while (decodedPath !== prevDecoded && iterations < maxIterations) {
        prevDecoded = decodedPath;
        try {
          decodedPath = decodeURIComponent(decodedPath);
        } catch (e) {
          return res.status(400).json({ error: "Invalid path encoding" });
        }
        iterations++;
      }
      
      // Reject if still contains percent-encoding
      if (decodedPath.includes('%')) {
        return res.status(400).json({ error: "Invalid path encoding" });
      }
      
      // Remove leading slashes and resolve to absolute path
      const safePath = decodedPath.replace(/^\/+/, '');
      const resolvedPath = path.resolve(eventsUploadsDir, safePath);
      
      // Use path.relative to ensure the resolved path doesn't escape the base directory
      const relativePath = path.relative(eventsUploadsDir, resolvedPath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || relativePath.includes('..')) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.sendFile(resolvedPath, (err) => {
        if (err) {
          res.status(404).json({ error: "File not found" });
        }
      });
    } catch (error) {
      return res.status(400).json({ error: "Invalid path" });
    }
  });

  // Logo upload endpoint
  app.post("/api/upload/logo", upload.single("logo"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded"
        });
      }

      const logoUrl = `/uploads/logos/${req.file.filename}`;
      res.json({
        success: true,
        logoUrl
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to upload logo"
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

  app.get("/api/directory/edit/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const listing = await storage.getDirectoryListingByEditSlug(slug);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Directory listing not found"
        });
      }
      res.json({ success: true, listing });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch directory listing"
      });
    }
  });

  app.post("/api/directory/generate-description", async (req, res) => {
    try {
      const { websiteUrl, listingType, name } = req.body;
      
      if (!websiteUrl) {
        return res.status(400).json({
          success: false,
          message: "Website URL is required"
        });
      }

      // Scrape the website
      let websiteContent = "";
      try {
        const response = await fetch(websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FrontierPortalBot/1.0)'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        const { load } = await import('cheerio');
        const $ = load(html);
        
        // Remove script and style elements
        $('script, style, nav, footer, header, noscript').remove();
        
        // Get meta description
        const metaDescription = $('meta[name="description"]').attr('content') || 
                               $('meta[property="og:description"]').attr('content') || '';
        
        // Get page title
        const pageTitle = $('title').text().trim() || $('h1').first().text().trim() || '';
        
        // Get main content text (limit to avoid token limits)
        const bodyText = $('body').text()
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 3000);
        
        websiteContent = `Title: ${pageTitle}\nMeta Description: ${metaDescription}\nContent: ${bodyText}`;
      } catch (scrapeError: any) {
        console.error("Error scraping website:", scrapeError);
        websiteContent = `Unable to scrape website. Name: ${name || 'Unknown'}`;
      }

      // Generate description using OpenAI
      const OpenAI = (await import('openai')).default;
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const openai = new OpenAI({
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      });

      const listingTypePrompt = listingType === 'company' 
        ? 'company or business' 
        : listingType === 'community' 
          ? 'community or organization' 
          : listingType === 'amenity'
            ? 'amenity or service'
            : 'person or professional';

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are a professional copywriter. Generate a concise, engaging description for a ${listingTypePrompt} directory listing. 
The description should be 2-3 sentences, professional yet approachable, and highlight key value propositions.
Do not include contact information or website URLs in the description.
Return only the description text, no quotes or additional formatting.`
          },
          {
            role: "user",
            content: `Generate a description for this ${listingTypePrompt} based on their website content:\n\n${websiteContent}`
          }
        ],
        max_completion_tokens: 200,
      });

      const generatedDescription = completion.choices[0]?.message?.content?.trim() || "";
      
      res.json({ 
        success: true, 
        description: generatedDescription 
      });
    } catch (error: any) {
      console.error("Error generating description:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate description. Please try again or write your own."
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
    } catch (error: any) {
      console.error("Error creating directory listing:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create directory listing",
        details: process.env.NODE_ENV === "development" ? error.toString() : undefined
      });
    }
  });

  app.patch("/api/directory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      // Validate that company listings have companyName
      if (data.type === "company" && data.companyName !== undefined && !data.companyName?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Company name is required for company listings"
        });
      }
      
      // Validate that person listings have firstName and lastName
      if (data.type === "person") {
        if (data.firstName !== undefined && !data.firstName?.trim()) {
          return res.status(400).json({
            success: false,
            message: "First name is required for person listings"
          });
        }
        if (data.lastName !== undefined && !data.lastName?.trim()) {
          return res.status(400).json({
            success: false,
            message: "Last name is required for person listings"
          });
        }
      }
      
      const listing = await storage.updateDirectoryListing(id, data);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Directory listing not found"
        });
      }
      
      res.json({ success: true, listing });
    } catch (error) {
      console.error("Error updating directory listing:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update directory listing"
      });
    }
  });

  app.delete("/api/directory/:id", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDirectoryListing(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Directory listing not found"
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete directory listing"
      });
    }
  });

  // Tour Bookings Routes
  app.post("/api/tour-bookings", async (req, res) => {
    try {
      const validatedData = insertTourBookingSchema.parse(req.body);
      
      // Validate that the tour date is in the future (only for custom tours)
      if (validatedData.tourType === "custom" && validatedData.tourDate) {
        const tourDateTime = new Date(validatedData.tourDate);
        if (tourDateTime <= new Date()) {
          return res.status(400).json({
            success: false,
            message: "Tour date must be in the future"
          });
        }
      }
      
      const booking = await storage.createTourBooking(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendTourBookingNotification(booking).catch((error) => {
        console.error("Failed to send tour booking notification email:", error);
      });
      
      res.json({ success: true, booking });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid tour booking data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create tour booking"
      });
    }
  });

  app.get("/api/tour-bookings", verifyAdminSession, async (req, res) => {
    try {
      const bookings = await storage.getAllTourBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch tour bookings"
      });
    }
  });

  // Private Office Rentals Routes
  app.post("/api/private-office-rentals", async (req, res) => {
    try {
      const validatedData = insertPrivateOfficeRentalSchema.parse(req.body);
      
      const rental = await storage.createPrivateOfficeRental(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendPrivateOfficeRentalNotification(rental).catch((error) => {
        console.error("Failed to send private office rental notification email:", error);
      });
      
      res.json({ success: true, rental });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid private office rental data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create private office rental"
      });
    }
  });

  app.get("/api/private-office-rentals", async (req, res) => {
    try {
      const rentals = await storage.getAllPrivateOfficeRentals();
      res.json({ success: true, rentals });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch private office rentals"
      });
    }
  });

  // Event Host Bookings Routes
  app.post("/api/event-host-bookings", async (req, res) => {
    try {
      const validatedData = insertEventHostBookingSchema.parse(req.body);
      
      const booking = await storage.createEventHostBooking(validatedData);
      res.json({ success: true, booking });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid event host booking data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create event host booking"
      });
    }
  });

  app.get("/api/event-host-bookings", verifyAdminSession, async (req, res) => {
    try {
      const bookings = await storage.getAllEventHostBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch event host bookings"
      });
    }
  });

  // Membership Inquiries Routes
  app.post("/api/membership-applications", async (req, res) => {
    try {
      const validatedData = insertMembershipApplicationSchema.parse(req.body);
      
      const application = await storage.createMembershipApplication(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendMembershipApplicationNotification(application).catch((error) => {
        console.error("Failed to send membership inquiry notification email:", error);
      });
      
      res.json({ success: true, application });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid membership inquiry data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create membership inquiry"
      });
    }
  });

  app.get("/api/membership-applications", verifyAdminSession, async (req, res) => {
    try {
      const applications = await storage.getAllMembershipApplications();
      res.json({ success: true, applications });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch membership inquiries"
      });
    }
  });

  // Chat Invite Requests Routes
  app.post("/api/chat-invite-requests", async (req, res) => {
    try {
      const validatedData = insertChatInviteRequestSchema.parse(req.body);
      
      const request = await storage.createChatInviteRequest(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendChatInviteRequestNotification(request).catch((error) => {
        console.error("Failed to send chat invite request notification email:", error);
      });
      
      res.json({ success: true, request });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid chat invite request data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create chat invite request"
      });
    }
  });

  app.get("/api/admin/chat-invite-requests", verifyAdminSession, async (req, res) => {
    try {
      const requests = await storage.getAllChatInviteRequests();
      res.json({ success: true, requests });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch chat invite requests"
      });
    }
  });

  app.post("/api/job-applications", async (req, res) => {
    try {
      const validatedData = insertJobApplicationSchema.parse(req.body);
      
      const application = await storage.createJobApplication(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendJobApplicationNotification(application).catch((error) => {
        console.error("Failed to send job application notification email:", error);
      });
      
      res.json({ success: true, application });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid job application data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create job application"
      });
    }
  });

  app.get("/api/admin/job-applications", verifyAdminSession, async (req, res) => {
    try {
      const applications = await storage.getAllJobApplications();
      res.json({ success: true, applications });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch job applications"
      });
    }
  });

  // Job Listings endpoints
  app.get("/api/job-listings", async (req, res) => {
    try {
      const listings = await storage.getAllJobListings();
      res.json({ success: true, listings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch job listings"
      });
    }
  });

  app.post("/api/job-listings", async (req, res) => {
    try {
      const validatedData = insertJobListingSchema.parse(req.body);
      
      const listing = await storage.createJobListing(validatedData);
      
      res.json({ 
        success: true, 
        listing,
        message: "Job listing submitted successfully! It will appear on the careers page once approved by an administrator."
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid job listing data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create job listing"
      });
    }
  });

  app.get("/api/admin/job-listings", verifyAdminSession, async (req, res) => {
    try {
      const listings = await storage.getAllJobListingsForAdmin();
      res.json({ success: true, listings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch job listings"
      });
    }
  });

  app.patch("/api/admin/job-listings/:id/approve", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.approveJobListing(id);
      
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: "Job listing not found"
        });
      }
      
      res.json({ success: true, listing });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to approve job listing"
      });
    }
  });

  app.patch("/api/admin/job-listings/:id/toggle-featured", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const listing = await storage.getJobListingById(id);
      
      if (!listing || !listing.isActive) {
        return res.status(404).json({
          success: false,
          message: "Job listing not found or has been deleted"
        });
      }
      
      const updated = await storage.updateJobListing(id, {
        isFeatured: !listing.isFeatured
      });
      
      res.json({ success: true, listing: updated });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to toggle featured status"
      });
    }
  });

  app.delete("/api/admin/job-listings/:id", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobListing(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete job listing"
      });
    }
  });

  app.get("/api/admin/sessions", verifyAdminSession, async (req, res) => {
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

  app.get("/api/admin/users", verifyAdminSession, async (req, res) => {
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
  app.get("/api/admin/users/export", verifyAdminSession, async (req, res) => {
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
        escapeCSV(user.phone),
        escapeCSV(user.telegramUsername),
        escapeCSV(user.floor),
        escapeCSV(user.host),
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

  app.delete("/api/admin/sessions/:sessionId", verifyAdminSession, async (req, res) => {
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
  app.get("/api/admin/settings", verifyAdminSession, async (req, res) => {
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

  app.post("/api/admin/settings", verifyAdminSession, async (req, res) => {
    try {
      const baseSchema = z.object({
        guest_password: z.string().min(1).optional(),
        unifi_api_type: z.enum(['modern', 'legacy', 'none']),
        unifi_controller_url: z.string().optional(),
        unifi_api_key: z.string().optional(),
        unifi_username: z.string().optional(),
        unifi_password: z.string().optional(),
        unifi_site: z.string().optional(),
        password_required: z.enum(['true', 'false']).optional(),
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

  // WiFi Password Management Endpoints
  app.get("/api/admin/wifi-passwords", verifyAdminSession, async (req, res) => {
    try {
      // Ensure default passwords exist
      await storage.ensureDefaultWifiPasswords();
      
      const passwords = await storage.getAllWifiPasswords();
      res.json(passwords);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch WiFi passwords"
      });
    }
  });

  app.post("/api/admin/wifi-passwords", verifyAdminSession, async (req, res) => {
    try {
      const schema = z.object({
        password: z.string().min(1, "Password is required"),
        description: z.string().optional(),
      });

      const data = schema.parse(req.body);
      
      const newPassword = await storage.addWifiPassword(data.password, data.description);
      
      res.json({
        success: true,
        password: newPassword,
        message: "WiFi password added successfully"
      });
    } catch (error) {
      console.error('Error adding WiFi password:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid password data",
          errors: error.errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to add WiFi password. Password may already exist."
      });
    }
  });

  app.delete("/api/admin/wifi-passwords/:id", verifyAdminSession, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid password ID"
        });
      }

      await storage.deleteWifiPassword(id);
      
      res.json({
        success: true,
        message: "WiFi password deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting WiFi password:', error);
      res.status(500).json({
        success: false,
        message: "Failed to delete WiFi password"
      });
    }
  });

  // OAuth Authentication Routes
  
  // Helper function to get or create cookie ID
  function getOrCreateCookieId(req: any, res: any): string {
    let cookieId = req.cookies?.ft_session;
    if (!cookieId) {
      cookieId = randomBytes(16).toString('hex');
      res.cookie('ft_session', cookieId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
      });
    }
    return cookieId;
  }

  // Initiate OAuth login
  app.get("/api/auth/login", async (req, res) => {
    try {
      const clientId = process.env.FT_OAUTH_CLIENT_ID;
      const redirectUri = process.env.FT_OAUTH_REDIRECT_URI;

      if (!clientId || !redirectUri) {
        return res.status(500).json({
          success: false,
          message: "OAuth not configured. Please set FT_OAUTH_CLIENT_ID and FT_OAUTH_REDIRECT_URI",
        });
      }

      const cookieId = getOrCreateCookieId(req, res);
      
      // Generate PKCE values
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const csrfToken = generateCSRFToken();

      // Store code verifier and CSRF token in database
      await storage.saveOAuthSession(cookieId, {
        codeVerifier,
        csrfToken,
      });

      // Generate OAuth login URL
      const loginUrl = getOAuthLoginUrl(clientId, redirectUri, csrfToken, codeChallenge);

      res.json({
        success: true,
        loginUrl,
      });
    } catch (error) {
      console.error("Error initiating OAuth login:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate login",
      });
    }
  });

  // OAuth callback handler
  app.get("/api/auth/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string;

      if (!code || !state) {
        console.error("OAuth callback: Missing code or state parameter");
        return res.redirect("/?error=missing_params");
      }

      const cookieId = req.cookies?.ft_session;
      if (!cookieId) {
        console.error("OAuth callback: No ft_session cookie found");
        return res.redirect("/?error=no_session");
      }

      // Get stored session data
      const session = await storage.getOAuthSession(cookieId);
      if (!session || !session.csrfToken || !session.codeVerifier) {
        console.error("OAuth callback: Invalid session - missing CSRF or verifier", {
          hasSession: !!session,
          hasCsrf: !!session?.csrfToken,
          hasVerifier: !!session?.codeVerifier,
        });
        return res.redirect("/?error=invalid_session");
      }

      // Verify CSRF token
      if (state !== session.csrfToken) {
        console.error("OAuth callback: CSRF mismatch", {
          received: state,
          expected: session.csrfToken,
        });
        return res.redirect("/?error=csrf_mismatch");
      }

      const clientId = process.env.FT_OAUTH_CLIENT_ID;
      const clientSecret = process.env.FT_OAUTH_CLIENT_SECRET;
      const redirectUri = process.env.FT_OAUTH_REDIRECT_URI;

      if (!clientId || !clientSecret || !redirectUri) {
        console.error("OAuth callback: Missing OAuth configuration");
        return res.redirect("/?error=oauth_not_configured");
      }

      // Exchange code for token
      const tokenData = await exchangeCodeForToken(
        code,
        clientId,
        clientSecret,
        redirectUri,
        session.codeVerifier
      );

      if (tokenData.error) {
        console.error("Token exchange error:", tokenData.error, tokenData);
        return res.redirect("/?error=token_exchange_failed");
      }

      // Get user info
      const userInfo = await getUserInfo(tokenData.access_token, tokenData.token_type);
      console.log("OAuth callback: User authenticated", { userId: userInfo.id });

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      // Save tokens and user info to database
      await storage.saveOAuthTokens(cookieId, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
        expiresAt,
        ftUserId: userInfo.id,
        userInfo,
      });

      // Redirect to home page
      res.redirect("/?login=success");
    } catch (error) {
      console.error("Error in OAuth callback:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Get current user info
  app.get("/api/auth/me", async (req, res) => {
    try {
      const cookieId = req.cookies?.ft_session;
      if (!cookieId) {
        return res.json({ authenticated: false });
      }

      const member = await storage.getAuthenticatedMember(cookieId);
      if (!member || !member.accessToken) {
        return res.json({ authenticated: false });
      }

      // Check if token is expired
      const now = new Date();
      if (member.expiresAt && member.expiresAt < now) {
        // Try to refresh the token
        const clientId = process.env.FT_OAUTH_CLIENT_ID;
        const clientSecret = process.env.FT_OAUTH_CLIENT_SECRET;

        if (member.refreshToken && clientId && clientSecret) {
          try {
            const tokenData = await refreshAccessToken(
              member.refreshToken,
              clientId,
              clientSecret
            );

            if (!tokenData.error) {
              const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
              
              await storage.updateOAuthTokens(cookieId, {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenType: tokenData.token_type,
                expiresAt,
              });

              // Get fresh user info
              const userInfo = await getUserInfo(tokenData.access_token, tokenData.token_type);

              return res.json({
                authenticated: true,
                user: userInfo,
              });
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            await storage.deleteOAuthSession(cookieId);
            return res.json({ authenticated: false });
          }
        }

        // Token expired and couldn't refresh
        await storage.deleteOAuthSession(cookieId);
        return res.json({ authenticated: false });
      }

      // Token is valid
      res.json({
        authenticated: true,
        user: member.userInfo,
      });
    } catch (error) {
      console.error("Error getting user info:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user info",
      });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const cookieId = req.cookies?.ft_session;
      if (!cookieId) {
        return res.json({ success: true });
      }

      const member = await storage.getAuthenticatedMember(cookieId);
      
      if (member && member.accessToken) {
        const clientId = process.env.FT_OAUTH_CLIENT_ID;
        const clientSecret = process.env.FT_OAUTH_CLIENT_SECRET;

        if (clientId && clientSecret) {
          try {
            await revokeToken(member.accessToken, clientId, clientSecret);
          } catch (revokeError) {
            console.error("Error revoking token:", revokeError);
            // Continue with logout even if revoke fails
          }
        }
      }

      // Delete session from database
      await storage.deleteOAuthSession(cookieId);

      // Clear cookie
      res.clearCookie('ft_session');

      res.json({ success: true });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({
        success: false,
        message: "Failed to logout",
      });
    }
  });

  // Residency Requests Routes
  app.post("/api/residency-bookings", async (req, res) => {
    try {
      const validatedData = insertResidencyBookingSchema.parse(req.body);
      
      const booking = await storage.createResidencyBooking(validatedData);
      
      // Send email notification (non-blocking)
      const { emailService } = await import("./email");
      emailService.sendResidencyBookingNotification(booking).catch((error) => {
        console.error("Failed to send residency request notification email:", error);
      });
      
      res.json({ success: true, booking });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || "Invalid residency request data"
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to create residency request"
      });
    }
  });

  app.get("/api/residency-bookings", verifyAdminSession, async (req, res) => {
    try {
      const bookings = await storage.getResidencyBookings();
      res.json({ success: true, bookings });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch residency requests"
      });
    }
  });

  // Unified Leads Endpoint - Fetches all leads from all tables
  app.get("/api/admin/leads", verifyAdminSession, async (req, res) => {
    try {
      const [
        tourBookings,
        eventHostBookings,
        membershipApplications,
        chatInviteRequests,
        residencyBookings,
        wifiGuestLeads
      ] = await Promise.all([
        storage.getAllTourBookings(),
        storage.getAllEventHostBookings(),
        storage.getAllMembershipApplications(),
        storage.getAllChatInviteRequests(),
        storage.getResidencyBookings(),
        storage.getWifiGuestLeads()
      ]);

      // Transform each lead type into a unified format
      const allLeads = [
        ...tourBookings.map((lead: any) => ({
          id: lead.id,
          type: 'tour',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            company: lead.company,
            tourType: lead.tourType,
            tourDate: lead.tourDate,
            tourTime: lead.tourTime,
            groupTourSelection: lead.groupTourSelection,
            interestedInPrivateOffice: lead.interestedInPrivateOffice,
            numberOfPeople: lead.numberOfPeople
          }
        })),
        ...eventHostBookings.map((lead: any) => ({
          id: lead.id,
          type: 'event-host',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            company: lead.company,
            eventType: lead.eventType,
            expectedAttendees: lead.expectedAttendees,
            preferredDate: lead.preferredDate,
            eventDescription: lead.eventDescription
          }
        })),
        ...membershipApplications.map((lead: any) => ({
          id: lead.id,
          type: 'membership',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            company: lead.company,
            telegram: lead.telegram,
            linkedIn: lead.linkedIn,
            website: lead.website
          }
        })),
        ...chatInviteRequests.map((lead: any) => ({
          id: lead.id,
          type: 'chat-invite',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            telegram: lead.telegram,
            linkedIn: lead.linkedIn,
            message: lead.message
          }
        })),
        ...residencyBookings.map((lead: any) => ({
          id: lead.id,
          type: 'residency',
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            checkInDate: lead.checkInDate,
            checkOutDate: lead.checkOutDate,
            numberOfGuests: lead.numberOfGuests,
            roomPreference: lead.roomPreference,
            specialRequests: lead.specialRequests
          }
        })),
        ...wifiGuestLeads.map((lead: any) => ({
          id: lead.id,
          type: 'wifi-guest',
          name: lead.name || 'N/A',
          email: lead.email,
          phone: lead.phone || 'N/A',
          status: lead.status || 'pending',
          createdAt: lead.createdAt,
          details: {
            purpose: lead.purpose,
            host: lead.host,
            tourInterest: lead.tourInterest
          }
        }))
      ];

      // Sort by createdAt descending (newest first)
      allLeads.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json({ success: true, leads: allLeads });
    } catch (error) {
      console.error("Failed to fetch unified leads:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch leads"
      });
    }
  });

  // Update Lead Status Endpoint
  app.patch("/api/admin/leads/:type/:id/status", verifyAdminSession, async (req, res) => {
    try {
      const { type, id } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'new', 'contacted', 'scheduled', 'interviewed', 'rejected', 'approved', 'quoted', 'citizen'];
      
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }

      let result;
      const leadId = parseInt(id);

      switch (type) {
        case 'tour':
          result = await storage.updateTourBookingStatus(leadId, status);
          break;
        case 'event-host':
          result = await storage.updateEventHostBookingStatus(leadId, status);
          break;
        case 'membership':
          result = await storage.updateMembershipApplicationStatus(leadId, status);
          break;
        case 'chat-invite':
          result = await storage.updateChatInviteRequestStatus(leadId, status);
          break;
        case 'residency':
          result = await storage.updateResidencyBookingStatus(leadId, status);
          break;
        case 'wifi-guest':
          result = await storage.updateWifiGuestLeadStatus(leadId, status);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid lead type"
          });
      }

      res.json({ success: true, lead: result });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update lead status"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
