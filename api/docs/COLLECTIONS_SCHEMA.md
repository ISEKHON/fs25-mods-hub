# 📋 Appwrite Collections Schema for FS25 Mods Hub

## Required Collections for Production

### 1. **mods** Collection
```json
{
  "id": "string (unique)",
  "title": "string (required)",
  "description": "string (required)",
  "author_id": "string (required) - user ID",
  "author_username": "string (required)",
  "category_id": "string (required)",
  "category_name": "string (required)",
  "version": "string (required)",
  "file_size": "integer (optional) - in bytes",
  "download_url": "string (required) - direct link to ZIP file",
  "thumbnail_url": "string (required) - direct image URL for mod preview",
  "screenshots": "array of strings (optional) - direct image URLs",
  "tags": "array of strings",
  "download_count": "integer (default: 0)",
  "rating_average": "float (default: 0)",
  "rating_count": "integer (default: 0)",
  "status": "string (pending/approved/rejected/archived)",
  "featured": "boolean (default: false)",
  "compatibility": "array of strings",
  "requirements": "string",
  "installation_notes": "string",
  "changelog": "string",
  "created_at": "datetime",
  "updated_at": "datetime",
  "approved_at": "datetime",
  "approved_by": "string"
}
```

**Note**: Users provide direct download links to their ZIP files hosted elsewhere (Google Drive, Dropbox, etc.) AND direct image URLs for thumbnails and screenshots (Imgur, PostImage, etc.)

### 2. **mod_categories** Collection
```json
{
  "id": "string (unique)",
  "name": "string (required, unique)",
  "slug": "string (required, unique)",
  "description": "string",
  "icon": "string",
  "color": "string",
  "parent_id": "string (optional)",
  "sort_order": "integer (default: 0)",
  "mod_count": "integer (default: 0)",
  "is_active": "boolean (default: true)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### 3. **mod_reviews** Collection
```json
{
  "id": "string (unique)",
  "mod_id": "string (required)",
  "user_id": "string (required)",
  "username": "string (required)",
  "rating": "integer (1-5, required)",
  "review_text": "string",
  "helpful_count": "integer (default: 0)",
  "status": "string (pending/approved/rejected)",
  "created_at": "datetime",
  "updated_at": "datetime",
  "approved_at": "datetime"
}
```

### 4. **mod_downloads** Collection
```json
{
  "id": "string (unique)",
  "mod_id": "string (required)",
  "user_id": "string (optional)",
  "ip_address": "string",
  "user_agent": "string",
  "created_at": "datetime"
}
```

### 5. **developers** Collection
```json
{
  "id": "string (unique)",
  "user_id": "string (required)",
  "display_name": "string (required)",
  "description": "string",
  "website": "string",
  "social_links": "object",
  "verified": "boolean (default: false)",
  "total_mods": "integer (default: 0)",
  "total_downloads": "integer (default: 0)",
  "average_rating": "float (default: 0)",
  "joined_at": "datetime",
  "last_active": "datetime"
}
```

### 6. **mod_submissions** Collection
```json
{
  "id": "string (unique)",
  "mod_id": "string",
  "submitter_id": "string (required)",
  "title": "string (required)",
  "description": "string (required)",
  "category_id": "string (required)",
  "author_name": "string (required)",
  "contact_email": "string (required)",
  "contact_discord": "string (optional)",
  "version": "string (required)",
  "download_url": "string (required)",
  "image_urls": "string (JSON array of image URLs)",
  "tags": "string (JSON array of tags)",
  "files": "array of objects",
  "submission_notes": "string",
  "status": "string (pending/under_review/approved/rejected)",
  "admin_notes": "string",
  "submitted_at": "datetime",
  "reviewed_at": "datetime",
  "reviewed_by": "string"
}
```

### 7. **user_favorites** Collection
```json
{
  "id": "string (unique)",
  "user_id": "string (required)",
  "mod_id": "string (required)",
  "created_at": "datetime"
}
```

### 8. **notifications** Collection
```json
{
  "id": "string (unique)",
  "user_id": "string (required)",
  "type": "string (required)",
  "title": "string (required)",
  "message": "string (required)",
  "data": "object (optional)",
  "read": "boolean (default: false)",
  "created_at": "datetime",
  "read_at": "datetime"
}
```

### 9. **reports** Collection
```json
{
  "id": "string (unique)",
  "reporter_id": "string (required)",
  "reported_item_type": "string (mod/review/user)",
  "reported_item_id": "string (required)",
  "reason": "string (required)",
  "description": "string",
  "status": "string (pending/investigating/resolved/dismissed)",
  "admin_notes": "string",
  "created_at": "datetime",
  "resolved_at": "datetime",
  "resolved_by": "string"
}
```

## Permissions Setup

For each collection, set appropriate permissions:

### Read Permissions:
- **Public collections**: `users`, `any` for mods, categories
- **Private collections**: `users` only for profiles, favorites
- **Admin collections**: `users` with role verification

### Write Permissions:
- **User-specific**: Only document owner can update
- **Admin-only**: Only admins can approve/reject
- **Public submissions**: Authenticated users can create

## Indexes Needed

### Critical Indexes:
1. **mods**: `author_id`, `category_id`, `status`, `created_at`
2. **mod_reviews**: `mod_id`, `user_id`, `rating`
3. **user_profiles**: `user_id`, `username`, `email`
4. **user_sessions**: `user_id`, `is_active`, `expires_at`
5. **mod_downloads**: `mod_id`, `created_at`
6. **user_favorites**: `user_id`, `mod_id`

## Storage Buckets Needed

1. **avatars** - For user profile pictures only

**Note**: No storage needed for mod files or mod images - users provide direct links to both ZIP files AND image URLs hosted elsewhere (Google Drive, Dropbox, Imgur, PostImage, etc.)
