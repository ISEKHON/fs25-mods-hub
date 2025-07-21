# FS25 Mods Hub - Appwrite Backend API

A comprehensive Node.js/Express API for the Farming Simulator 25 Mods Hub using Appwrite as the backend database and storage service.

## Features

- **Mod Management**: Upload, review, approve/reject mod submissions
- **Review System**: User reviews with moderation
- **Categories & Developers**: Organized mod categorization and developer profiles
- **Admin Dashboard**: Complete admin interface for content management
- **File Upload**: Secure file handling for mod files, thumbnails, and screenshots
- **Rate Limiting**: Protection against abuse
- **Email Notifications**: Automated emails for submissions and approvals
- **Statistics**: Comprehensive analytics and reporting

## Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your values:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Appwrite Configuration
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_BUCKET_ID=your_bucket_id

# Admin Authentication
ADMIN_TOKEN=your_secure_admin_token

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=FS25 Mods Hub <noreply@fs25modshub.com>
```

### 3. Appwrite Setup

#### Create Project
1. Go to [Appwrite Cloud](https://cloud.appwrite.io) or your self-hosted instance
2. Create a new project
3. Copy the Project ID to your `.env` file

#### Create Database
1. Go to Database section
2. Create a new database
3. Copy the Database ID to your `.env` file

#### Create Collections

Create the following collections with these attributes:

**Categories Collection** (`categories`):
- `name` (string, required, 100 chars)
- `slug` (string, required, 100 chars, unique)
- `description` (string, 500 chars)
- `icon` (string, 50 chars)

**Developers Collection** (`developers`):
- `name` (string, required, 100 chars)
- `email` (email, required, unique)
- `slug` (string, required, 100 chars, unique)
- `website` (url, 200 chars)
- `description` (string, 1000 chars)
- `verified` (boolean, default: false)

**Mods Collection** (`mods`):
- `title` (string, required, 200 chars)
- `slug` (string, required, 200 chars, unique)
- `description` (string, required, 5000 chars)
- `category_id` (string, required, relationship to categories)
- `developer_id` (string, relationship to developers)
- `version` (string, 20 chars)
- `file_size` (integer)
- `compatibility_tags` (string array)
- `pricing_type` (string, enum: free, paid, donation)
- `price` (float)
- `currency` (string, 3 chars)
- `mod_file_id` (string)
- `thumbnail_id` (string)
- `screenshot_ids` (string array)
- `download_url` (url)
- `external_link` (url)
- `status` (string, enum: approved, rejected)
- `is_featured` (boolean, default: false)
- `view_count` (integer, default: 0)
- `download_count` (integer, default: 0)
- `rating_average` (float, default: 0)
- `rating_count` (integer, default: 0)
- `approved_by` (string)
- `approved_at` (datetime)

**Mod Submissions Collection** (`mod_submissions`):
- All fields from mods collection plus:
- `author_name` (string, required, 100 chars)
- `author_email` (email, required)
- `submission_date` (datetime)
- `review_notes` (string, 1000 chars)
- `reviewed_by` (string)
- `reviewed_at` (datetime)
- `approved_mod_id` (string)

**Reviews Collection** (`reviews`):
- `mod_id` (string, required, relationship to mods)
- `reviewer_name` (string, required, 100 chars)
- `reviewer_email` (email, required)
- `rating` (integer, required, 1-5)
- `review_text` (string, 2000 chars)
- `status` (string, enum: pending, approved, rejected)
- `helpful_count` (integer, default: 0)
- `reported_count` (integer, default: 0)
- `reviewed_by` (string)
- `reviewed_at` (datetime)
- `rejection_reason` (string, 500 chars)

**Review Reports Collection** (`review_reports`):
- `review_id` (string, required, relationship to reviews)
- `reason` (string, required, 500 chars)
- `reporter_ip` (string, 45 chars)
- `status` (string, enum: pending, resolved)

**Admin Logs Collection** (`admin_logs`):
- `admin_email` (email, required)
- `action` (string, required, 100 chars)
- `resource_type` (string, required, 50 chars)
- `resource_id` (string, required)
- `details` (string, 2000 chars)
- `ip_address` (string, 45 chars)
- `user_agent` (string, 500 chars)

#### Create Storage Bucket
1. Go to Storage section
2. Create a new bucket
3. Set appropriate permissions for file uploads
4. Copy the Bucket ID to your `.env` file

#### Generate API Key
1. Go to API Keys section
2. Create a new API key with required permissions:
   - `databases.read`
   - `databases.write`
   - `files.read`
   - `files.write`
3. Copy the API key to your `.env` file

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Public Endpoints

#### Mods
- `GET /api/mods` - Get all approved mods (with filtering and pagination)
- `GET /api/mods/:slug` - Get single mod by slug
- `POST /api/mods/:slug/download` - Increment download count
- `GET /api/mods/featured/list` - Get featured mods
- `GET /api/mods/popular/list` - Get popular mods
- `GET /api/mods/recent/list` - Get recent mods
- `GET /api/mods/search/query` - Search mods

#### Submissions
- `POST /api/submissions/submit` - Submit new mod for review
- `GET /api/submissions/status/:id` - Get submission status
- `GET /api/submissions/user/:email` - Get user's submissions

#### Reviews
- `POST /api/reviews` - Submit review
- `GET /api/reviews/mod/:modId` - Get mod reviews
- `GET /api/reviews/mod/:modId/stats` - Get review statistics
- `POST /api/reviews/:reviewId/helpful` - Mark review as helpful
- `POST /api/reviews/:reviewId/report` - Report review

#### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/with-counts/list` - Get categories with mod counts

