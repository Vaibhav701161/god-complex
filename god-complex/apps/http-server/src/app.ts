import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import routes from "./routes";
import { auth } from "./auth";

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: true, // Allow all origins (reflects request origin)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "God Complex API Server",
        version: "1.0.0"
    });
});

// Better-Auth routes - must be before express.json() middleware!
// Express 5 requires *splat syntax
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler
app.use(express.json());

app.use("/api", routes);

export default app;