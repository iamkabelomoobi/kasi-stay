import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  createIntegrationHarness,
  runIntegrationTests,
  type IntegrationHarness,
} from "./helpers.ts";

let harness: IntegrationHarness;
let renterFixture: Awaited<ReturnType<IntegrationHarness["createFixtureUser"]>>;

if (!runIntegrationTests) {
  test("renter integration tests are skipped without RUN_SERVER_INTEGRATION_TESTS=1");
} else {
  before(async () => {
    harness = await createIntegrationHarness();
    renterFixture = await harness.createFixtureUser("RENTER");
  });

  after(async () => {
    await harness?.close();
  });

  test("renter endpoints allow a renter to read and update their profile", { concurrency: false }, async () => {
    const cookieJar = await harness.signIn(
      renterFixture.email,
      renterFixture.password,
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
    assert.equal(myProfile.body.data.myProfile.id, renterFixture.renterId);
    assert.equal(myProfile.body.data.myProfile.user.email, renterFixture.email);

    const updateProfile = await harness.graphql(
      `
        mutation UpdateRenter($id: ID!, $input: RenterUpdateInput!) {
          updateRenter(id: $id, input: $input) {
            id
            user {
              name
            }
          }
        }
      `,
      {
        id: renterFixture.renterId,
        input: {
          name: "renter-updated",
        },
      },
      cookieJar,
    );

    assert.equal(updateProfile.response.status, 200);
    assert.equal(updateProfile.body.errors, undefined);
    assert.equal(
      updateProfile.body.data.updateRenter.user.name,
      "renter-updated",
    );
  });

  test("renter endpoints reject access to another renter's profile", { concurrency: false }, async () => {
    const outsider = await harness.createFixtureUser("RENTER");
    const cookieJar = await harness.signIn(
      renterFixture.email,
      renterFixture.password,
    );

    const result = await harness.graphql(
      `
        query Renter($id: ID!) {
          renter(id: $id) {
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
