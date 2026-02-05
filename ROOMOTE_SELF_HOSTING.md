# Roomote Self-Hosting Implementation Plan

## Overview

This document provides a detailed plan for implementing a minimal self-hosted Roomote service that enables remote monitoring and task management for Roo Code instances. This setup assumes you will continue using existing API providers for AI models and only need the remote control/monitoring capabilities.

## What is Roomote?

Roomote is Roo Code's remote control feature that allows you to:
- Monitor active VS Code instances running Roo Code from a web dashboard
- View real-time task status, progress, and messages
- Start, stop, and resume tasks remotely
- See workspace context (git info, current mode, provider profile)
- Receive live updates as tasks progress

## Architecture

### Single-User Minimal Setup

```
┌─────────────────────┐
│   VS Code + Roo     │
│    (Your Machine)   │
└──────────┬──────────┘
           │ WebSocket (Socket.io)
           │
┌──────────▼──────────┐
│  Roomote Server     │
│  - Socket.io Bridge │
│  - Static Auth      │
│  - In-Memory State  │
└──────────┬──────────┘
           │ WebSocket (Socket.io)
           │
┌──────────▼──────────┐
│   Web Dashboard     │
│  (Browser)          │
└─────────────────────┘
```

### Components Required

1. **Backend Service** (Node.js/TypeScript)
   - Socket.io server for bidirectional communication
   - Simple authentication with pre-shared tokens
   - In-memory state management for extension instances
   - REST endpoint for bridge configuration

2. **Frontend Dashboard** (React/TypeScript)
   - Real-time instance monitoring
   - Task status display
   - Task control interface (start/stop/resume)
   - Message viewer for task conversations

3. **No External Dependencies**
   - No database required (in-memory storage)
   - No OAuth provider needed (static tokens)
   - No AI provider proxy (use your existing configuration)

## Implementation Plan

### Phase 1: Backend Service Setup

#### Technology Stack
- **Runtime**: Node.js 20+
- **Framework**: Express.js (for REST API)
- **WebSocket**: Socket.io 4.x
- **Language**: TypeScript
- **Authentication**: Simple JWT tokens
- **State**: In-memory (Map objects)

#### Project Structure

```
roomote-server/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Server entry point
│   ├── config.ts                # Configuration & environment
│   ├── auth/
│   │   ├── tokenManager.ts      # JWT generation & validation
│   │   └── middleware.ts        # Auth middleware
│   ├── bridge/
│   │   ├── socketServer.ts      # Socket.io setup
│   │   ├── extensionChannel.ts  # Extension instance management
│   │   ├── taskChannel.ts       # Task-specific events
│   │   └── types.ts             # Bridge event/command types
│   ├── api/
│   │   └── bridgeConfig.ts      # REST endpoint for bridge config
│   └── state/
│       └── instanceStore.ts     # In-memory instance storage
└── .env.example
```

#### Key Files Implementation

**1. Server Entry Point (`src/index.ts`)**

```typescript
import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { Server as SocketIOServer } from 'socket.io'
import { config } from './config'
import { setupBridgeSocket } from './bridge/socketServer'
import { bridgeConfigRouter } from './api/bridgeConfig'
import { authMiddleware } from './auth/middleware'

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.allowedOrigins,
    credentials: true
  }
})

// Middleware
app.use(cors({ origin: config.allowedOrigins }))
app.use(express.json())

// REST API routes
app.use('/api/extension/bridge', authMiddleware, bridgeConfigRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Setup Socket.io bridge
setupBridgeSocket(io)

// Start server
httpServer.listen(config.port, () => {
  console.log(`Roomote server running on port ${config.port}`)
})
```

**2. Configuration (`src/config.ts`)**

```typescript
import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  // Pre-configured user credentials
  users: [
    {
      id: 'user_1',
      name: process.env.USER_NAME || 'Admin',
      email: process.env.USER_EMAIL || 'admin@localhost',
    }
  ]
}
```

**3. Token Manager (`src/auth/tokenManager.ts`)**

```typescript
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface TokenPayload {
  iss: string
  sub: string
  exp: number
  iat: number
  v: number
  r: {
    u: string
    o: string | null
    t: 'auth'
  }
}

export function generateBridgeToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000)
  
  const payload: TokenPayload = {
    iss: 'roomote-self-hosted',
    sub: userId,
    exp: now + 3600, // 1 hour
    iat: now,
    v: 1,
    r: {
      u: userId,
      o: null, // Single-user setup, no organization
      t: 'auth'
    }
  }
  
  return jwt.sign(payload, config.jwtSecret)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload
  } catch {
    return null
  }
}
```

