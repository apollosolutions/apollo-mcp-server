import { PersistedQueries } from "../apollo/types";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// TODO: Rewrite this to use the new prompts API vs. setting request handlers
export const definePrompts = async (mcpServer: McpServer, persistedQueries: PersistedQueries) => {
	mcpServer.server.setRequestHandler(ListPromptsRequestSchema, async () => {
		let prompts: {
			name: string;
			description: string;
			arguments: any[];
		}[] = [];
		persistedQueries.queries.forEach((query) => {
			if (!query.prompt) {
				return;
			}
			prompts.push({
				name: query.name,
				description: query.prompt.description,
				arguments: [],
			});
		});

		return { prompts };
	});

	mcpServer.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
		const name = request.params.name;
		const query = persistedQueries.queries.get(name);
		if (!query || !query.prompt) {
			throw new Error(`Prompt ${name} not found`);
		}
		return {
			messages: [
				{
					role: query.prompt.role,
					content: {
						type: "text",
						text: query.prompt.content,
					},
				},
			],
		};
	});
};
