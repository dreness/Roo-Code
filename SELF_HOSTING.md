# Self-Hosting Roo Cloud

This guide explains how to replace the official Roo Cloud service with a self-hosted alternative that integrates with Roo Code.

## Overview

Roo Code integrates with Roo Cloud to provide:

- **Authentication & Authorization** - OAuth-based user authentication with organization support
- **Cloud-based AI Models** - Access to AI models through a proxy service
- **Task Sharing** - Share coding tasks with team members
- **Remote Control (Roomote)** - Control VS Code extension instances from a web dashboard
- **Settings Management** - Centralized organization and user settings
- **Telemetry** - Usage analytics and event tracking
- **Credit Management** - User credit balance for AI model usage

## Architecture

The Roo Code extension connects to three main services:

1. **Authentication Service** (Clerk-compatible OAuth provider)
2. **API Service** (RESTful backend API)
3. **Provider Proxy Service** (OpenAI-compatible API proxy)

Optional components:

- **Socket Bridge Service** (Socket.io server for Roomote real-time control)

## Configuration

Configure your self-hosted services using environment variables in VS Code:

### Required Environment Variables

```bash
# Authentication Service URL (Clerk-compatible OAuth provider)
CLERK_BASE_URL=https://your-auth-service.example.com

# API Service URL (Main backend API)
ROO_CODE_API_URL=https://your-api-service.example.com

# Provider Proxy URL (OpenAI-compatible API endpoint)
ROO_CODE_PROVIDER_URL=https://your-provider-service.example.com/proxy
```

### Setting Environment Variables

**Option 1: VS Code Settings**

Add to your VS Code `settings.json`:

```json
{
	"terminal.integrated.env.linux": {
		"CLERK_BASE_URL": "https://your-auth-service.example.com",
		"ROO_CODE_API_URL": "https://your-api-service.example.com",
		"ROO_CODE_PROVIDER_URL": "https://your-provider-service.example.com/proxy"
	},
	"terminal.integrated.env.osx": {
		"CLERK_BASE_URL": "https://your-auth-service.example.com",
		"ROO_CODE_API_URL": "https://your-api-service.example.com",
		"ROO_CODE_PROVIDER_URL": "https://your-provider-service.example.com/proxy"
	},
	"terminal.integrated.env.windows": {
		"CLERK_BASE_URL": "https://your-auth-service.example.com",
		"ROO_CODE_API_URL": "https://your-api-service.example.com",
		"ROO_CODE_PROVIDER_URL": "https://your-provider-service.example.com/proxy"
	}
}
```

**Option 2: System Environment Variables**

Set environment variables before launching VS Code:

```bash
export CLERK_BASE_URL=https://your-auth-service.example.com
export ROO_CODE_API_URL=https://your-api-service.example.com
export ROO_CODE_PROVIDER_URL=https://your-provider-service.example.com/proxy
code .
```

**Option 3: Development (.env file)**

For local development, create a `.env` file in the repository root:

```bash
CLERK_BASE_URL=http://localhost:3001
ROO_CODE_API_URL=http://localhost:3000
ROO_CODE_PROVIDER_URL=http://localhost:8080/proxy
```

Note: See `.env.sample` for a template.

## API Service Requirements

Your API service must implement the following REST endpoints:

### Authentication Endpoints

These endpoints follow the Clerk OAuth flow. You can use Clerk or implement a compatible service.

**GET** `/v1/client/sign_ins`

- Initialize OAuth sign-in flow
- Response: Sign-in session details

**POST** `/v1/client/sign_ins/{sign_in_id}/prepare_first_factor`

- Prepare OAuth first factor authentication
- Body: `{ "strategy": "oauth_custom", "redirect_url": string }`

**GET** `/v1/me`

- Get authenticated user information
- Headers: `Authorization: Bearer {client_token}`
- Response:

```json
{
	"response": {
		"id": "user_id",
		"first_name": "John",
		"last_name": "Doe",
		"image_url": "https://...",
		"primary_email_address_id": "email_id",
		"email_addresses": [{ "id": "email_id", "email_address": "user@example.com" }],
		"public_metadata": {}
	}
}
```

**GET** `/v1/me/organization_memberships`

- Get user's organization memberships
- Headers: `Authorization: Bearer {client_token}`
- Response:

```json
{
	"response": [
		{
			"id": "membership_id",
			"role": "admin",
			"permissions": ["org:manage"],
			"created_at": 1234567890,
			"updated_at": 1234567890,
			"organization": {
				"id": "org_id",
				"name": "Organization Name",
				"slug": "org-slug",
				"image_url": "https://...",
				"has_image": true
			}
		}
	]
}
```

