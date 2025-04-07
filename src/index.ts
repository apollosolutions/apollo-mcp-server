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

// You could also use the default export to mount the agent using a wrapper for OAuth (or other authentication systems); for demo purposes we've removed it, but we highly recommend using it in production.
export default ApolloMcp.mount("/sse");
