# Admin Console Spec

## Overview
An admin-only console is available at `/admin` to:
- View all registered users and their plan/billing status.
- Inspect user detail metrics (document count, chat count, message count).
- Publish announcements for all users.
- Send/receive direct messages with specific users.

Access is controlled by `ADMIN_USER_IDS` (comma-separated Supabase user IDs).

## Data Model
### `admin_announcements`
Stores announcements published by admins.
- `id` uuid PK
- `title` text
- `body` text
- `status` text (`draft` or `published`)
- `created_at` timestamptz
- `created_by` uuid (admin user id)
- `published_at` timestamptz (nullable)

### `admin_user_messages`
Direct messages between admins and users.
- `id` uuid PK
- `user_id` uuid
- `direction` text (`user` or `admin`)
- `content` text
- `admin_id` uuid (nullable)
- `created_at` timestamptz
- `read_at` timestamptz (nullable)

## Admin API (Server)
All admin endpoints require `Authorization: Bearer <token>` and `ADMIN_USER_IDS` membership.

- `GET /admin/me`
  - Returns `{ isAdmin: boolean }`

- `GET /admin/users?limit=50&offset=0`
  - Returns a list with: `id`, `email`, `created_at`, `last_sign_in_at`, `plan`, `stripe_status`, `current_period_end`

- `GET /admin/users/{user_id}`
  - Returns detail plus counts: `documentCount`, `chatCount`, `messageCount`

- `GET /admin/announcements?status=draft|published`
  - Returns all announcements

- `POST /admin/announcements`
  - Payload: `{ title, body, publish }`
  - If `publish=true`, `status=published` and `published_at=now`

- `GET /admin/messages?user_id=<uuid>`
  - Returns message thread for the user

- `POST /admin/messages`
  - Payload: `{ user_id, content }`
  - Creates a message with `direction=admin`

## User-facing Messages API
- `GET /messages/announcements`
  - Returns published announcements (latest first)

- `GET /messages/support`
  - Returns direct messages for the current user

- `POST /messages/support`
  - Payload: `{ content }`
  - Creates a message with `direction=user`

## UI (Settings → Admin)
### Users
List of users with:
- User ID
- Email
- Plan

Selecting a user shows:
- Created date / last sign-in
- Plan, status, period end
- Counts (documents, chats, messages)

### Direct Messages
Admin can send a direct message to the selected user.
Thread shows both user and admin messages.

### Announcements
Admin can create a new announcement:
- Title
- Body
- Publish immediately toggle

## Permissions
Admin access is based on:
```
ADMIN_USER_IDS=uuid1,uuid2
```
Guests and non-listed users are blocked by server-side checks.

## Notes
- The console uses server endpoints and does not expose admin data via Supabase client.
- Apply DB migration `013_add_admin_messaging.sql` before use.
