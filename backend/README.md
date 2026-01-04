# Backend API - UCC Home Task

A Laravel-based REST API for an event management and helpdesk system with AI-powered chat support.

## Features

### Authentication & Authorization
- Token-based authentication using Laravel Sanctum
- Role-based access control (User, Helpdesk Agent, Admin)
- Password reset functionality

### Event Management
- CRUD operations for events
- User-specific event management

### Helpdesk System
- Real-time chat support
- AI-powered automatic responses using OpenAI
- Agent assignment and chat management
- Chat status tracking (Open, AI Handling, Assigned, Resolved)
- Message rate limiting

### Real-time Communication
- WebSocket support via Laravel Reverb
- Event broadcasting for live updates

### Background Processing
- Queue-based AI response processing
- Rate-limited job processing

## Key Technologies

- **Framework**: Laravel 12
- **Authentication**: Laravel Sanctum
- **Real-time**: Laravel Reverb (WebSockets)
- **Queue**: Laravel Queue (database driver)
- **AI Integration**: OpenAI API
- **Testing**: PHPUnit
- **Code Style**: Laravel Pint

## Requirements

- PHP >= 8.2
- Composer
- SQLite (default) or MySQL/PostgreSQL
- Node.js and npm (for frontend assets)
- OpenAI API key (for AI chat functionality)

## Installation

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install PHP Dependencies

```bash
composer install
```

### Step 3: Set Up Environment

```bash
cp .env.example .env
php artisan key:generate
```

### Step 4: Configure Environment Variables

Edit `.env` and set the following:

```env
APP_NAME="UCC Home Task"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080

QUEUE_CONNECTION=database
```

### Step 5: Run Migrations

```bash
php artisan migrate
```

### Step 6: Seed the Database

```bash
php artisan db:seed
```

### Step 7: Install Frontend Dependencies and Build Assets

```bash
npm install
npm run build
```

## Quick Setup

Alternatively, use the setup script to perform all installation steps:

```bash
composer run setup
```

## Running the Application

### Development Mode

Run all services concurrently (server, queue, logs, and frontend):

```bash
composer run dev
```

This will start:
- **Laravel development server** → `http://localhost:8000`
- **Queue worker** → Processes background jobs
- **Log viewer (Pail)** → Real-time log monitoring
- **Frontend dev server (Vite)** → Hot module replacement

### Manual Start

Start services individually in separate terminals:

#### 1. Start the API Server

```bash
php artisan serve
```

#### 2. Start the Queue Worker

```bash
php artisan queue:work
```

#### 3. Start Reverb WebSocket Server

```bash
php artisan reverb:start
```

#### 4. Start Frontend Dev Server

```bash
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/login` | User login | ❌ |
| `POST` | `/api/logout` | User logout | ✅ |
| `POST` | `/api/password/reset` | Request password reset | ❌ |
| `POST` | `/api/password/reset/confirm` | Confirm password reset | ❌ |

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/events` | List all events | ✅ |
| `POST` | `/api/events` | Create event | ✅ |
| `GET` | `/api/events/{id}` | Get event | ✅ |
| `PUT` | `/api/events/{id}` | Update event | ✅ |
| `DELETE` | `/api/events/{id}` | Delete event | ✅ |

### Helpdesk (User)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/chats` | List user's chats | ✅ |
| `POST` | `/api/chats` | Create new chat | ✅ |
| `GET` | `/api/chats/{id}` | Get chat details | ✅ |
| `POST` | `/api/chats/{id}/messages` | Send message | ✅ |

### Helpdesk (Agent)

> **Note:** All agent routes require `helpdesk.agent` middleware.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/helpdesk/chats` | List all chats | ✅ (Agent) |
| `GET` | `/api/helpdesk/chats/unassigned` | List unassigned chats | ✅ (Agent) |
| `GET` | `/api/helpdesk/chats/{id}` | Get chat details | ✅ (Agent) |
| `POST` | `/api/helpdesk/chats/{id}/assign` | Assign chat to agent | ✅ (Agent) |
| `POST` | `/api/helpdesk/chats/{id}/reply` | Reply to chat | ✅ (Agent) |
| `POST` | `/api/helpdesk/chats/{id}/resolve` | Resolve chat | ✅ (Agent) |

## Configuration

### Chat Rate Limiting

Configure in `config/chat.php` or via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CHAT_RATE_LIMIT_MAX` | Maximum messages per time window | `10` |
| `CHAT_RATE_LIMIT_DECAY` | Time window in seconds | `60` |

### OpenAI Configuration

Configure in `config/openai.php` or via environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes | - |
| `OPENAI_MODEL` | Model to use | ❌ No | `gpt-4o-mini` |
| `OPENAI_ORGANIZATION` | Optional organization ID | ❌ No | - |
| `OPENAI_REQUEST_TIMEOUT` | Request timeout in seconds | ❌ No | `30` |

## Database

### SQLite (Default)

The application uses SQLite by default. The database file is located at:

```
database/database.sqlite
```

