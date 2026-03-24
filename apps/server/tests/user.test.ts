import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  createIntegrationHarness,
  runIntegrationTests,
  type IntegrationHarness,
} from "./helpers.ts";

let harness: IntegrationHarness;
let adminFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;
let customerFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;

if (!runIntegrationTests) {
  test("user integration tests are skipped without RUN_SERVER_INTEGRATION_TESTS=1");
} else {
  before(async () => {
    harness = await createIntegrationHarness();
    adminFixture = await harness.createFixtureUser("ADMIN");
    customerFixture = await harness.createFixtureUser("CUSTOMER");
  });

  after(async () => {
    await harness?.close();
  });

  test("user endpoints allow admin listing and customer self-update", { concurrency: false }, async () => {
    const adminCookies = await harness.signIn(adminFixture.email, adminFixture.password);
    const usersResult = await harness.graphql(
      `
        query Users($search: UserSearchInput) {
          users(search: $search) {
            id
            email
            name
            role
          }
        }
      `,
      {
        search: {
          email: customerFixture.email,
        },
      },
      adminCookies,
    );

    assert.equal(usersResult.response.status, 200);
    assert.equal(usersResult.body.errors, undefined);
    assert.ok(
      usersResult.body.data.users.some(
        (user: { id: string }) => user.id === customerFixture.userId,
      ),
    );

    const customerCookies = await harness.signIn(
      customerFixture.email,
      customerFixture.password,
    );

    const updateUserResult = await harness.graphql(
      `
        mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
          }
        }
      `,
      {
        id: customerFixture.userId,
        input: {
          name: "user-self-updated",
        },
      },
      customerCookies,
    );

    assert.equal(updateUserResult.response.status, 200);
    assert.equal(updateUserResult.body.errors, undefined);
    assert.equal(updateUserResult.body.data.updateUser.name, "user-self-updated");
  });
}
