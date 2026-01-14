# Figma MCP Server Setup

This project uses the Figma MCP server to allow Claude Code to read and analyze Figma designs directly.

## Figma Design File

**URL:** https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow

### Screen Node IDs

| Screen | Node ID | Implemented Page |
|--------|---------|------------------|
| 1.0 Dashboard | `34:3404` | `src/pages/Dashboard.tsx` |
| 2.0 Search Results | `34:3742` | `src/pages/SearchResults.tsx` |
| 3.0 Results Detail (Matter) | `34:4313` | `src/pages/MatterDetail.tsx` |
| 4.0 Document List (Queue) | `160:15757` | `src/pages/DocumentQueue.tsx` |
| 5.0 HITL Verification | `169:16552` | `src/pages/DocumentVerification.tsx` |
| 5.1 HITL Edit | `172:19076` | `src/pages/DocumentVerification.tsx` (edit mode) |

## Setup Instructions

### 1. Generate a Figma Personal Access Token

1. Log into Figma (use your corporate account that has access to the IDMS-Screen-Flow file)
2. Go to **Account Settings** → **Personal Access Tokens**
3. Click **Generate new token**
4. Give it a description like "Claude Code MCP"
5. Copy the token (you won't be able to see it again)

### 2. Configure the MCP Server

Copy the example configuration and add your token:

```bash
cp .mcp.json.example .mcp.json
```

Edit `.mcp.json` and replace the placeholder with your token:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropics/mcp-server-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-actual-token-here"
      }
    }
  }
}
```

**Note:** `.mcp.json` is gitignored to protect your personal access token. Never commit tokens to the repository.

### 3. Restart Claude Code

After configuring the token, restart Claude Code to pick up the MCP server configuration.

### 4. Verify Connection

Ask Claude Code to read a Figma file:

```
Read the Figma design at https://www.figma.com/design/bsYh8MXSoGgmSO8CNAFZQ9/IDMS-Screen-Flow and list all screens
```

## Using Figma MCP with Claude Code

Once connected, you can ask Claude Code to:

- **Read specific screens:** "Show me the layout of node 34:3404 (Dashboard)"
- **Compare designs:** "Compare the Figma Search Results screen to our implementation"
- **Extract styles:** "What colors and spacing are used in the HITL Verification screen?"
- **Generate components:** "Create a React component matching the Figma design for [screen]"

## Team Access

The following accounts have access to the Figma file:
- taimur@googlecloud.corp-partner.google.com
- (Add other team member emails here)

Each team member needs to generate their own Personal Access Token using their Figma account.

## Troubleshooting

**"Figma MCP not connected"**
- Ensure `.mcp.json` is in the project root
- Verify your `FIGMA_ACCESS_TOKEN` is set correctly
- Restart Claude Code

**"403 Forbidden" or "Access Denied"**
- Your Figma account may not have access to the file
- Request access from the file owner
- Verify your token hasn't expired

**"Node not found"**
- Node IDs can change if frames are deleted/recreated in Figma
- Ask Claude to list all nodes in the file to find updated IDs
