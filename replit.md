# Milliy Brend Reklama Bot

## Overview
Telegram bot for Milliy Brend Reklama Agentligi - an advertising agency. The bot handles order collection, portfolio display, order status tracking, contact information, and admin CRM functionality.

## Tech Stack
- **Runtime**: Node.js 20 with TypeScript
- **Bot Framework**: Telegraf
- **Database**: SQLite (better-sqlite3)
- **Configuration**: dotenv for environment variables

## Project Structure
```
src/
  index.ts          # Main entry point, bot initialization
  config.ts         # Configuration and environment variables
  db.ts             # Database operations (SQLite)
  keyboards.ts      # Telegram keyboard definitions
  texts.ts          # All bot text messages
  handlers/
    user.ts         # User-facing handlers (order wizard, portfolio, etc.)
    admin.ts        # Admin panel handlers (order management, broadcast)
```

## Environment Variables
- `BOT_TOKEN` - Telegram Bot API token (required)
- `ADMIN_IDS` - Comma-separated list of admin Telegram user IDs

## Features

### User Features
1. **Order Wizard** - Step-by-step order collection:
   - Service type selection
   - Company name
   - Description
   - Size/format
   - Address
   - Deadline
   - Budget range
   - File attachments
   - Contact information

2. **Portfolio** - Browse agency work examples by category
3. **Order Status** - Check order status by MBR-XXXX ID
4. **Contact** - Agency contact info with question forwarding to admins
5. **About** - Agency information

### Admin Features (via /admin command)
1. **New Orders** - View latest 10 orders
2. **Order Search** - Search by ID, company, name, or phone
3. **Status Change** - Update order status with user notification
4. **Broadcast** - Send messages to all users

## Order Statuses
- YANGI (New)
- DIZAYN BOSQICHIDA (In Design)
- MIJOZ TASDIQIDA (Client Approval)
- ISHLAB CHIQARISHDA (In Production)
- O'RNATILMOQDA (Installing)
- YOPILGAN (Closed)

## Running the Bot
```bash
npm run dev    # Development mode with ts-node
npm run build  # Build TypeScript
npm run prod   # Run production build
```

## Database Schema
Orders table stores all order information including files as JSON array of Telegram file_ids.
Users table tracks all bot users for broadcast functionality.
