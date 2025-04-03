import { PersistedQueryMetadata } from "./types";

/*
    Each entry in QUERIES consists of a key, which correlates to the ID of the PQ
    and a value which is a PersistedQueryMetadata object.
    The PersistedQueryMetadata object contains the following fields:
    +------------------------+
    | PersistedQueryMetadata |
    +------------------------+
    | name                   |  // Name of the query
    | prompt                 |  // Prompt details
    |   - role               |  // Role of the user (e.g., "user")
    |   - content            |  // The actual prompt content
    |   - description        |  // Human-readable description of the prompt
    | tool                   |  // Tool details
    |   - description        |  // Human-readable description of the tool
    +------------------------+
*/
export const QUERIES: Record<string, PersistedQueryMetadata> = {
	// BestSellers
	e508d687220aec7aa2206e5e4410942bf5cf6a34d7573140e82b6ae17f6cee5e: {
		name: "Best_Sellers",
		prompt: {
			role: "user",
			content: "Please tell me the best sellers",
			description: "Ask for the best selling products",
		},
		tool: {
			description: "A query to get the best selling products",
		},
	},
	// ProductById
	bcf47b4519778c42972d4ea1d4fecb402e0cf0ae16fdf6108eec6d279c101355: {
		name: "Product_By_ID",
		prompt: {
			role: "user",
			content: "Please get me a product by id",
			description: "Retrieve product information by its ID",
		},
		tool: {
			description: "A query to get a product by id",
		},
	},
	// AllProducts
	"022c94945de98f07512525a381d41e580972453c4458da2be9057c9b747e814b": {
		name: "All_Products",
		prompt: {
			role: "user",
			content: "Please get me all products",
			description: "Fetch all products",
		},
		tool: {
			description: "A query to get all products",
		},
	},
	// AllCategories
	"5f61eb018e0f3615664496fd164ceeb4e9e41b35a89a8a4395182a0302d5a47e": {
		name: "All_Categories",
		prompt: {
			role: "user",
			content: "Please get me all categories",
			description: "See all categories",
		},
		tool: {
			description: "A query to get all categories",
		},
	},
};
