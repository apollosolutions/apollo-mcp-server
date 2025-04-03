import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NamedTypeNode, NonNullTypeNode, OperationDefinitionNode, parse } from "graphql/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { PersistedQueries } from "../apollo/types";

// TODO: Rewrite this to use the new tool API vs. setting request handlers
export const defineTools = async (mcpServer: McpServer, persistedQueries: PersistedQueries) => {
	mcpServer.server.setRequestHandler(ListToolsRequestSchema, async () => {
		const tools: {
			name: string;
			description: string;
			inputSchema: { type: string; properties: any };
		}[] = [];
		persistedQueries.queries.forEach((pq) => {
			if (!pq.tool) {
				return;
			}
			let inputSchema = mapArgs(pq.body);
			let tool = {
				name: pq.name,
				description: pq.tool.description,
				inputSchema,
			};

			tools.push(tool);
		});
		return {
			tools,
		};
	});

	mcpServer.server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const query = persistedQueries.queries.get(request.params.name);
		let args = request.params.arguments;
		const result = await query?.resolve(args);
		const hasErrors = result.errors?.length > 0;
		const content = hasErrors ? result.errors : result.data;
		return {
			content: [
				{ type: "text", text: JSON.stringify(content), mimeType: "application/json" },
			],
			isError: hasErrors,
		};
	});
};

const mapArgs = (query: string): any => {
	const topLevelProps: {
		type: string;
		properties: any;
		required: string[];
	} = {
		type: "object",
		properties: {},
		required: [],
	};

	const ast = parse(query);
	let definition = ast.definitions[0] as OperationDefinitionNode;

	definition.variableDefinitions?.forEach((variable) => {
		let required = variable.type.kind === "NonNullType";
		topLevelProps.properties[variable.variable.name.value] = {
			type: mapTypes(((variable.type as NonNullTypeNode).type as NamedTypeNode).name.value),
		};
		if (required) {
			topLevelProps.required.push(variable.variable.name.value);
		}
	});
	return topLevelProps;
};

const mapTypes = (graphqlType: string): string => {
	switch (graphqlType) {
		case "Int":
			return "number";
		case "String":
			return "string";
	}
	return "";
};
