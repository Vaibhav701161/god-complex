import express from "express";

import routes from "./routes";
import { auth } from "./auth";




const app = express();

app.use(express.json());
app.use("/api", routes);
app.use("/auth", auth.handler);

export default app;