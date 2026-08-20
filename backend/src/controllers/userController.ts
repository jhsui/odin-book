import { signUpValidator } from "../validators.ts";
import { matchedData, validationResult } from "express-validator";
import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma.ts";
