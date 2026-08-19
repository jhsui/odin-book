import express, { type Express, type Request, type Response } from "express";
import router from "./routes/userRouter.ts";
import cors, { type CorsOptions } from "cors";

const app: Express = express();
const port = 3000;

app.use(express.json());

// app.use(express.urlencoded({ extended: true }));

const corsOptions: CorsOptions = {
  origin: "http://localhost:5173", // React/Vite URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

app.use("/", router);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
