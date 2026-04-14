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

  private constructor(
    _prisma: typeof prisma,
    _session: Session | null,
    _headers: Headers,
  ) {
    this.prisma = _prisma;
    this.session = _session;
    this.headers = _headers;
  }

  get role(): UserRole {
    return (this.session?.user?.role as UserRole) ?? UserRole.CUSTOMER;
  }

  get isAuthenticated(): boolean {
    return this.session !== null;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  get isCustomer(): boolean {
    return this.role === UserRole.CUSTOMER;
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

  assertCustomer(): SessionUser {
    const user = this.assertAuth();
    if (!this.isCustomer) {
      throw new Error("Forbidden: customer access required");
    }
    return user;
  }

  static async fromRequest(req: Request): Promise<Context> {
    try {
      const headers = getBetterAuthHeaders(req.headers);
      const session = await auth.api.getSession({ headers });
      return new Context(prisma, session as Session | null, headers);
    } catch (error) {
      logger.warn("Failed to get session from request", { error });
      return new Context(prisma, null, new Headers());
    }
  }
}