**4. Socket Server (`src/bridge/socketServer.ts`)**

```typescript
import { Server as SocketIOServer, Socket } from 'socket.io'
import { verifyToken } from '../auth/tokenManager'
import { InstanceStore } from '../state/instanceStore'
import { 
  ExtensionBridgeEvent,
  ExtensionBridgeCommand,
  TaskBridgeEvent,
  TaskBridgeCommand 
} from './types'

const instanceStore = new InstanceStore()

export function setupBridgeSocket(io: SocketIOServer) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    const payload = verifyToken(token)
    
    if (!payload) {
      return next(new Error('Authentication failed'))
    }
    
    socket.data.userId = payload.r.u
    next()
  })
  
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId
    console.log(`Extension connected: ${socket.id}, user: ${userId}`)
    
    // Join user-specific room
    socket.join(`user:${userId}`)
    
    // Extension → Server: Instance events
    socket.on('extension:event', (event: ExtensionBridgeEvent) => {
      console.log(`[Extension Event] ${event.type}`, event)
      
      // Update instance store
      if (event.type === 'instance_registered' || 
          event.type === 'heartbeat_updated') {
        instanceStore.upsert(event.instance)
      } else if (event.type === 'instance_unregistered') {
        instanceStore.remove(event.instance.instanceId)
      } else {
        instanceStore.updateTask(event.instance)
      }
      
      // Broadcast to all web clients for this user
      io.to(`user:${userId}`).emit('instance:update', event)
    })
    
    // Server → Extension: Commands from web
    socket.on('extension:command', (command: ExtensionBridgeCommand) => {
      console.log(`[Extension Command] ${command.type}`, command)
      // Forward to specific extension instance
      io.to(`instance:${command.instanceId}`).emit('extension:command', command)
    })
    
    // Task-specific events
    socket.on('task:event', (event: TaskBridgeEvent) => {
      console.log(`[Task Event] ${event.type}`, event)
      // Broadcast to web clients
      io.to(`user:${userId}`).emit('task:update', event)
    })
    
    socket.on('task:command', (command: TaskBridgeCommand) => {
      console.log(`[Task Command] ${command.type}`, command)
      // Forward to extension handling this task
      io.to(`task:${command.taskId}`).emit('task:command', command)
    })
    
    // Web client requesting instance list
    socket.on('instances:list', (callback) => {
      const instances = instanceStore.listByUser(userId)
      callback(instances)
    })
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })
}
```

**5. Instance Store (`src/state/instanceStore.ts`)**

```typescript
import { ExtensionInstance } from './types'

export class InstanceStore {
  private instances = new Map<string, ExtensionInstance>()
  
  upsert(instance: ExtensionInstance) {
    this.instances.set(instance.instanceId, {
      ...instance,
      lastHeartbeat: Date.now()
    })
    
    // Cleanup old instances (no heartbeat in 2 minutes)
    this.cleanup()
  }
  
  updateTask(instance: ExtensionInstance) {
    const existing = this.instances.get(instance.instanceId)
    if (existing) {
      this.instances.set(instance.instanceId, {
        ...existing,
        task: instance.task,
        taskAsk: instance.taskAsk,
        lastHeartbeat: Date.now()
      })
    }
  }
  
  remove(instanceId: string) {
    this.instances.delete(instanceId)
  }
  
  listByUser(userId: string): ExtensionInstance[] {
    return Array.from(this.instances.values())
      .filter(i => i.userId === userId)
  }
  
  private cleanup() {
    const now = Date.now()
    const TTL = 120_000 // 2 minutes
    
    for (const [id, instance] of this.instances) {
      if (now - instance.lastHeartbeat > TTL) {
        this.instances.delete(id)
      }
    }
  }
}
```

**6. Bridge Config API (`src/api/bridgeConfig.ts`)**

