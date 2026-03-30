import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  createIntegrationHarness,
  runIntegrationTests,
  type IntegrationHarness,
} from "./helpers.ts";

let harness: IntegrationHarness;
let adminFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;

if (!runIntegrationTests) {
  test("auth integration tests are skipped without RUN_SERVER_INTEGRATION_TESTS=1");
} else {
  before(async () => {
    harness = await createIntegrationHarness();
    adminFixture = await harness.createFixtureUser("ADMIN");
  });

  after(async () => {
    await harness?.close();
  });

  test("auth sign-up endpoint creates a session for a new customer", { concurrency: false }, async () => {
    const email = `${harness.runId}-signup@example.com`;
    const password = "Passw0rd!123";
    const cookieJar: Record<string, string> = {};
    const initialEmailCount = harness.sentEmails.length;

    const signUp = await harness.jsonRequest(
      "/api/auth/sign-up/email",
      {
        email,
        password,
        name: "signup-user",
      },
      cookieJar,
    );

    assert.equal(signUp.response.status, 200, JSON.stringify(signUp.body));

    const session = await harness.request("/api/auth/get-session", {}, cookieJar);
    const sessionBody = await session.json();

    assert.equal(session.status, 200);
    assert.equal(sessionBody.user.email, email);
    assert.equal(sessionBody.user.role, harness.userRole.CUSTOMER);

    const customerProfile = await harness.prisma.customer.findUnique({
      where: {
        userId: sessionBody.user.id,
      },
    });

    assert.ok(customerProfile);
    const welcomeEmail = harness.sentEmails[harness.sentEmails.length - 1];
    assert.equal(harness.sentEmails.length, initialEmailCount + 1);
    assert.equal(welcomeEmail?.to, email);
    assert.match(welcomeEmail?.subject ?? "", /welcome/i);
  });

  test("auth sign-in and sign-out endpoints manage session cookies", { concurrency: false }, async () => {
    const cookieJar = await harness.signIn(adminFixture.email, adminFixture.password);

    const session = await harness.request("/api/auth/get-session", {}, cookieJar);
    const sessionBody = await session.json();

    assert.equal(session.status, 200);
    assert.equal(sessionBody.user.email, adminFixture.email);

    const signOut = await harness.request(
      "/api/auth/sign-out",
      { method: "POST" },
      cookieJar,
    );
    assert.equal(signOut.status, 200);

    const afterSignOut = await harness.request("/api/auth/get-session", {}, cookieJar);
    const afterSignOutBody = await afterSignOut.json();

    assert.equal(afterSignOut.status, 200);
    assert.equal(afterSignOutBody, null);
  });
}
