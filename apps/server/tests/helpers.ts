import assert from "node:assert/strict";
import type { PrismaClient, UserRole } from "@paystay/db";

type Runtime = {
  start: (port?: number) => Promise<number>;
  stop: (reason?: string) => Promise<void>;
};

type AuthApi = {
  signUpEmail: (args: {
    body: { email: string; password: string; name: string };
  }) => Promise<unknown>;
};

type RoleRecordCreator = (user: { id: string; role: UserRole }) => Promise<void>;

export type CookieJar = Record<string, string>;

export type FixtureUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  userId: string;
  adminId?: string;
  customerId?: string;
};

export type CapturedEmail = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
};

export type IntegrationHarness = Awaited<
  ReturnType<typeof createIntegrationHarness>
>;

export const runIntegrationTests =
  process.env.RUN_SERVER_INTEGRATION_TESTS === "1";

const defaultDatabaseUrl =
  "postgresql://paystay:paystay@127.0.0.1:5432/paystay_dev";

const applyTestEnv = (): void => {
  process.env.NODE_ENV ??= "test";
  process.env.DATABASE_URL ??= defaultDatabaseUrl;
  process.env.APP_NAME ??= "PayStay Test";
  process.env.FRONTEND_URL ??= "http://localhost:3000";
  process.env.ADMIN_URL ??= "http://localhost:3001";
  process.env.CUSTOMER_URL ??= "http://localhost:3000";
  process.env.MAIL_PROVIDER ??= "mailhog";
  process.env.MAILHOG_HOST ??= "127.0.0.1";
  process.env.MAILHOG_PORT ??= "1025";
};

const parseJson = async (response: Response): Promise<any> => {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const updateCookieJar = (jar: CookieJar, response: Response): CookieJar => {
  const getSetCookie = (
    response.headers as Headers & {
      getSetCookie?: () => string[];
    }
  ).getSetCookie;

  const setCookies = getSetCookie ? getSetCookie.call(response.headers) : [];

  for (const header of setCookies) {
    const [cookiePair] = header.split(";", 1);
    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex <= 0) continue;

    const name = cookiePair.slice(0, separatorIndex).trim();
    const value = cookiePair.slice(separatorIndex + 1).trim();

    if (!value) {
      delete jar[name];
      continue;
    }

    jar[name] = value;
  }

  return jar;
};

const cookieHeader = (jar: CookieJar): string =>
  Object.entries(jar)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

export const createIntegrationHarness = async () => {
  applyTestEnv();

  const [{ createServerRuntime }, dbModule, authModule, emailModule] =
    await Promise.all([
      import("../src/app/server"),
      import("@paystay/db"),
      import("@paystay/auth"),
      import("@paystay/email"),
    ]);

  const prisma: PrismaClient = dbModule.prisma;
  const userRole = dbModule.UserRole;
  const auth = authModule.auth as { api: AuthApi };
  const createRoleRecord = authModule.createRoleRecord as RoleRecordCreator;
  const sentEmails: CapturedEmail[] = [];
  const mailer = emailModule.getNodemailerClient() as {
    sendMail: (message: CapturedEmail) => Promise<{ messageId: string }>;
  };
  const originalSendMail = mailer.sendMail.bind(mailer);

  mailer.sendMail = async (message) => {
    sentEmails.push({
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    return {
      messageId: `test-message-${sentEmails.length}`,
    };
  };

  const runtime = (await createServerRuntime()) as Runtime;
  const port = await runtime.start(0);
  const baseUrl = `http://127.0.0.1:${port}`;
  const runId = `itest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const request = async (
    path: string,
    init: RequestInit = {},
    jar?: CookieJar,
  ) => {
    const headers = new Headers(init.headers);

    if (!headers.has("content-type") && init.body) {
      headers.set("content-type", "application/json");
    }

    if (jar && Object.keys(jar).length > 0) {
      headers.set("cookie", cookieHeader(jar));
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
    });

    if (jar) {
      updateCookieJar(jar, response);
    }

    return response;
  };

  const jsonRequest = async (
    path: string,
    body: unknown,
    jar?: CookieJar,
    init: RequestInit = {},
  ) => {
    const response = await request(
      path,
      {
        method: "POST",
        ...init,
        body: JSON.stringify(body),
      },
      jar,
    );

    return {
      response,
      body: await parseJson(response),
    };
  };

  const graphql = async (
    query: string,
    variables: Record<string, unknown> = {},
    jar?: CookieJar,
  ) => {
    return jsonRequest("/graphql", { query, variables }, jar);
  };

  const createFixtureUser = async (
    role: keyof typeof userRole,
  ): Promise<FixtureUser> => {
    const suffix = Math.random().toString(36).slice(2, 8);
    const email = `${runId}-${role.toLowerCase()}-${suffix}@example.com`;
    const password = "Passw0rd!123";
    const name = `${role.toLowerCase()}-${suffix}`;

    await auth.api.signUpEmail({
      body: { email, password, name },
    });

    const createdUser = await prisma.user.findUnique({
      where: { email },
    });

    assert.ok(createdUser, `Expected fixture user ${email} to exist`);

    const user = await prisma.user.update({
      where: { id: createdUser.id },
      data: {
        role: userRole[role],
        emailVerified: true,
      },
    });

    await createRoleRecord({ id: user.id, role: userRole[role] });

    const adminProfile =
      role === "ADMIN"
        ? await prisma.admin.findUnique({ where: { userId: user.id } })
        : null;
    const customerProfile =
      role === "CUSTOMER"
        ? await prisma.customer.findUnique({ where: { userId: user.id } })
        : null;

    return {
      email,
      password,
      name,
      role: userRole[role],
      userId: user.id,
      adminId: adminProfile?.id,
      customerId: customerProfile?.id,
    };
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<CookieJar> => {
    const jar: CookieJar = {};
    const { response, body } = await jsonRequest(
      "/api/auth/sign-in/email",
      { email, password },
      jar,
    );

    assert.equal(response.status, 200, JSON.stringify(body));
    return jar;
  };

  const close = async (): Promise<void> => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: runId,
        },
      },
    });

    mailer.sendMail = originalSendMail;
    await runtime.stop("tests");
    await prisma.$disconnect();
  };

  return {
    auth,
    baseUrl,
    createFixtureUser,
    close,
    graphql,
    jsonRequest,
    prisma,
    request,
    runId,
    sentEmails,
    signIn,
    userRole,
  };
};