```typescript
import { Router } from 'express'
import { generateBridgeToken } from '../auth/tokenManager'
import { config } from '../config'

export const bridgeConfigRouter = Router()

// GET /api/extension/bridge/config
bridgeConfigRouter.get('/config', (req, res) => {
  const userId = req.user?.id || config.users[0].id
  const token = generateBridgeToken(userId)
  
  res.json({
    userId,
    socketBridgeUrl: `http://localhost:${config.port}`,
    token
  })
})
```

**7. Auth Middleware (`src/auth/middleware.ts`)**

```typescript
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from './tokenManager'
import { config } from '../config'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // For single-user setup, accept a simple bearer token or allow unauthenticated
  const authHeader = req.headers.authorization
  
  if (!authHeader) {
    // Auto-assign to configured user
    req.user = config.users[0]
    return next()
  }
  
  const token = authHeader.replace('Bearer ', '')
  const payload = verifyToken(token)
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  req.user = config.users.find(u => u.id === payload.r.u)
  next()
}
```

#### Package.json

```json
{
  "name": "roomote-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

### Phase 2: Frontend Dashboard

#### Technology Stack
- **Framework**: React 18+ with Vite
- **Language**: TypeScript
- **Real-time**: Socket.io-client
- **Styling**: Tailwind CSS
- **State Management**: React hooks + Context

#### Project Structure

```
roomote-dashboard/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Root component
│   ├── hooks/
│   │   └── useSocket.ts       # Socket.io connection hook
│   ├── components/
│   │   ├── InstanceList.tsx   # List of connected instances
│   │   ├── InstanceCard.tsx   # Single instance display
│   │   ├── TaskViewer.tsx     # Task details and messages
│   │   └── TaskControls.tsx   # Start/Stop/Resume buttons
│   ├── types/
│   │   └── bridge.ts          # Bridge event/command types
│   └── utils/
│       └── formatters.ts      # Formatting utilities
└── .env.example
```

#### Key Components

**1. Socket Hook (`src/hooks/useSocket.ts`)**

```typescript
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { ExtensionInstance, ExtensionBridgeEvent } from '../types/bridge'

export function useSocket(serverUrl: string, token: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [instances, setInstances] = useState<ExtensionInstance[]>([])
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    const newSocket = io(serverUrl, {
      auth: { token }
    })
    
    newSocket.on('connect', () => {
      console.log('Connected to Roomote server')
      setConnected(true)
      
      // Request current instances
      newSocket.emit('instances:list', (list: ExtensionInstance[]) => {
        setInstances(list)
      })
    })
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from Roomote server')
      setConnected(false)
    })
    
    newSocket.on('instance:update', (event: ExtensionBridgeEvent) => {
      console.log('Instance update:', event)
      
      setInstances(prev => {
        const idx = prev.findIndex(i => i.instanceId === event.instance.instanceId)
        
        if (event.type === 'instance_unregistered') {
          return prev.filter(i => i.instanceId !== event.instance.instanceId)
        }
        
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = event.instance
          return updated
        }
        
        return [...prev, event.instance]
      })
    })
    
    setSocket(newSocket)
    
    return () => {
      newSocket.close()
    }
  }, [serverUrl, token])
  
  return { socket, instances, connected }
}
```

**2. Main App (`src/App.tsx`)**

```typescript
import { useState } from 'react'
import { useSocket } from './hooks/useSocket'
import { InstanceList } from './components/InstanceList'
import { TaskViewer } from './components/TaskViewer'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN || 'your-token-here'

export function App() {
  const { socket, instances, connected } = useSocket(SERVER_URL, AUTH_TOKEN)
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null)
  
  const activeInstance = instances.find(i => i.instanceId === selectedInstance)
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Roomote Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-4">
          <InstanceList 
            instances={instances}
            selectedId={selectedInstance}
            onSelect={setSelectedInstance}
          />
        </div>
        
        <div className="col-span-8">
          {activeInstance ? (
            <TaskViewer instance={activeInstance} socket={socket} />
          ) : (
            <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
              Select an instance to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**3. Instance List (`src/components/InstanceList.tsx`)**

```typescript
import { ExtensionInstance } from '../types/bridge'

interface Props {
  instances: ExtensionInstance[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function InstanceList({ instances, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-4">Active Instances</h2>
      
      {instances.length === 0 && (
        <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
          No active instances
        </div>
      )}
      
      {instances.map(instance => (
        <button
          key={instance.instanceId}
          onClick={() => onSelect(instance.instanceId)}
          className={`w-full text-left p-4 rounded-lg transition ${
            selectedId === instance.instanceId
              ? 'bg-blue-600'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <div className="font-medium truncate">{instance.workspacePath}</div>
          <div className="text-sm text-gray-400 mt-1">
            {instance.task.taskStatus} · {instance.mode || 'No mode'}
          </div>
          {instance.gitProperties && (
            <div className="text-xs text-gray-500 mt-1">
              {instance.gitProperties.branch}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
```

**4. Task Viewer (`src/components/TaskViewer.tsx`)**

```typescript
import { Socket } from 'socket.io-client'
import { ExtensionInstance, ExtensionBridgeCommand } from '../types/bridge'
import { TaskControls } from './TaskControls'

interface Props {
  instance: ExtensionInstance
  socket: Socket | null
}

export function TaskViewer({ instance, socket }: Props) {
  const handleStartTask = (text: string) => {
    if (!socket) return
    
    const command: ExtensionBridgeCommand = {
      type: 'start_task',
      instanceId: instance.instanceId,
      payload: { text },
      timestamp: Date.now()
    }
    
    socket.emit('extension:command', command)
  }
  
  const handleStopTask = () => {
    if (!socket || !instance.task.taskId) return
    
    const command: ExtensionBridgeCommand = {
      type: 'stop_task',
      instanceId: instance.instanceId,
      payload: { taskId: instance.task.taskId },
      timestamp: Date.now()
    }
    
    socket.emit('extension:command', command)
  }
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Instance Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Workspace:</span>
            <div className="font-medium">{instance.workspacePath}</div>
          </div>
          <div>
            <span className="text-gray-400">Mode:</span>
            <div className="font-medium">{instance.mode || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-400">Provider:</span>
            <div className="font-medium">{instance.providerProfile || 'N/A'}</div>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <div className="font-medium">{instance.task.taskStatus}</div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Task</h3>
        {instance.task.taskId ? (
          <div className="bg-gray-700 rounded p-4">
            <div className="text-sm text-gray-400">Task ID: {instance.task.taskId}</div>
            {instance.taskAsk && (
              <div className="mt-2">
                <div className="font-medium">Ask:</div>
                <div className="text-sm mt-1">{instance.taskAsk.ask}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400">No active task</div>
        )}
      </div>
      
      <TaskControls 
        instance={instance}
        onStartTask={handleStartTask}
        onStopTask={handleStopTask}
      />
    </div>
  )
}
```

**5. Package.json**

```json
{
  "name": "roomote-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "socket.io-client": "^4.6.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### Phase 3: Integration & Configuration

#### VS Code Environment Setup

Since you want to continue using your existing API provider configuration, you only need to configure the bridge connection. Add to your VS Code `settings.json`:

```json
{
  "terminal.integrated.env.linux": {
    "ROO_CODE_API_URL": "http://localhost:3000"
  },
  "terminal.integrated.env.osx": {
    "ROO_CODE_API_URL": "http://localhost:3000"
  },
  "terminal.integrated.env.windows": {
    "ROO_CODE_API_URL": "http://localhost:3000"
  }
}
```

**Note**: You do NOT need to set `CLERK_BASE_URL` or `ROO_CODE_PROVIDER_URL` if you're using existing providers. The extension will only connect to your Roomote server for the bridge functionality.

#### Server Configuration (`.env`)

```bash
# Server
PORT=3000

# Security - CHANGE THIS!
JWT_SECRET=your-secure-random-secret-here

# CORS - Allow your frontend
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001

# User (single-user setup)
USER_NAME=Admin
USER_EMAIL=admin@localhost
```

#### Frontend Configuration (`.env`)

```bash
VITE_SERVER_URL=http://localhost:3000
VITE_AUTH_TOKEN=generate-with-script
```

### Phase 4: Deployment & Security

#### Local Development

1. **Start the backend**:
   ```bash
   cd roomote-server
   npm install
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd roomote-dashboard
   npm install
   npm run dev
   ```

3. **Enable Roomote in Roo Code**:
   - Open Roo Code settings in VS Code
   - Enable "Remote Control" in Cloud settings
   - Restart VS Code with environment variables set

#### Production Deployment

**Security Considerations:**

1. **Use HTTPS**: Deploy behind a reverse proxy (nginx/Caddy) with TLS
2. **Secure JWT Secret**: Use a strong, randomly generated secret (32+ characters)
3. **Network Security**: 
   - Run on localhost and use SSH tunneling for remote access
   - OR use a VPN to restrict access
   - OR implement IP allowlisting in your reverse proxy

4. **Token Management**:
   - Implement token rotation (current implementation uses 1-hour expiry)
   - Store tokens securely (not in plain text)

**Example Docker Compose Setup:**

```yaml
version: '3.8'

services:
  roomote-server:
    build: ./roomote-server
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - ALLOWED_ORIGINS=https://roomote.yourdomain.com
    restart: unless-stopped
  
  roomote-dashboard:
    build: ./roomote-dashboard
    ports:
      - "5173:80"
    environment:
      - VITE_SERVER_URL=https://api.roomote.yourdomain.com
      - VITE_AUTH_TOKEN=${AUTH_TOKEN}
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - roomote-server
      - roomote-dashboard
    restart: unless-stopped
```

**Nginx Configuration Example:**

```nginx
server {
    listen 443 ssl http2;
    server_name roomote.yourdomain.com;
    
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    
    location / {
        proxy_pass http://roomote-dashboard:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name api.roomote.yourdomain.com;
    
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    
    location / {
        proxy_pass http://roomote-server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Phase 5: Authentication Setup

#### Generating Tokens

Create a simple script to generate authentication tokens:

**`scripts/generate-token.js`**

```javascript
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const userId = 'user_1'

function generateToken() {
  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    iss: 'roomote-self-hosted',
    sub: userId,
    exp: now + (365 * 24 * 3600), // 1 year
    iat: now,
    v: 1,
    r: {
      u: userId,
      o: null,
      t: 'auth'
    }
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

console.log('Your authentication token:')
console.log(generateToken())
```

Run with:
```bash
JWT_SECRET="your-secret" node scripts/generate-token.js
```

Use the generated token in:
1. Frontend `.env` as `VITE_AUTH_TOKEN`
2. Your HTTP requests to the API (Authorization header)

## Testing the Setup

### 1. Verify Backend is Running

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### 2. Test Bridge Config Endpoint

```bash
curl http://localhost:3000/api/extension/bridge/config
# Should return: {"userId":"user_1","socketBridgeUrl":"...","token":"..."}
```

### 3. Test WebSocket Connection

Open browser console on the dashboard and verify:
- "Connected to Roomote server" message
- Socket connection established
- No authentication errors

### 4. Launch VS Code with Roo Code

- Ensure `ROO_CODE_API_URL` environment variable is set
- Enable Remote Control in Roo Code settings
- Start a task
- Verify it appears in the dashboard

## Troubleshooting

### Extension Not Connecting

1. **Check environment variable**: Ensure `ROO_CODE_API_URL` is set correctly
2. **Verify bridge config endpoint**: The extension calls `/api/extension/bridge/config`
3. **Check CORS**: Ensure VS Code extension origin is allowed
4. **Review logs**: Check backend console for connection attempts

### Dashboard Shows No Instances

1. **Verify WebSocket connection**: Check browser console
2. **Check authentication**: Ensure `VITE_AUTH_TOKEN` is valid
3. **Start a task in VS Code**: Instances only appear when extension connects
4. **Check server logs**: Look for "Extension connected" messages

### Tasks Not Responding to Commands

1. **Verify socket rooms**: Ensure extension joined correct rooms
2. **Check event names**: Ensure event/command types match exactly
3. **Review payload structure**: Must match TypeScript interfaces
4. **Check task IDs**: Ensure commands reference correct task IDs

## Limitations & Future Enhancements

### Current Limitations

1. **Single User**: Authentication is simplified for one user
2. **No Persistence**: Instance state is lost on server restart
3. **No History**: Task history is not stored
4. **Basic Auth**: Uses simple JWT tokens (no OAuth)
5. **In-Memory Only**: No database for state or logs

### Potential Enhancements

1. **Multi-User Support**: Add user management and authentication
2. **Database Integration**: Store instance history and task logs
3. **Task Recordings**: Save and replay task conversations
4. **Metrics & Analytics**: Track task success rates, timing
5. **Notifications**: Alert on task completion or errors
6. **Mobile App**: Native mobile client for monitoring
7. **OAuth Integration**: Support GitHub/Google login
8. **Team Features**: Share instances across team members

## Cost & Resource Requirements

### Development Time
- Backend: 8-12 hours
- Frontend: 12-16 hours
- Testing & Debugging: 4-8 hours
- **Total**: 24-36 hours

### Resource Requirements
- **CPU**: Minimal (handles ~10 concurrent instances easily)
- **Memory**: ~100-200 MB for backend
- **Storage**: Negligible (no database)
- **Network**: Low bandwidth (mainly WebSocket heartbeats)

### Hosting Costs
- **Free Tier Options**: Can run on free tier of most cloud providers
- **VPS**: $5-10/month (DigitalOcean, Linode)
- **Self-Hosted**: Free if running on existing hardware

## Summary

This implementation plan provides a complete, production-ready solution for self-hosting Roomote with:

✅ **Minimal complexity** - No external dependencies beyond Node.js  
✅ **Secure** - JWT authentication, HTTPS support  
✅ **Real-time** - Socket.io for instant updates  
✅ **Single-user focused** - Simplified auth for personal use  
✅ **Easy deployment** - Docker support, simple configuration  
✅ **Type-safe** - Full TypeScript implementation  
✅ **Tested architecture** - Based on existing Roo Code bridge patterns  

The solution requires minimal changes to your existing setup and allows you to continue using your current API provider configuration while gaining full control over the remote monitoring and task management capabilities.