**POST** `/v1/client/sessions/{session_id}/tokens`

- Create session token (JWT)
- Headers: `Authorization: Bearer {client_token}`
- Response:

```json
{
	"jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Extension API Endpoints

**GET** `/api/extension-settings`

- Get organization and user settings
- Headers: `Authorization: Bearer {session_token}`
- Response:

```json
{
	"organization": {
		"version": 1,
		"cloudSettings": {
			"recordTaskMessages": true,
			"enableTaskSharing": true,
			"allowPublicTaskSharing": true,
			"taskShareExpirationDays": 30,
			"allowMembersViewAllTasks": true,
			"workspaceTaskVisibility": "all",
			"llmEnhancedFeaturesEnabled": false
		},
		"defaultSettings": {
			"maxOpenTabsContext": 10,
			"maxReadFileLine": 5000,
			"maxWorkspaceFiles": 1000,
			"terminalOutputLineLimit": 500
		},
		"allowList": {
			"allowAll": true,
			"providers": {}
		},
		"features": {
			"roomoteControlEnabled": false
		},
		"providerProfiles": {},
		"mcps": [],
		"hiddenMcps": [],
		"hideMarketplaceMcps": false
	},
	"user": {
		"version": 1,
		"features": {
			"roomoteControlEnabled": false
		},
		"settings": {
			"extensionBridgeEnabled": false,
			"taskSyncEnabled": true,
			"llmEnhancedFeaturesEnabled": false
		}
	}
}
```

**POST** `/api/user-settings`

- Update user settings
- Headers: `Authorization: Bearer {session_token}`
- Body: Partial user settings to update
- Response: Updated user settings

**POST** `/api/extension/share`

- Share a task
- Headers: `Authorization: Bearer {session_token}`
- Body:

```json
{
	"taskId": "task_id",
	"visibility": "organization" // or "public"
}
```

- Response:

```json
{
	"success": true,
	"shareUrl": "https://your-app.com/share/abc123",
	"isNewShare": true,
	"manageUrl": "https://your-app.com/tasks/manage"
}
```

**GET** `/api/extension/credit-balance`

- Get user's credit balance
- Headers: `Authorization: Bearer {session_token}`
- Response:

```json
{
	"balance": 100.5
}
```

**GET** `/api/extension/bridge/config`

- Get socket bridge configuration (for Roomote control)
- Headers: `Authorization: Bearer {session_token}`
- Response:

```json
{
	"userId": "user_id",
	"socketBridgeUrl": "https://your-socket-service.example.com",
	"token": "bridge_auth_token"
}
```

### Telemetry Endpoints

**POST** `/api/events`

- Send telemetry events
- Headers: `Authorization: Bearer {session_token}`
- Body:

```json
{
	"name": "event_name",
	"properties": {
		"key": "value"
	}
}
```

**POST** `/api/events/backfill`

- Backfill historical telemetry events
- Headers: `Authorization: Bearer {session_token}`
- Body: Array of telemetry events

## Provider Proxy Service Requirements

Your provider proxy must implement an OpenAI-compatible API at `/v1`:

**POST** `/v1/chat/completions`

- OpenAI-compatible chat completions endpoint
- Headers: `Authorization: Bearer {session_token}`
- Body: Standard OpenAI chat completion request
- Response: Standard OpenAI chat completion response (streaming or non-streaming)

**GET** `/models`

- List available AI models
- Headers: `Authorization: Bearer {session_token}`
- Response:

```json
{
	"data": [
		{
			"id": "model-id",
			"name": "Model Name",
			"provider": "provider-name",
			"maxTokens": 8000,
			"contextWindow": 100000,
			"supportsImages": true,
			"supportsPromptCache": true,
			"inputPrice": 0.003,
			"outputPrice": 0.015
		}
	]
}
```

The provider proxy should:

- Authenticate requests using the session token
- Route requests to appropriate AI model providers
- Track token usage and costs
- Apply rate limiting and credit checks

## Socket Bridge Service (Optional)

For Roomote control features, implement a Socket.io server that:

### Connection

- Accepts WebSocket connections at the URL from `/api/extension/bridge/config`
- Authenticates using the token from bridge config
- Manages user-specific rooms for pub/sub messaging

### Event Types

**Extension → Server (Extension Instance Events)**

- `instance_registered` - Extension instance connected
- `instance_unregistered` - Extension instance disconnected
- `heartbeat_updated` - Periodic heartbeat (every 20s)
- Task lifecycle events: `task_created`, `task_started`, `task_completed`, `task_aborted`
- Task state events: `task_focused`, `task_unfocused`, `task_active`, `task_idle`
- `mode_changed` - Mode switched
- `provider_profile_changed` - Provider profile changed

**Server → Extension (Commands)**

- `start_task` - Start a new task
- `stop_task` - Stop a running task
- `resume_task` - Resume a task

**Task Messages (Bidirectional)**

- `message` - Send message to task
- `approve_ask` - Approve a pending ask
- `deny_ask` - Deny a pending ask

### Event Schema

All events include:

- `type` - Event/command name
- `timestamp` - Unix timestamp in milliseconds
- `instance` - Extension instance details (for instance events)
- `taskId` - Task identifier (for task-specific commands)
- `payload` - Event-specific data

See `packages/types/src/cloud.ts` for complete schemas.

## JWT Token Format

Session tokens should be JWTs with the following payload:

```json
{
	"iss": "your-service",
	"sub": "user_id",
	"exp": 1234567890,
	"iat": 1234567890,
	"nbf": 1234567890,
	"v": 1,
	"r": {
		"u": "user_id",
		"o": "organization_id",
		"t": "auth"
	}
}
```

Where:

- `iss` - Issuer identifier
- `sub` - Subject (user ID)
- `exp` - Expiration timestamp
- `iat` - Issued at timestamp
- `nbf` - Not before timestamp
- `v` - Token version (use 1)
- `r.u` - User ID
- `r.o` - Organization ID (null for personal account)
- `r.t` - Token type ("auth" for authentication tokens)

## Security Considerations

1. **HTTPS Required**: All services should use HTTPS in production
2. **CORS Configuration**: Configure CORS to allow requests from VS Code extension
3. **Token Expiration**: Implement reasonable token expiration (session tokens refresh every ~50 seconds)
4. **Rate Limiting**: Implement rate limiting on all endpoints
5. **Input Validation**: Validate all inputs using the provided Zod schemas
6. **Authentication**: Verify session tokens on all protected endpoints
7. **Authorization**: Implement proper organization-based access control

## Minimal Implementation

A minimal self-hosted setup requires:

1. **Authentication Service** - Can use Clerk (https://clerk.com) or implement compatible OAuth flow
2. **API Service** - Backend API implementing the extension endpoints
3. **Provider Proxy** - OpenAI-compatible proxy to your AI model providers

Optional: 4. **Socket Bridge** - Only needed if you want Roomote remote control features

## Testing Your Setup

1. Set environment variables for your services
2. Launch VS Code with Roo Code extension installed
3. Open Roo Code extension panel
4. Click "Cloud" tab and attempt to sign in
5. Verify authentication flow completes
6. Test creating a task to verify provider proxy works
7. Check that organization settings are loaded correctly

## Troubleshooting

### Extension doesn't connect to self-hosted services

- Verify environment variables are set correctly
- Check that services are accessible from your machine
- Review browser console and VS Code Developer Tools for error messages

### Authentication fails

- Verify Clerk configuration or OAuth implementation
- Check that redirect URLs are configured correctly
- Ensure CORS headers allow VS Code extension origin

### AI models don't load

- Verify provider proxy URL is correct and includes `/v1` suffix
- Check that `/models` endpoint returns valid model list
- Verify session token is being sent in Authorization header

### Settings don't sync

- Verify `/api/extension-settings` endpoint is working
- Check response format matches expected schema
- Review error logs in extension developer tools

## Reference Implementation

The official Roo Cloud services can be used as a reference for expected behavior. The extension will default to:

- `CLERK_BASE_URL`: `https://clerk.roocode.com`
- `ROO_CODE_API_URL`: `https://app.roocode.com`
- `ROO_CODE_PROVIDER_URL`: `https://api.roocode.com/proxy`

## Schema Validation

All API responses should match the schemas defined in `packages/types/src/cloud.ts`. Use these schemas to validate your implementation:

- `organizationSettingsSchema` - Organization settings structure
- `userSettingsDataSchema` - User settings structure
- `shareResponseSchema` - Share task response
- `extensionBridgeEventSchema` - Socket events from extension
- `extensionBridgeCommandSchema` - Socket commands to extension
- `taskBridgeEventSchema` - Task-specific events
- `taskBridgeCommandSchema` - Task-specific commands

## Support

For questions about self-hosting:

1. Review this documentation thoroughly
2. Check the TypeScript type definitions in `packages/types/src/cloud.ts`
3. Examine the cloud service implementation in `packages/cloud/src/`
4. Join the [Roo Code Discord](https://discord.gg/roocode) for community support

## License

When implementing a self-hosted alternative, ensure you comply with:

- Roo Code's license terms
- Any third-party service licenses (e.g., AI model providers)
- Privacy and data protection regulations applicable to your use case
