# Frontend - UCC Home Task

A Vue 3-based single-page application for event management and helpdesk system with real-time chat support.

## Features

### Authentication & Authorization
- Token-based authentication using Laravel Sanctum
- Role-based access control (User, Helpdesk Agent, Admin)
- Protected routes with authentication guards
- Password reset functionality
- Automatic token refresh and session management

### Event Management
- Create, read, update, and delete events
- User-specific event listing
- Real-time event updates
- Form validation with VeeValidate and Zod

### Helpdesk System
- Real-time chat interface with WebSocket support
- AI-powered automatic responses
- Agent dashboard for chat management
- Chat status tracking (Open, AI Handling, Assigned, Resolved)
- Message notifications and updates
- Chat assignment and resolution workflows

### Real-time Communication
- WebSocket integration via Laravel Echo and Pusher
- Live message updates
- Chat status change notifications
- Event broadcasting support

### User Interface
- Modern, responsive design with Tailwind CSS
- PrimeVue component library integration
- Dark mode support
- Toast notifications
- Confirmation dialogs
- Loading states and error handling

## Key Technologies

- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Framework**: PrimeVue + Tailwind CSS
- **Form Validation**: VeeValidate + Zod
- **HTTP Client**: Axios
- **Real-time**: Laravel Echo + Pusher.js
- **Date Handling**: Day.js
- **Testing**: Vitest + Vue Test Utils
- **Code Quality**: ESLint + Prettier

## Requirements

- Node.js >= 18.x
- npm or yarn
- Backend API running (see backend README)
- WebSocket server (Laravel Reverb) running

