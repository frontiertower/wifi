import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";

// Custom log function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Production static file serving
function serveStaticProd(app: express.Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  
  console.log(`[static] Looking for static files at: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    console.error(`[static] Build directory not found: ${distPath}`);
    try {
      console.error(`[static] Available files in dirname:`, fs.readdirSync(import.meta.dirname));
    } catch (e) {
      console.error(`[static] Could not list directory`);
    }
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  console.log(`[static] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Log startup information
console.log(`[startup] Starting server...`);
console.log(`[startup] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[startup] PORT: ${process.env.PORT || '5000'}`);

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log(`[startup] Registering routes...`);
    const server = await registerRoutes(app);
    console.log(`[startup] Routes registered successfully`);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error(`[error] ${status}: ${message}`);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`[startup] Environment: ${isProduction ? 'production' : 'development'}`);
    
    if (!isProduction) {
      console.log(`[startup] Setting up Vite for development...`);
      // Dynamic import to avoid loading vite in production
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
      console.log(`[startup] Vite setup complete`);
    } else {
      console.log(`[startup] Setting up static file serving for production...`);
      serveStaticProd(app);
      console.log(`[startup] Static file serving setup complete`);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`[startup] Server is ready and listening on http://0.0.0.0:${port}`);
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error(`[startup] Fatal error during startup:`, error);
    process.exit(1);
  }
})();