#### Developers
- `GET /api/developers` - Get all developers
- `GET /api/developers/:slug` - Get developer by slug
- `GET /api/developers/featured/list` - Get featured developers
- `GET /api/developers/search/query` - Search developers

#### Statistics
- `GET /api/stats` - Get general statistics
- `GET /api/stats/categories` - Get category statistics
- `GET /api/stats/developers` - Get developer statistics
- `GET /api/stats/activity` - Get activity statistics

### Admin Endpoints (Require Authentication)

#### Admin Dashboard
- `GET /api/admin/stats` - Get admin dashboard statistics
- `GET /api/admin/submissions` - Get mod submissions for review
- `GET /api/admin/submissions/:id` - Get single submission
- `POST /api/admin/submissions/:id/approve` - Approve submission
- `POST /api/admin/submissions/:id/reject` - Reject submission
- `GET /api/admin/reviews` - Get pending reviews
- `POST /api/admin/reviews/:id/approve` - Approve review
- `POST /api/admin/reviews/:id/reject` - Reject review

## Authentication

Admin endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer your_admin_token
```

## File Upload

The API supports file uploads for:
- **Mod files**: ZIP/RAR (max 500MB)
- **Thumbnails**: JPEG/PNG/WebP (max 10MB)
- **Screenshots**: JPEG/PNG/WebP (max 10MB each, up to 8 files)

Files are uploaded to Appwrite Storage and managed automatically.

## Rate Limiting

- General API: 100 requests per 15 minutes
- Submissions: 5 submissions per hour
- Reviews: 10 reviews per hour
- File uploads: 10 uploads per hour

## Error Handling

All endpoints return consistent JSON responses:

```json
{
  "success": true|false,
  "data": {...},
  "message": "Description",
  "meta": {...}
}
```

## Development

### File Structure

```
api/
├── config/
│   └── appwrite.js         # Appwrite client configuration
├── middleware/
│   ├── common.js           # Authentication middleware
│   ├── rateLimiter.js      # Rate limiting middleware
│   └── upload.js           # File upload middleware
├── routes/
│   ├── admin.js            # Admin management routes
│   ├── categories.js       # Category routes
│   ├── developers.js       # Developer routes
│   ├── mods.js             # Mod routes
│   ├── reviews.js          # Review routes
│   ├── stats.js            # Statistics routes
│   └── submissions.js      # Submission routes
├── utils/
│   ├── email.js            # Email notification utilities
│   └── helpers.js          # Helper functions
├── validation/
│   └── schemas.js          # Joi validation schemas
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── server.js               # Main application entry point
```

### Adding New Features

1. Create validation schema in `validation/schemas.js`
2. Add route handler in appropriate route file
3. Update this README with new endpoints
4. Test the functionality

### Testing

Test API endpoints using tools like:
- Postman
- Insomnia
- curl commands

Example curl command:

```bash
# Get all mods
curl http://localhost:3000/api/mods

# Submit a review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "mod_id": "mod_id_here",
    "reviewer_name": "John Doe",
    "reviewer_email": "john@example.com",
    "rating": 5,
    "review_text": "Great mod!"
  }'
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Set up monitoring and logging

## Support

For issues and questions:
1. Check the API logs for errors
2. Verify Appwrite configuration
3. Test with minimal examples
4. Check rate limiting if requests are failing

This API provides a complete backend for the FS25 Mods Hub with robust features for mod management, user reviews, and administrative control.