## Installation

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the frontend directory (or copy from `.env.example` if available):

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_HOST=localhost
VITE_WS_PORT=8080
VITE_WS_KEY=your_websocket_key
VITE_WS_CLUSTER=mt1
```

> **Note:** The WebSocket configuration should match your Laravel Reverb setup from the backend.

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Production Build

Build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Development & Testing

### Code Quality

#### Linting

```bash
npm run lint
```

#### Formatting

```bash
npm run format
```

### Test Suite

#### Run Tests

```bash
npm run test
```

#### Run Tests with UI

```bash
npm run test:ui
```

#### Run Tests Once (CI mode)

```bash
npm run test:run
```

#### Run Tests with Coverage

```bash
npm run test:coverage
```

### Test Coverage

The test suite includes:

**Unit Tests**
- Stores (state management)
- Utils (utilities and helpers)
- Types (TypeScript type definitions)

**Component Tests**
- UI components (Header, Sidebar)
- Event components (EventForm, EventList)
- Helpdesk components (ChatInput, ChatList, ChatMessage, ChatWindow)

**Integration Tests**
- Authentication flow
- API integration
- Store interactions

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── auth.ts             # Authentication API
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── events.ts           # Events API
│   │   ├── helpdesk.ts         # Helpdesk/Chat API
│   │   └── index.ts            # API exports
│   │
│   ├── assets/                 # Static assets (images, fonts, etc.)
│   │
│   ├── components/             # Vue components
│   │   ├── events/             # Event-related components
│   │   │   ├── EventForm.vue   # Event creation/editing form
│   │   │   ├── EventList.vue   # Event listing component
│   │   │   └── index.ts        # Component exports
│   │   ├── helpdesk/           # Helpdesk/Chat components
│   │   │   ├── ChatInput.vue   # Message input component
│   │   │   ├── ChatList.vue    # Chat list component
│   │   │   ├── ChatMessage.vue # Individual message component
│   │   │   ├── ChatWindow.vue  # Main chat window
│   │   │   ├── MessageBubble.vue # Message bubble UI
│   │   │   └── index.ts        # Component exports
│   │   └── ui/                 # UI components
│   │       ├── AppHeader.vue   # Application header
│   │       ├── AppSidebar.vue   # Navigation sidebar
│   │       └── index.ts        # Component exports
│   │
│   ├── composables/            # Vue composables (reusable logic)
│   │   ├── useAuth.ts          # Authentication composable
│   │   ├── useChatChannel.ts   # WebSocket channel management
│   │   ├── useConfirm.ts       # Confirmation dialog composable
│   │   ├── useNotification.ts  # Toast notification composable
│   │   ├── message/            # Message-related composables
│   │   │   ├── useMessage.ts           # Message utilities
│   │   │   ├── useMessageAvatar.ts     # Message avatar logic
│   │   │   ├── useMessageDisplay.ts    # Message display logic
│   │   │   ├── useMessageSender.ts     # Message sender logic
│   │   │   ├── useMessageType.ts       # Message type utilities
│   │   │   └── index.ts                # Composable exports
│   │   └── index.ts            # Composable exports
│   │
│   ├── layouts/                # Layout components
│   │   ├── AuthLayout.vue      # Authentication layout
│   │   └── DefaultLayout.vue   # Default application layout
│   │
│   ├── pages/                  # Page components (routes)
│   │   ├── auth/               # Authentication pages
│   │   │   ├── LoginPage.vue           # Login page
│   │   │   └── ResetPasswordPage.vue   # Password reset page
│   │   ├── events/             # Event pages
│   │   │   └── EventsPage.vue  # Events management page
│   │   └── helpdesk/           # Helpdesk pages
│   │       ├── AgentDashboard.vue # Agent dashboard page
│   │       └── ChatPage.vue     # User chat page
│   │
│   ├── router/                 # Vue Router configuration
│   │   ├── guards.ts           # Route guards (authentication)
│   │   └── index.ts            # Router setup and routes
│   │
│   ├── stores/                 # Pinia stores (state management)
│   │   ├── auth.ts             # Authentication store
│   │   ├── chat.ts             # User chat store
│   │   ├── chatAgent.ts        # Agent chat store
│   │   ├── events.ts           # Events store
│   │   ├── ui.ts               # UI state store
│   │   └── index.ts            # Store exports
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Authentication types
│   │   ├── chat.ts             # Chat/Message types
│   │   ├── event.ts            # Event types
│   │   └── index.ts            # Type exports
│   │
│   ├── utils/                  # Utility functions
│   │   ├── constants.ts        # Application constants
│   │   ├── date.ts             # Date formatting utilities
│   │   ├── echo.ts             # Laravel Echo setup
│   │   ├── errorHandler.ts     # Error handling utilities
│   │   └── index.ts            # Utility exports
│   │
│   ├── App.vue                 # Root component
│   ├── main.ts                 # Application entry point
│   ├── style.css               # Global styles
│   └── env.d.ts                # Environment type definitions
│
├── tests/                      # Test suite
│   ├── component/              # Component tests
│   │   ├── events/
│   │   │   ├── EventForm.test.ts
│   │   │   └── EventList.test.ts
│   │   ├── helpdesk/
│   │   │   ├── ChatInput.test.ts
│   │   │   ├── ChatList.test.ts
│   │   │   ├── ChatMessage.test.ts
│   │   │   └── ChatWindow.test.ts
│   │   └── ui/
│   │       ├── AppHeader.test.ts
│   │       └── AppSidebar.test.ts
│   │
│   ├── fixtures/               # Test data fixtures
│   │   ├── chats.ts
│   │   ├── events.ts
│   │   ├── messages.ts
│   │   └── users.ts
│   │
│   ├── integration/            # Integration tests
│   │   ├── api/                # API integration tests
│   │   ├── composables/
│   │   │   └── auth-flow.test.ts
│   │   └── stores/             # Store integration tests
│   │
│   ├── mocks/                  # Test mocks
│   │   ├── api/
│   │   │   ├── auth.mock.ts
│   │   │   ├── events.mock.ts
│   │   │   └── helpdesk.mock.ts
│   │   ├── echo.mock.ts        # Laravel Echo mock
│   │   ├── primevue.ts         # PrimeVue component mocks
│   │   ├── router.mock.ts      # Vue Router mock
│   │   └── index.ts            # Mock exports
│   │
│   ├── setup/                  # Test setup files
│   │   ├── helpers.ts          # Test helper functions
│   │   ├── test-utils.ts       # Custom test utilities
│   │   └── vitest.setup.ts     # Vitest configuration
│   │
│   └── unit/                   # Unit tests
│       ├── stores/
│       │   ├── auth.test.ts
│       │   ├── chat.test.ts
│       │   ├── chatAgent.test.ts
│       │   ├── events.test.ts
│       │   └── ui.test.ts
│       ├── types/
│       │   └── chat.test.ts
│       └── utils/
│           ├── date.test.ts
│           └── errorHandler.test.ts
│
├── public/                     # Public static assets
│   └── vite.svg
│
├── dist/                       # Production build output (generated)
│
├── index.html                  # HTML entry point
├── package.json                # NPM dependencies and scripts
├── package-lock.json           # NPM lock file
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript app configuration
├── tsconfig.node.json          # TypeScript node configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest test configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
└── README.md                   # This file
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API base URL | ❌ No | `http://localhost:8000/api` |
| `VITE_WS_HOST` | WebSocket server host | ❌ No | `localhost` |
| `VITE_WS_PORT` | WebSocket server port | ❌ No | `8080` |
| `VITE_WS_KEY` | WebSocket key | ❌ No | - |
| `VITE_WS_CLUSTER` | WebSocket cluster | ❌ No | `mt1` |

