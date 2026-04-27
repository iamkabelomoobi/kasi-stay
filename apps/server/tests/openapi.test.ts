import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createOpenApiDocument,
  renderSwaggerUiHtml,
} from "../src/app/openapi.ts";

test("openapi document exposes docs, auth, and graphql endpoints", () => {
  const document = createOpenApiDocument({
    serverUrl: "http://localhost:4100",
  });

  assert.equal(document.openapi, "3.1.0");
  assert.equal(document.info.title, "Kasi Stay Server API");
  assert.equal(document.servers[0]?.url, "http://localhost:4100");
  assert.ok(document.paths["/docs"]);
  assert.ok(document.paths["/openapi.json"]);
  assert.ok(document.paths["/graphql"]);
  assert.ok(document.paths["/api/auth/sign-up/email"]);
  assert.ok(document.paths["/api/auth/sign-in/email"]);
  assert.ok(document.paths["/api/auth/sign-out"]);
  assert.ok(document.paths["/api/auth/get-session"]);
});

test("swagger ui html points to the generated openapi document", () => {
  const html = renderSwaggerUiHtml();

  assert.match(html, /SwaggerUIBundle/);
  assert.match(html, /\/openapi\.json/);
  assert.match(html, /swagger-ui-dist@5/);
});