### MySQL/PostgreSQL

To use MySQL or PostgreSQL:

1. **Update `.env`:**

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

2. **Run migrations:**

```bash
php artisan migrate
```

## Development & Testing

### Seeded Users

After running `php artisan db:seed`, the following test users are available:

#### Admin User
- **Email**: `admin@example.com`
- **Password**: `SecurePassword123!`
- **Role**: `Administrator`
- **Access**: Full system access including helpdesk agent capabilities

#### Helpdesk Agent
- **Email**: `agent@example.com`
- **Password**: `SecurePassword123!`
- **Role**: `Helpdesk Agent`
- **Access**: Can manage and respond to helpdesk chats

#### Regular Users

All regular users use the password: `SecurePassword123!`

| Email | Name |
|-------|------|
| `user@example.com` | Regular User |
| `alice@example.com` | Alice Johnson |
| `bob@example.com` | Bob Smith |
| `carol@example.com` | Carol Williams |
| `david@example.com` | David Brown |
| `emma@example.com` | Emma Davis |

> **⚠️ Security Note:** These are test credentials. Change all passwords in production!

### User Roles

| Role | Permissions |
|------|-------------|
| `User` | Can create events and initiate helpdesk chats |
| `Helpdesk Agent` | Can manage and respond to helpdesk chats |
| `Admin` | Full access including agent capabilities |

### Run Test Suite

```bash
composer run test
```

Or use PHPUnit directly:

```bash
php artisan test
```

### Test Coverage

The test suite includes:

**Unit Tests**
- Models
- Repositories
- Services
- Policies

**Feature Tests**
- Authentication
- Events
- Helpdesk
- Middleware

## Project Structure

