import express, { type Express, type Request, type Response } from "express";
import router from "./routes/router.ts";
import cors, { type CorsOptions } from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import errorHandler from "./middleware/error-handler.ts";

const app: Express = express();
const port = 3000;

// app.use(express.urlencoded({ extended: true }));

const corsOptions: CorsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));

// Better Auth route handler
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.use("/", router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
