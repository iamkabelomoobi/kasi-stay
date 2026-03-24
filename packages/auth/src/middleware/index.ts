import { toNodeHandler } from "better-auth/node";
import { auth } from "../libs";
import { Request, Response } from "express";

const nodeAuthHandler = toNodeHandler(auth);

export const authMiddleware = (req: Request, res: Response) =>
  nodeAuthHandler(req, res);