```
backend/
├── app/
│   ├── Enums/              # Enumeration classes
│   │   ├── ChatStatus.php  # Chat status enum (OPEN, AI_HANDLING, ASSIGNED, RESOLVED)
│   │   ├── MessageType.php # Message type enum (USER, AI, SYSTEM)
│   │   └── UserRole.php    # User role enum (USER, HELPDESK_AGENT, ADMIN)
│   │
│   ├── Events/             # Event classes for broadcasting
│   │   ├── ChatTransferRequested.php # Event when chat transfer is requested
│   │   └── MessageSent.php           # Event when message is sent
│   │
│   ├── Http/
│   │   ├── Controllers/    # API controllers
│   │   │   ├── Api/
│   │   │   │   └── V1/
│   │   │   │       ├── Auth/
│   │   │   │       │   ├── LoginController.php        # Authentication controller
│   │   │   │       │   └── PasswordResetController.php # Password reset controller
│   │   │   │       ├── EventController.php # Event CRUD operations
│   │   │   │       └── Helpdesk/
│   │   │   │           ├── AgentChatController.php # Agent chat management
│   │   │   │           └── ChatController.php      # User chat operations
│   │   │   └── Controller.php # Base controller
│   │   │
│   │   ├── Middleware/     # Custom middleware
│   │   │   └── EnsureHelpdeskAgent.php # Ensures user is helpdesk agent
│   │   │
│   │   ├── Requests/       # Form request validation
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php                # Login validation
│   │   │   │   ├── PasswordResetRequest.php        # Password reset request
│   │   │   │   └── PasswordResetConfirmRequest.php # Password reset confirmation
│   │   │   ├── Event/
│   │   │   │   ├── StoreEventRequest.php  # Create event validation
│   │   │   │   └── UpdateEventRequest.php # Update event validation
│   │   │   ├── Helpdesk/
│   │   │   │   ├── StoreChatRequest.php   # Create chat validation
│   │   │   │   └── SendMessageRequest.php # Send message validation
│   │   │   └── LLM/
│   │   │       └── ChatRequest.php # LLM chat request validation
│   │   │
│   │   └── Resources/      # API resource transformers
│   │       ├── ChatResource.php    # Chat API resource
│   │       ├── EventResource.php   # Event API resource
│   │       ├── MessageResource.php # Message API resource
│   │       └── UserResource.php    # User API resource
│   │
│   ├── Jobs/               # Queue jobs
│   │   └── ProcessAIResponse.php # Processes AI responses asynchronously
│   │
│   ├── Models/             # Eloquent models
│   │   ├── Chat.php    # Chat model
│   │   ├── Event.php   # Event model
│   │   ├── Message.php # Message model
│   │   └── User.php    # User model
│   │
│   ├── Policies/           # Authorization policies
│   │   ├── ChatPolicy.php  # Chat authorization policy
│   │   └── EventPolicy.php # Event authorization policy
│   │
│   ├── Providers/          # Service providers
│   │   ├── AppServiceProvider.php       # Application service provider
│   │   ├── AuthServiceProvider.php      # Authentication service provider
│   │   └── BroadcastServiceProvider.php # Broadcasting service provider
│   │
│   ├── Repositories/       # Repository pattern implementation
│   │   ├── Contracts/      # Repository interfaces
│   │   │   ├── ChatRepositoryInterface.php
│   │   │   ├── EventRepositoryInterface.php
│   │   │   └── MessageRepositoryInterface.php
│   │   └── Eloquent/       # Repository implementations
│   │       ├── ChatRepository.php
│   │       ├── EventRepository.php
│   │       └── MessageRepository.php
│   │
│   └── Services/           # Business logic services
│       ├── Auth/
│       │   └── AuthService.php # Authentication service
│       ├── Events/
│       │   └── EventService.php # Event management service
│       └── Helpdesk/
│           ├── AIService.php   # AI/OpenAI integration service
│           └── ChatService.php # Chat management service
│
├── bootstrap/              # Application bootstrap
│   ├── app.php             # Application bootstrap file
│   ├── cache/              # Bootstrap cache
│   │   ├── packages.php
│   │   └── services.php
│   └── providers.php       # Service provider registration
│
├── config/                 # Configuration files
│   ├── app.php             # Application configuration
│   ├── auth.php            # Authentication configuration
│   ├── broadcasting.php    # Broadcasting configuration
│   ├── cache.php           # Cache configuration
│   ├── chat.php            # Chat rate limiting configuration
│   ├── cors.php            # CORS configuration
│   ├── database.php        # Database configuration
│   ├── filesystems.php     # Filesystem configuration
│   ├── logging.php         # Logging configuration
│   ├── mail.php            # Mail configuration
│   ├── openai.php          # OpenAI API configuration
│   ├── queue.php           # Queue configuration
│   ├── reverb.php          # Reverb WebSocket configuration
│   ├── services.php        # External services configuration
│   └── session.php         # Session configuration
│
├── database/
│   ├── database.sqlite     # SQLite database file (default)
│   │
│   ├── factories/          # Model factories
│   │   ├── ChatFactory.php
│   │   ├── EventFactory.php
│   │   ├── MessageFactory.php
│   │   └── UserFactory.php
│   │
│   ├── migrations/         # Database migrations
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2025_12_28_073432_create_events_table.php
│   │   ├── 2025_12_28_073439_create_personal_access_tokens_table.php
│   │   ├── 2026_01_01_080515_create_chats_table.php
│   │   └── 2026_01_01_080517_create_messages_table.php
│   │
│   └── seeders/            # Database seeders
│       ├── DatabaseSeeder.php # Main database seeder
│       └── UserSeeder.php     # User seeder
│
├── public/                 # Public web directory
│   ├── favicon.ico
│   ├── index.php           # Application entry point
│   └── robots.txt
│
├── routes/                 # Route definitions
│   ├── api.php             # API routes
│   ├── channels.php        # Broadcasting channels
│   ├── console.php         # Artisan console routes
│   └── web.php             # Web routes
│
├── storage/                # Storage directory
│   ├── app/                # Application storage
│   │   ├── private/        # Private files
│   │   └── public/         # Public files
│   ├── framework/          # Framework files
│   │   ├── cache/          # Cache files
│   │   ├── sessions/       # Session files
│   │   ├── testing/        # Testing files
│   │   └── views/          # Compiled views
│   └── logs/               # Log files
│       └── laravel.log
│
├── tests/                  # Test suite
│   ├── Feature/            # Feature tests
│   │   ├── Auth/
│   │   │   ├── LoginTest.php
│   │   │   ├── LogoutTest.php
│   │   │   └── PasswordResetTest.php
│   │   ├── Event/
│   │   │   └── EventCrudTest.php
│   │   ├── Helpdesk/
│   │   │   ├── AgentChatTest.php
│   │   │   └── ChatTest.php
│   │   └── Middleware/
│   │       └── EnsureHelpdeskAgentTest.php
│   │
│   ├── Unit/               # Unit tests
│   │   ├── Http/
│   │   │   └── Requests/
│   │   │       ├── SendMessageRequestTest.php
│   │   │       ├── StoreChatRequestTest.php
│   │   │       ├── StoreEventRequestTest.php
│   │   │       └── UpdateEventRequestTest.php
│   │   ├── Models/
│   │   │   └── UserTest.php
│   │   ├── Policies/
│   │   │   ├── ChatPolicyTest.php
│   │   │   └── EventPolicyTest.php
│   │   ├── Repositories/
│   │   │   ├── ChatRepositoryTest.php
│   │   │   ├── EventRepositoryTest.php
│   │   │   └── MessageRepositoryTest.php
│   │   └── Services/
│   │       ├── AIServiceTest.php
│   │       └── ChatServiceTest.php
│   │
│   ├── Traits/             # Test traits
│   │   └── CreatesTestUsers.php # Helper trait for creating test users
│   │
│   └── TestCase.php        # Base test case
│
├── vendor/                 # Composer dependencies (not in version control)
│
├── artisan                 # Artisan command-line tool
├── composer.json           # Composer dependencies
├── composer.lock           # Composer lock file
├── package.json            # NPM dependencies
├── phpunit.xml             # PHPUnit configuration
└── README.md               # This file
```