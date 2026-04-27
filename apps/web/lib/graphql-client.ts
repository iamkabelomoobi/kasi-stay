import { headers } from "next/headers"
import { print } from "graphql"
import type { TypedDocumentNode } from "@graphql-typed-document-node/core"

const graphQLBaseURL =
  process.env.SERVER_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_AUTH_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:4000"

type GraphQLError = {
  message: string
}

type GraphQLResponse<TData> = {
  data?: TData
  errors?: GraphQLError[]
}

export async function fetchGraphQL<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables?: TVariables,
): Promise<TData> {
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  const response = await fetch(`${graphQLBaseURL}/graphql`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({
      query: print(document),
      variables: variables ?? {},
    }),
  })

  const payload = (await response.json()) as GraphQLResponse<TData>

  if (!response.ok) {
    throw new Error(`GraphQL request failed with status ${response.status}`)
  }

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message || "GraphQL request failed")
  }

  if (!payload.data) {
    throw new Error("GraphQL request returned no data")
  }

  return payload.data
}
