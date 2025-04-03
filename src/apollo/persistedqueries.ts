import { McpServerPqListQuery, PersistedQueryEdge } from "../generated/graphql.js";
import { Client, fetchExchange, gql } from "@urql/core";
import { QUERIES } from "./pq-metadata.js";
import { PersistedQueries, PersistedQuery } from "./types.js";
import { env } from "cloudflare:workers";

const client = (serverConfig: { name: string; version: string }, url: string, apikey: string) =>
	new Client({
		url,
		exchanges: [fetchExchange],
		fetchOptions: {
			headers: {
				"apollographql-client-name": serverConfig.name,
				"apollographql-client-version": serverConfig.version,
				"X-API-KEY": apikey,
			},
		},
	});

const PERSISTED_QUERIES_QUERY = gql`
    query MCPServerPQList($graphId: ID!, $persistedQueryListId: ID!,  $last: Int) {
        graph(id: $graphId) {
            persistedQueryList(id: $persistedQueryListId) {
                id
                name
                operations(last: $last) {
                    edges {
                        node {
                            body
                            id
                        }
                    }
                }
            }
        }
    }`;
export const getPersistedQueries = async (
	apiKey: string,
	graphId: string,
	persistedQueriesId: string,
	url: string,
): Promise<PersistedQueries> => {
	try {
		let data: McpServerPqListQuery | undefined;
		let existingPQ = await env.APOLLO_KV.get("PERSISTED_QUERIES");
		if (existingPQ) {
			data = JSON.parse(existingPQ);
		} else {
			let response = await client(
				{
					name: "apollosolutions-mcp-server",
					version: "0.0.1",
				},
				"https://graphql.api.apollographql.com/api/graphql",
				apiKey,
			)
				.query(PERSISTED_QUERIES_QUERY, {
					graphId: graphId,
					persistedQueryListId: persistedQueriesId,
					last: 50,
				})
				.toPromise();
			if (response.error) {
				throw new Error(response.error.message);
			}
			if (!response.data) {
				throw new Error("No data found");
			}
			data = response.data;
			if (data) {
				await env.APOLLO_KV.put("PERSISTED_QUERIES", JSON.stringify(data), {
					expirationTtl: 60, // expire for a minute to help keep it fresh, but not requiring constant fetches
				});
			}
		}

		if (!data || !data.graph || !data.graph.persistedQueryList) {
			throw new Error("No data found");
		}
		const { id, name, operations } = data.graph.persistedQueryList;
		const map = new Map<string, PersistedQuery>();

		operations.edges.map((edge) => {
			const query = QUERIES[edge.node.id];
			if (!query) {
				return;
			}
			let pq: PersistedQuery = {
				name: query.name,
				body: edge.node.body,
				resolve: resolveFn(url, edge.node.body), // placeholder gql API for now
				prompt: query.prompt,
				tool: query.tool,
			};
			map.set(pq.name, pq);
		});

		return {
			id,
			name,
			queries: map,
		};
	} catch (error) {
		console.error("Error fetching persisted queries:", error);
		throw error;
	}
};
type GraphQLResolver = (args: any) => Promise<any>;

const resolveFn = (uri: string, queryBody: string): GraphQLResolver => {
	return async function (args) {
		const body = JSON.stringify({
			query: queryBody,
			variables: args !== undefined ? args : {},
		});
		let fetchResponse = await fetch(uri, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: body,
		});
		return await fetchResponse.json();
	};
};
