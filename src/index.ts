import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getPersistedQueries } from "./apollo/persistedqueries";
import { defineTools } from "./mcp/tools";
import { definePrompts } from "./mcp/prompts";
import { env } from "cloudflare:workers";

export class ApolloMcp extends McpAgent {
	server = new McpServer(
		{
			name: "Apollo GraphQL Example",
			version: "0.0.1",
		},
		{
			capabilities: {
				prompts: {},
				tools: {},
				logging: {},
			},
		},
	);

	async init() {
		const { APOLLO_KEY, GRAPH_ID, PERSISTED_QUERY_LIST_ID, GRAPHQL_URL } = env;
		if (!APOLLO_KEY || !GRAPH_ID || !PERSISTED_QUERY_LIST_ID || !GRAPHQL_URL) {
			throw new Error("Missing environment variables");
		}
		const persistedQueries = await getPersistedQueries(
			APOLLO_KEY,
			GRAPH_ID,
			PERSISTED_QUERY_LIST_ID,
			GRAPHQL_URL,
		);
		await defineTools(this.server, persistedQueries);
		await definePrompts(this.server, persistedQueries);
	}
}

// // Export the OAuth handler as the default
// export default new OAuthProvider({
// 	apiRoute: "/sse",
// 	// TODO: fix these types
// 	// @ts-ignore
// 	apiHandler: ApolloMcp.mount("/sse"),
// 	// @ts-ignore
// 	defaultHandler: app,
// 	authorizeEndpoint: "/authorize",
// 	tokenEndpoint: "/token",
// 	clientRegistrationEndpoint: "/register",
// });

export default ApolloMcp.mount("/sse");
