# Figma MCP Server Setup

This project uses Figma's official MCP server to allow Claude Code to read and analyze Figma designs directly.

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

### Quick Setup (One Command)

Run this command in the project directory:

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

Then restart Claude Code. On first use, you'll be prompted to authenticate via your browser using your Figma account.

### Verify Connection

After restarting, ask Claude Code:
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

Each team member runs the `claude mcp add` command and authenticates with their own Figma account.

## Troubleshooting

**"Figma MCP not connected"**
- Run: `claude mcp add --transport http figma https://mcp.figma.com/mcp`
- Restart Claude Code

**"403 Forbidden" or "Access Denied"**
- Your Figma account may not have access to the file
- Request access from the file owner

**"Node not found"**
- Node IDs can change if frames are deleted/recreated in Figma
- Ask Claude to list all nodes in the file to find updated IDs
