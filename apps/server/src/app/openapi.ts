import { config } from "../infra";

type OpenApiDocumentOptions = {
  serverUrl?: string;
};

const markdownList = (items: string[]): string =>
  items.map((item) => `- \`${item}\``).join("\n");

const graphqlOperations = [
  "properties, property, propertyMediaUploadTarget",
  "roommateProfiles, myRoommateProfile, upsertRoommateProfile",
  "marketplaceItems, createMarketplaceItem, publishMarketplaceItem",
  "serviceListings, createServiceListing, requestService",
  "conversations, messages, sendMessage, markConversationRead",
  "articles, articleBySlug, staticPages, careerPosts",
  "applyAsAgent, requestAgencyAdvertising, contactMessages",
];

export const createOpenApiDocument = (
  options: OpenApiDocumentOptions = {},
) => {
  const serverUrl = options.serverUrl ?? config.server.url;

  return {
    openapi: "3.1.0",
    info: {
      title: "Kasi Stay Server API",
      version: "1.0.0",
      description: [
        "OpenAPI reference for the Kasi Stay HTTP surface.",
        "",
        "The platform is primarily GraphQL-first. Swagger documents the shared transport endpoints, authentication flows, and the GraphQL entrypoint.",
        "",
        "Common GraphQL operations include:",
        markdownList(graphqlOperations),
        "",
        "For the full typed GraphQL contract, also see the exported `schema.graphql` artifact in `packages/client/schema.graphql`.",
      ].join("\n"),
    },
    servers: [
      {
        url: serverUrl,
        description: "Current server base URL",
      },
    ],
    tags: [
      {
        name: "Documentation",
        description: "Swagger/OpenAPI discovery endpoints",
      },
      {
        name: "Authentication",
        description: "Better Auth HTTP endpoints used by web and mobile clients",
      },
      {
        name: "GraphQL",
        description: "Primary API transport for property, marketplace, services, and CMS features",
      },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description:
            "Better Auth session cookie. The exact cookie set is managed by Better Auth during sign-in and sign-up flows.",
        },
      },
      schemas: {
        SignUpEmailRequest: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            name: { type: "string", minLength: 1 },
          },
        },
        SignInEmailRequest: {
          type: "object",
          additionalProperties: false,
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        AuthSuccessResponse: {
          type: "object",
          additionalProperties: true,
          description:
            "Better Auth response payload. Cookies are the primary session transport.",
        },
        SessionUser: {
          type: "object",
          additionalProperties: true,
          required: ["id", "name", "email", "role"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["ADMIN", "AGENT", "OWNER", "BUYER", "RENTER"],
            },
            image: {
              anyOf: [{ type: "string", format: "uri" }, { type: "null" }],
            },
          },
        },
        SessionState: {
          type: "object",
          additionalProperties: true,
          required: ["id", "token", "expiresAt"],
          properties: {
            id: { type: "string" },
            token: { type: "string" },
            expiresAt: { type: "string", format: "date-time" },
          },
        },
        AuthSessionResponse: {
          type: "object",
          additionalProperties: true,
          required: ["user", "session"],
          properties: {
            user: { $ref: "#/components/schemas/SessionUser" },
            session: { $ref: "#/components/schemas/SessionState" },
          },
        },
        GraphQLRequest: {
          type: "object",
          additionalProperties: false,
          required: ["query"],
          properties: {
            query: {
              type: "string",
              description: "GraphQL document string",
            },
            operationName: {
              anyOf: [{ type: "string" }, { type: "null" }],
            },
            variables: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
        GraphQLError: {
          type: "object",
          additionalProperties: true,
          required: ["message"],
          properties: {
            message: { type: "string" },
            path: {
              type: "array",
              items: {
                anyOf: [{ type: "string" }, { type: "integer" }],
              },
            },
            extensions: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
        GraphQLResponse: {
          type: "object",
          additionalProperties: true,
          properties: {
            data: {
              anyOf: [{ type: "object", additionalProperties: true }, { type: "null" }],
            },
            errors: {
              type: "array",
              items: { $ref: "#/components/schemas/GraphQLError" },
            },
          },
        },
      },
    },
    paths: {
      "/docs": {
        get: {
          tags: ["Documentation"],
          summary: "Render Swagger UI",
          description:
            "Serves the interactive Swagger/OpenAPI browser for the Kasi Stay server.",
          responses: {
            "200": {
              description: "Swagger UI HTML",
              content: {
                "text/html": {
                  schema: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
      "/openapi.json": {
        get: {
          tags: ["Documentation"],
          summary: "Fetch the OpenAPI document",
          responses: {
            "200": {
              description: "OpenAPI 3.1 JSON document",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    additionalProperties: true,
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-up/email": {
        post: {
          tags: ["Authentication"],
          summary: "Register a user with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignUpEmailRequest" },
              },
            },
          },
          responses: {
            "200": {
              description:
                "User created and session cookies established by Better Auth",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-in/email": {
        post: {
          tags: ["Authentication"],
          summary: "Sign in with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignInEmailRequest" },
              },
            },
          },
          responses: {
            "200": {
              description:
                "Session established and returned through Better Auth cookies",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/sign-out": {
        post: {
          tags: ["Authentication"],
          summary: "Sign out the current user",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": {
              description: "Session cleared",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/get-session": {
        get: {
          tags: ["Authentication"],
          summary: "Get the current authenticated session",
          security: [{ sessionCookie: [] }],
          responses: {
            "200": {
              description: "Current session or null when unauthenticated",
              content: {
                "application/json": {
                  schema: {
                    anyOf: [
                      { $ref: "#/components/schemas/AuthSessionResponse" },
                      { type: "null" },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      "/graphql": {
        post: {
          tags: ["GraphQL"],
          summary: "Execute GraphQL operations",
          description: [
            "Primary API transport for Kasi Stay.",
            "",
            "Use this endpoint for property listings, saved searches, alerts, reviews, messaging, marketplace, roommates, services, CMS content, careers, and professional onboarding.",
            "",
            "Some operations are public and others require the Better Auth session cookie.",
          ].join("\n"),
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GraphQLRequest" },
                examples: {
                  listProperties: {
                    summary: "Query published properties",
                    value: {
                      query:
                        "query Properties { properties { id title status } }",
                    },
                  },
                  sendMessage: {
                    summary: "Send a message in a conversation",
                    value: {
                      query:
                        "mutation SendMessage($conversationId: ID!, $input: SendMessageInput!) { sendMessage(conversationId: $conversationId, input: $input) { id body } }",
                      variables: {
                        conversationId: "conversation-id",
                        input: {
                          body: "Hello from Swagger",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "GraphQL execution result",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GraphQLResponse" },
                },
              },
            },
          },
        },
      },
    },
  };
};

export const renderSwaggerUiHtml = (): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Kasi Stay API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
    <style>
      body {
        margin: 0;
        background: #f6f7fb;
      }

      .swagger-ui .topbar {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          displayRequestDuration: true,
          docExpansion: "list",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "BaseLayout",
        });
      };
    </script>
  </body>
</html>`;