### API Client Configuration

The API client (`src/api/client.ts`) is configured with:
- Automatic token injection from localStorage
- Laravel Resource unwrapping
- Automatic 401 handling and redirect to login
- Request/response interceptors
- 10-second timeout

### WebSocket Configuration

WebSocket connection is managed via Laravel Echo (`src/utils/echo.ts`):
- Automatic connection management
- Channel subscription/unsubscription
- Event listeners for real-time updates

## Routing

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | `LoginPage` | User login |
| `/reset-password` | `ResetPasswordPage` | Password reset |

### Protected Routes

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|--------------|
| `/events` | `EventsPage` | Event management | ✅ |
| `/chat` | `ChatPage` | User chat interface | ✅ |
| `/agent` | `AgentDashboard` | Agent dashboard | ✅ (Agent/Admin) |

### Route Guards

- **Authentication Guard**: Redirects unauthenticated users to `/login`
- **Guest Guard**: Redirects authenticated users away from auth pages
- **Agent Guard**: Restricts `/agent` route to helpdesk agents and admins

## State Management

### Stores (Pinia)

#### Auth Store (`stores/auth.ts`)
- User authentication state
- Token management
- Role-based computed properties (`isAgent`, `isAdmin`)
- Login/logout actions

#### Events Store (`stores/events.ts`)
- Event list management
- CRUD operations for events
- Loading and error states

#### Chat Store (`stores/chat.ts`)
- User chat state
- Message management
- Chat list and current chat

#### Chat Agent Store (`stores/chatAgent.ts`)
- Agent-specific chat state
- Unassigned chats
- Chat assignment and resolution

#### UI Store (`stores/ui.ts`)
- UI state (sidebar, modals, etc.)
- Theme preferences

## Real-time Features

### WebSocket Integration

The application uses Laravel Echo with Pusher.js for real-time communication:

- **Chat Channels**: Subscribe to `chat.{id}` channels for live message updates
- **Event Broadcasting**: Listen for `MessageSent` and `ChatTransferRequested` events
- **Automatic Cleanup**: Channels are automatically unsubscribed when components unmount

### Usage Example

```typescript
import { useChatChannel } from '@/composables/useChatChannel'
import { ref } from 'vue'

const currentChat = ref<Chat | null>(null)

useChatChannel(currentChat, (message: Message) => {
  // Handle new message
  addMessage(message)
})
```

## API Integration

### Authentication

- **Login**: `POST /api/login`
- **Logout**: `POST /api/logout`
- **Password Reset**: `POST /api/password/reset`
- **Password Reset Confirm**: `POST /api/password/reset/confirm`

### Events

- **List Events**: `GET /api/events`
- **Create Event**: `POST /api/events`
- **Get Event**: `GET /api/events/{id}`
- **Update Event**: `PUT /api/events/{id}`
- **Delete Event**: `DELETE /api/events/{id}`

### Helpdesk (User)

- **List Chats**: `GET /api/chats`
- **Create Chat**: `POST /api/chats`
- **Get Chat**: `GET /api/chats/{id}`
- **Send Message**: `POST /api/chats/{id}/messages`

### Helpdesk (Agent)

- **List All Chats**: `GET /api/helpdesk/chats`
- **List Unassigned Chats**: `GET /api/helpdesk/chats/unassigned`
- **Get Chat**: `GET /api/helpdesk/chats/{id}`
- **Assign Chat**: `POST /api/helpdesk/chats/{id}/assign`
- **Reply to Chat**: `POST /api/helpdesk/chats/{id}/reply`
- **Resolve Chat**: `POST /api/helpdesk/chats/{id}/resolve`

## Development Guidelines



- Use TypeScript for type safety
- Follow Vue 3 Composition API patterns
- Use `<script setup>` syntax for components

### Component Structure

```vue
<script setup lang="ts">
// Imports
// Props/Emits
// Composables
// State
// Computed
// Methods
// Lifecycle hooks
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles */
</style>
```

### State Management

- Use Pinia stores for global state
- Use composables for reusable logic
- Keep component state local when possible

### Testing

- unit tests for stores and utilities
- component tests for UI components
- integration tests for user flows




