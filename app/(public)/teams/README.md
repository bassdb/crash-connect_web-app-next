# Teams Functionality

This directory contains the complete teams management system for the DesignTemplates WebApp.

## Structure

```
teams/
├── page.tsx                    # Main teams page
├── components/
│   ├── create-team-form.tsx    # Team creation form
│   ├── teams-list.tsx          # Teams list display
│   └── team-logo-upload.tsx    # Logo upload component
├── lib/
│   └── team-assets.ts          # Team assets management utilities
└── README.md                   # This file
```

## Features

### Team Creation

- Create new teams with name, description, and slug
- Auto-generate slug from team name
- Upload team logo with drag & drop support
- Form validation with Zod
- Real-time feedback and error handling

### Team Management

- View all teams where user is a member
- Display team roles (Owner, Admin, Member)
- Team logos with fallback initials
- Creation date display
- Responsive grid layout

### Asset Management

- Organized storage structure: `teams/{team-id}/logo/`
- File validation (image types, size limits)
- Automatic cleanup of old assets
- Public URL generation for team logos

## Components

### CreateTeamForm

A comprehensive form for creating new teams with:

- Team name input with auto-slug generation
- Description textarea
- Slug input with URL preview
- Logo upload with drag & drop
- Form validation and error handling

### TeamsList

Displays existing teams with:

- Team cards with logos and information
- Role badges for team members
- Creation date display
- Empty state for users with no teams
- Loading states with skeleton cards

### TeamLogoUpload

Handles logo uploads with:

- Drag & drop interface
- File validation (type and size)
- Preview of current logo
- Remove functionality
- Upload progress indication

## Storage Structure

Team assets are organized in Supabase storage as follows:

```
team-assets/
├── teams/
│   ├── {team-id}/
│   │   ├── logo/
│   │   │   ├── {timestamp}_logo.png
│   │   │   └── ...
│   │   ├── assets/
│   │   │   └── ...
│   │   └── previews/
│   │       └── ...
│   └── ...
```

## Usage

1. Navigate to `/teams` to see the teams list
2. Click "Neues Team" to create a new team
3. Fill in the form and upload a logo
4. Submit to create the team
5. Redirect to the new team page

## Dependencies

- React Hook Form for form management
- Zod for validation
- Supabase for storage and database
- Lucide React for icons
- Tailwind CSS for styling
