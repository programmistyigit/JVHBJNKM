# Milliy Brend Reklama Bot

## Overview
Telegram bot for Milliy Brend Reklama Agentligi - an advertising agency. The bot handles order collection, portfolio display, order status tracking, contact information, and admin CRM functionality with dynamic content management.

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
  db.ts             # Database operations (SQLite) with all tables
  keyboards.ts      # Telegram keyboard definitions (dynamic)
  texts.ts          # All bot text messages (dynamic from DB)
  handlers/
    user.ts         # User-facing handlers (order wizard, portfolio, etc.)
    admin.ts        # Admin panel handlers (order management, settings, broadcast)
```

## Environment Variables
- `BOT_TOKEN` - Telegram Bot API token (required)
- `ADMIN_IDS` - Comma-separated list of admin Telegram user IDs

## Features

### User Features
1. **Order Wizard** - Step-by-step order collection:
   - Service type selection (dynamic from database)
   - Company name
   - Description
   - Size/format
   - Address
   - Deadline
   - Budget range
   - File attachments
   - Contact information

2. **Portfolio** - Browse agency work examples by category (dynamic from database)
3. **Order Status** - Check order status by MBR-XXXX ID
4. **Contact** - Agency contact info (dynamic) with question forwarding to admins
5. **About** - Agency information (editable by admin)

### Admin Features (via /admin command)
1. **New Orders** - View latest 10 new orders
2. **Order Search** - Search by ID, company, name, or phone
3. **Status Change** - Update order status with user notification
4. **Broadcast** - Send messages to all users
5. **Settings Menu**:
   - **Xizmatlar (Services)** - Add/remove service types
   - **Portfolio** - Manage categories and portfolio items with photos
   - **Kompaniya ma'lumotlari** - Edit phone numbers, Telegram, address, about text

## Database Schema

### Tables
- **orders** - All order information including files as JSON array
- **users** - All bot users for broadcast functionality
- **services** - Dynamic service types (emoji, name, callback_id)
- **portfolio** - Portfolio items (category, title, description, photo_id)
- **portfolio_categories** - Portfolio categories (emoji, name, callback_id)
- **settings** - Key-value store for company settings (phone1, phone2, telegram, address, about_text)

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

## Recent Changes
- Added dynamic service management for admins
- Added dynamic portfolio management with photo support
- Added company settings management (phone, telegram, address, about text)
- All user-facing content now loads from database
- Admin panel extended with "Sozlamalar" section

### December 2025 Updates
- **Reply to User Questions** - Admins can now reply directly to user questions from "Bog'lanish" section via inline button
- **Broadcast with Buttons** - Admin broadcast now supports inline URL buttons (format: "button_text | url")
- **Worker Admin Management** - Super admin can add/remove worker admins via "Worker adminlar" menu in settings
- Added new database tables: `admins` (worker admin management), `user_questions` (question tracking)
- Updated admin detection to include database-managed worker admins
- Added `getAllAdminIds()` function to include both env-based and DB-based admins for notifications
