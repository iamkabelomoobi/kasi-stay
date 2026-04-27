import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  createIntegrationHarness,
  runIntegrationTests,
  type IntegrationHarness,
} from "./helpers.ts";

let harness: IntegrationHarness;
let adminFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;
let renterFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;

if (!runIntegrationTests) {
  test("admin integration tests are skipped without RUN_SERVER_INTEGRATION_TESTS=1");
} else {
  before(async () => {
    harness = await createIntegrationHarness();
    adminFixture = await harness.createFixtureUser("ADMIN");
    renterFixture = await harness.createFixtureUser("RENTER");
  });

  after(async () => {
    await harness?.close();
  });

  test("admin endpoints allow an admin to list and update admins", { concurrency: false }, async () => {
    const cookieJar = await harness.signIn(adminFixture.email, adminFixture.password);

    const adminsResult = await harness.graphql(
      `
        query Admins {
          admins {
            id
            user {
              id
              email
              name
            }
          }
        }
      `,
      {},
      cookieJar,
    );

    assert.equal(adminsResult.response.status, 200);
    assert.equal(adminsResult.body.errors, undefined);
    assert.ok(
      adminsResult.body.data.admins.some(
        (admin: { id: string }) => admin.id === adminFixture.adminId,
      ),
    );

    const updateResult = await harness.graphql(
      `
        mutation UpdateAdmin($id: ID!, $input: AdminUpdateInput!) {
          updateAdmin(id: $id, input: $input) {
            id
            user {
              name
            }
          }
        }
      `,
      {
        id: adminFixture.adminId,
        input: {
          name: "admin-updated",
        },
      },
      cookieJar,
    );

    assert.equal(updateResult.response.status, 200);
    assert.equal(updateResult.body.errors, undefined);
    assert.equal(updateResult.body.data.updateAdmin.user.name, "admin-updated");
  });

  test("admin GraphQL endpoints reject renter access", { concurrency: false }, async () => {
    const renterCookies = await harness.signIn(
      renterFixture.email,
      renterFixture.password,
    );

    const result = await harness.graphql(
      `
        query Admins {
          admins {
            id
          }
        }
      `,
      {},
      renterCookies,
    );

    assert.equal(result.response.status, 200);
    assert.ok(Array.isArray(result.body.errors));
  });
}
