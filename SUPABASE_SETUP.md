# Supabase Setup Guide

This project uses Supabase for its backend database and storage. Follow these steps to set up your environment.

## 1. Create a Supabase Project
1.  Go to [Supabase](https://supabase.com/) and sign in.
2.  Click "New Project".
3.  Choose your organization, name your project (e.g., "Garden Companion"), and set a database password.
4.  Select a region close to you (e.g., EU West - Ireland).
5.  Click "Create new project".

## 2. Run Database Migrations
1.  Once your project is ready, go to the **SQL Editor** (icon on the left sidebar).
2.  Click "New query".
3.  Copy the contents of `supabase/migrations/001_initial_schema.sql` from this project.
4.  Paste it into the SQL Editor.
5.  Click **Run** (bottom right).
    *   *Note: This will create all the necessary tables and set up security policies.*

## 3. Configure Storage
1.  Go to **Storage** (icon on the left sidebar).
2.  Click "New Bucket".
3.  Name the bucket `plant-photos`.
4.  Toggle "Public bucket" to **ON**.
5.  Click "Save".
6.  **Important**: You need to add a policy to allow users to upload images.
    *   Go to the `plant-photos` bucket configuration (Configuration tab).
    *   Under "Policies", click "New Policy".
    *   Choose "For full customization".
    *   Name: "Allow authenticated uploads".
    *   Allowed operations: Select `INSERT`, `SELECT`, `UPDATE`, `DELETE`.
    *   Target roles: `authenticated`.
    *   Click "Review" and "Save".

## 4. Connect Your App
1.  Go to **Project Settings** (cog icon) -> **API**.
2.  Copy the **Project URL** and **anon public key**.
3.  Create a `.env.local` file in the root of your project (if it doesn't exist).
4.  Add the following lines:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 5. Restart Development Server
If your development server is running, restart it to load the new environment variables.

```bash
npm run dev
```

## Verification
You can verify the setup by logging into the app and trying to add a plant or upload a photo. The data should now persist in your Supabase dashboard.
