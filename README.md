# GraphQL-based MCP Server using Cloudflare Workers

This repository contains a sample [model context protocol (MCP) server](https://modelcontextprotocol.io/introduction), utilizing both GraphQL and [Persisted Queries (PQs)](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries). This allows for large language models (LLMs) to leverage your existing GraphQL API to power AI-based experiences. 

This repository largely uses the template that [Cloudflare has created](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/) for a MCP server using Cloudflare Workers. 

**The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official [Apollo GraphQL GitHub organization](https://github.com/apollographql) are. If you need help you can file an issue on this repository, [contact Apollo](https://www.apollographql.com/contact-sales) to talk to an expert, or create a ticket directly in Apollo Studio.**

- [GraphQL-based MCP Server using Cloudflare Workers](#graphql-based-mcp-server-using-cloudflare-workers)
  - [Installation](#installation)
    - [GraphOS Setup](#graphos-setup)
    - [Manual steps](#manual-steps)
  - [Usage](#usage)
  - [Connect the MCP inspector to your server](#connect-the-mcp-inspector-to-your-server)
  - [Connect Claude Desktop to your local MCP server](#connect-claude-desktop-to-your-local-mcp-server)
  - [Deploying](#deploying)
    - [Call your newly deployed remote MCP server from a remote MCP client](#call-your-newly-deployed-remote-mcp-server-from-a-remote-mcp-client)
    - [Connect Claude Desktop to your remote MCP server](#connect-claude-desktop-to-your-remote-mcp-server)
  - [Known Limitations](#known-limitations)

## Installation

To get started, you will need: 

- A paid Cloudflare account, and access to create:
  - Cloudflare Workers
  - KV Store
  - Durable Storage
- A GraphOS account

### GraphOS Setup

First, we'll want to setup the necessary GraphOS components before setting up Cloudflare (if desired). 

1. Follow the instructions outlined in [the Persisted Queries docs](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries) to create a new list
2. Gather the operations you'd like to use for your MCP server. This can be as little or as many as you'd like, but we'd recommend starting small as there are steps needed in the repository to publish them to your server
3. Publish your operations, using the instructions [on the Persisted Query documentation](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries#3-operation-registration)
   1. Depending on situation, you may want to use a simpler repository (such as reusing this one), [so follow the instructions for using Apollo Client Web](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries#apollo-client-web)
4. Once published, make sure to link the list to your variant you'd like to use and note the ID for the list
5. Lastly, retrieve an Apollo API key to be used to fetch the PQ list

### Manual steps

There's one more step before you can run this locally, which is to update the PQ metadata for the list being used. This step does require some work to do, so consider doing this incrementally to more easily adopt this. 

To do, so, you'll need to edit the [`src/apollo/pq-metadata.ts`](./src/apollo/pq-metadata.ts) file to contain the appropriate metadata for your persisted queries. The file contains a small breakdown of the fields available, but in summary:

- The key of the object (the top-level string provided) is the same as the PQ hash that's contained within your manifest (as well as being visible on GraphOS Studio)
  - To see an example of this, see the [example manifest the current metadata is based off of](./example/persisted-query-manifest.json)
- Each object then contains:
  - A name for the tool and/or prompt
  - Information about the prompt
    - The role for the prompt
    - Content for the prompt to show the user
    - A human-readable description
  - Information about the tool
    - A human-readable description

Once you've updated the metadata, you should be good to move onto the last few things. 

1. We'll now need to make another copied file here, this time the [`.dev.vars.example`](./.dev.vars.example) file to be moved to `.dev.vars`. 
2. Within this file, we'll now need to add the Apollo API key we generated earlier into the existing `APOLLO_KEY` line
3. Copy the [example Wrangler config](./example-wrangler.jsonc) to `wrangler.jsonc`
4. Within the newly created `wrangler.jsonc` file, we'll want to then update the `vars` block to contain: 
   1. The graph ID (same as the one in the Studio URL or the first part of the `graph@variant` format of an Apollo graph ref)
   2. The PQ list ID created earlier
   3. The endpoint the service will hit
5. Lastly run `npm install` to install the necessary dependencies

## Usage

Once configured, you can start the process by running `npm run start` within the directory. This should spin up the MCP API on `http://localhost:8787`, exposing an SSE endpoint on `/sse`. 

You can now use the API with either of the following.

## Connect the MCP inspector to your server

To explore the MCP api, you can use the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector).

- Start it with `npx @modelcontextprotocol/inspector`
- [Within the inspector](http://localhost:5173), switch the Transport Type to `SSE` and enter `http://localhost:8787/sse` as the URL of the MCP server to connect to, and click "Connect"

## Connect Claude Desktop to your local MCP server

Follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config to find your configuration file.

Open the file in your text editor and replace it with this configuration:

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"
      ]
    }
  }
}
```

This will run a local proxy and let Claude talk to your MCP server over HTTP.

## Deploying

The next steps to deploy the application are: 

1. Create a new Cloudflare KV store for use with this worker. To do so, please see [Cloudflare's KV documentation](https://developers.cloudflare.com/kv/get-started/)
2. Once you've created it, add the ID to the `kv_namespaces` block within the newly copied configuration
3. Run `npm run deploy`

That's it! You should now have a deployed copy of this application. 

### Call your newly deployed remote MCP server from a remote MCP client

Just like you did above in "Develop locally", run the MCP inspector:

`npx @modelcontextprotocol/inspector@latest`

Then enter the `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) of your Worker in the inspector as the URL of the MCP server to connect to, and click "Connect".

You've now connected to your MCP server from a remote MCP client.

### Connect Claude Desktop to your remote MCP server

Update the Claude configuration file to point to your `workers.dev` URL (ex: `worker-name.account-name.workers.dev/sse`) and restart Claude 

```json
{
  "mcpServers": {
    "math": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://worker-name.account-name.workers.dev/sse"
      ]
    }
  }
}
```

## Known Limitations

List any limitations of the project here:

- The current implementation does not require authentication/authorization, and is something you should do
  - [Cloudflare has created](https://blog.cloudflare.com/remote-model-context-protocol-servers-mcp/) a template, which has an example of using it with an OAuth provider
- Metadata currently has to be associated to the PQ list manually, which can be tedious for large PQ lists
  - This is largely due to limitations in how Cloudflare Workers are bundled, and how JSON files cannot be accessed without also making them publicly via static assets

