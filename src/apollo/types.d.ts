export interface PersistedQueries {
	id: string;
	name: string;
	queries: Map<string, PersistedQuery>;
}

export interface PersistedQueryTool {
	description: string;
}

export interface PersistedQueryPrompt {
	content: string;
	description: string;
	role: string;
}

export interface PersistedQuery {
	name: string;
	body: string;
	resolve: (args?: Record<string, any>) => Promise<any>;
	prompt?: PersistedQueryPrompt;
	tool?: PersistedQueryTool;
}

export interface PersistedQueryResolverResult {
	type: string;
	text: string;
	mimeType: string;
}

export interface PersistedQueryMetadata {
	name: string;
	prompt?: PersistedQueryPrompt;
	tool?: PersistedQueryTool;
}
