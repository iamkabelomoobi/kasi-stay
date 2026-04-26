import { auth, getBetterAuthHeaders } from "@kasistay/auth";
import { prisma } from "@kasistay/db";
import { UserRole } from "@kasistay/db";
import { logger } from "@kasistay/logger";
import { Request } from "express";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
};

type Session = {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
  };
};

export class Context {
  public readonly prisma: typeof prisma;
  public readonly session: Session | null;
  public readonly headers: Headers;
  public readonly ipAddress: string | null;

  private constructor(
    _prisma: typeof prisma,
    _session: Session | null,
    _headers: Headers,
    _ipAddress: string | null,
  ) {
    this.prisma = _prisma;
    this.session = _session;
    this.headers = _headers;
    this.ipAddress = _ipAddress;
  }

  get role(): UserRole {
    return (this.session?.user?.role as UserRole) ?? UserRole.RENTER;
  }

  get isAuthenticated(): boolean {
    return this.session !== null;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isAgent(): boolean {
    return this.role === UserRole.AGENT;
  }

  get isOwner(): boolean {
    return this.role === UserRole.OWNER;
  }

  get isBuyer(): boolean {
    return this.role === UserRole.BUYER;
  }

  get isRenter(): boolean {
    return this.role === UserRole.RENTER;
  }

  assertAuth(): SessionUser {
    if (!this.session) {
      throw new Error("Unauthorized: you must be logged in");
    }
    return this.session.user;
  }

  assertAdmin(): SessionUser {
    const user = this.assertAuth();
    if (!this.isAdmin) {
      throw new Error("Forbidden: admin access required");
    }
    return user;
  }

  assertRenter(): SessionUser {
    const user = this.assertAuth();
    if (!this.isRenter) {
      throw new Error("Forbidden: renter access required");
    }
    return user;
  }

  assertAgent(): SessionUser {
    const user = this.assertAuth();
    if (!this.isAgent) {
      throw new Error("Forbidden: agent access required");
    }
    return user;
  }

  assertOwner(): SessionUser {
    const user = this.assertAuth();
    if (!this.isOwner) {
      throw new Error("Forbidden: owner access required");
    }
    return user;
  }

  assertBuyer(): SessionUser {
    const user = this.assertAuth();
    if (!this.isBuyer) {
      throw new Error("Forbidden: buyer access required");
    }
    return user;
  }

  static internal(): Context {
    return new Context(prisma, null, new Headers(), null);
  }

  static async fromRequest(req: Request): Promise<Context> {
    const forwardedForHeader = req.headers["x-forwarded-for"];
    const forwardedFor =
      typeof forwardedForHeader === "string"
        ? forwardedForHeader.split(",")[0]?.trim() ?? null
        : Array.isArray(forwardedForHeader)
          ? forwardedForHeader[0]?.trim() ?? null
          : null;
    const ipAddress = forwardedFor ?? req.ip ?? null;

    try {
      const headers = getBetterAuthHeaders(req.headers);
      const session = await auth.api.getSession({ headers });
      return new Context(prisma, session as Session | null, headers, ipAddress);
    } catch (error) {
      logger.warn("Failed to get session from request", { error });
      return new Context(prisma, null, new Headers(), ipAddress);
    }
  }
}
