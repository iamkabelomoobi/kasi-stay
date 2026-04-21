import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  createIntegrationHarness,
  runIntegrationTests,
  type IntegrationHarness,
} from "./helpers.ts";

let harness: IntegrationHarness;
let customerFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;

if (!runIntegrationTests) {
  test("customer integration tests are skipped without RUN_SERVER_INTEGRATION_TESTS=1");
} else {
  before(async () => {
    harness = await createIntegrationHarness();
    customerFixture = await harness.createFixtureUser("CUSTOMER");
  });

  after(async () => {
    await harness?.close();
  });

  test("customer endpoints allow a customer to read and update their profile", { concurrency: false }, async () => {
    const cookieJar = await harness.signIn(
      customerFixture.email,
      customerFixture.password,
    );

    const myProfile = await harness.graphql(
      `
        query MyProfile {
          myProfile {
            id
            user {
              email
              name
            }
          }
        }
      `,
      {},
      cookieJar,
    );

    assert.equal(myProfile.response.status, 200);
    assert.equal(myProfile.body.errors, undefined);
    assert.equal(myProfile.body.data.myProfile.id, customerFixture.renterId);
    assert.equal(myProfile.body.data.myProfile.user.email, customerFixture.email);

    const updateProfile = await harness.graphql(
      `
        mutation UpdateCustomer($id: ID!, $input: CustomerUpdateInput!) {
          updateCustomer(id: $id, input: $input) {
            id
            user {
              name
            }
          }
        }
      `,
      {
        id: customerFixture.renterId,
        input: {
          name: "customer-updated",
        },
      },
      cookieJar,
    );

    assert.equal(updateProfile.response.status, 200);
    assert.equal(updateProfile.body.errors, undefined);
    assert.equal(
      updateProfile.body.data.user.name,
      "customer-updated",
    );
  });

  test("customer endpoints reject access to another customer's profile", { concurrency: false }, async () => {
    const outsider = await harness.createFixtureUser("RENTER");
    const cookieJar = await harness.signIn(
      customerFixture.email,
      customerFixture.password,
    );

    const result = await harness.graphql(
      `
        query Customer($id: ID!) {
          customer(id: $id) {
            id
          }
        }
      `,
      { id: outsider.renterId },
      cookieJar,
    );

    assert.equal(result.response.status, 200);
    assert.ok(Array.isArray(result.body.errors));
    assert.match(result.body.errors[0].message, /Forbidden/);
  });
}
