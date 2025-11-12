# Framez - Social Media Mobile App

A real-time social media application built with React Native and Expo

## 📹 Demo Video

https://drive.google.com/file/d/1yNxiUYGjjW0OWgODYYQhTuHZemrxHJqk/view?usp=sharing

## 📑 Table of Contents

- [Framez - Social Media Mobile App](#framez---social-media-mobile-app)
  - [📹 Demo Video](#-demo-video)
  - [📑 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
    - [Authentication \& User Management](#authentication--user-management)
    - [Posts \& Feed](#posts--feed)
    - [User Experience](#user-experience)
  - [🛠 Tech Stack](#-tech-stack)
    - [Frontend](#frontend)
    - [Backend \& Services](#backend--services)
    - [Testing](#testing)
  - [🌐 Backend Services](#-backend-services)
    - [Supabase Configuration](#supabase-configuration)
      - [Database Tables](#database-tables)
      - [Database Triggers](#database-triggers)
      - [Storage Buckets](#storage-buckets)
      - [Row Level Security (RLS)](#row-level-security-rls)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Database Setup](#database-setup)
    - [Running the App](#running-the-app)
  - [🧪 Testing](#-testing)
  - [📁 Project Structure](#-project-structure)
  - [🎯 Key Features Explained](#-key-features-explained)
    - [Real-time Feed Updates](#real-time-feed-updates)
    - [Username/Display Name System](#usernamedisplay-name-system)
    - [Image Upload Flow](#image-upload-flow)
    - [Auto-logout on Invalid Session](#auto-logout-on-invalid-session)

## ✨ Features

### Authentication & User Management
- 🔐 **User Registration** - Sign up with email, password, and custom username
- 🔑 **User Login** - Secure authentication with session management
- 👤 **User Profiles** - Display user information with custom display names
- 🚪 **Logout** - Secure session termination
- ✅ **Email Confirmation** - Optional email verification (configurable)
- 🔄 **Auto-logout** - Automatic logout on invalid/expired sessions

### Posts & Feed
- 📝 **Create Posts** - Share text updates with optional images
- 🖼️ **Image Upload** - Upload and attach images to posts
- 📱 **Real-time Feed** - Live updates when new posts are created
- 🔄 **Pull to Refresh** - Manual feed refresh capability
- 👥 **User Attribution** - Posts display author's username/display name
- ⏱️ **Timestamps** - Relative time display (e.g., "2h ago")

### User Experience
- 🎨 **Clean UI** - Modern, intuitive interface with tab navigation
- ⚡ **Fast Performance** - Optimized with Zustand state management
- 📊 **Loading States** - Clear feedback during async operations
- ❌ **Error Handling** - User-friendly error messages
- 🔔 **Success Messages** - Confirmation feedback for actions
- 📱 **Responsive Design** - Works on various screen sizes

## 🛠 Tech Stack

### Frontend
- **React Native** - Mobile app framework
- **Expo** - Development platform and tooling
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library (Stack & Bottom Tabs)
- **Zustand** - Lightweight state management
- **Expo Image Picker** - Image selection from device

### Backend & Services
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL Database
  - Authentication
  - Storage (for images)
  - Real-time subscriptions
  - Row Level Security (RLS)

### Testing
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing

## 🌐 Backend Services

### Supabase Configuration

#### Database Tables

**1. profiles**
```sql
- id (UUID, Primary Key, references auth.users)
- email (TEXT, NOT NULL)
- display_name (TEXT)
- created_at (TIMESTAMPTZ, default NOW())
```

**2. posts**
```sql
- id (UUID, Primary Key, default gen_random_uuid())
- user_id (UUID, Foreign Key -> profiles.id)
- text (TEXT, NOT NULL)
- image_url (TEXT, nullable)
- created_at (TIMESTAMPTZ, default NOW())
```

#### Database Triggers

**Auto-create Profile on User Signup**
```sql
CREATE OR REPLACE FUNCTION sync_display_name_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_display_name_to_profile();
```

#### Storage Buckets
- **post-images** - Stores user-uploaded post images

#### Row Level Security (RLS)
- Users can view all profiles and posts
- Users can only update their own profile
- Users can create posts as themselves
- Automatic CASCADE delete for related data

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/framez.git
cd framez
```

2. **Install dependencies**
```bash
npm install
```

### Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for profiles
CREATE POLICY "Users can view all profiles" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 5. Create RLS Policies for posts
CREATE POLICY "Users can view all posts" 
  ON posts FOR SELECT 
  USING (true);

CREATE POLICY "Users can create posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = user_id);

-- 6. Create trigger function
CREATE OR REPLACE FUNCTION sync_display_name_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    display_name = COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    email = NEW.email;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_display_name_to_profile();

-- 8. Enable Realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
```

**Create Storage Bucket**:
1. Go to Storage in Supabase Dashboard
2. Create a new bucket named `post-images`
3. Set it to **Public** bucket
4. Add policy to allow authenticated uploads

### Running the App

**Start the development server**:
```bash
npm start
```

**Run on specific platform**:
```bash
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web browser
```

**Scan QR code** with Expo Go app on your physical device to test.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

**Test Coverage**:
- 112 tests passing
- Unit tests for all services
- Component tests for UI elements
- Integration tests for screens
- Store tests for state management

## 📁 Project Structure

```
framez/
├── components/          # Reusable UI components
│   ├── ImagePickerButton.tsx
│   ├── PostCard.tsx
│   ├── PostForm.tsx
│   ├── UserHeader.tsx
│   └── UserPostsList.tsx
├── screens/            # App screens
│   ├── CreatePostScreen.tsx
│   ├── FeedScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   └── SignUpScreen.tsx
├── services/           # API & business logic
│   ├── authService.ts
│   ├── postService.ts
│   └── userService.ts
├── stores/             # State management (Zustand)
│   ├── authStore.ts
│   ├── postsStore.ts
│   └── userStore.ts
├── types/              # TypeScript type definitions
│   └── post.ts
├── lib/                # Library configurations
│   └── supabase.ts
└── App.tsx             # Main app entry point
```

## 🎯 Key Features Explained

### Real-time Feed Updates
The app uses Supabase Real-time to subscribe to database changes. When any user creates a post, all connected clients receive the update instantly via WebSockets.

```typescript
// Real-time subscription in FeedScreen
const subscription = postService.subscribeToPostsRealtime((newPost) => {
  fetchPosts(); // Refresh feed
});
```

### Username/Display Name System
- Users choose a username during signup
- Username is stored in `auth.users.raw_user_meta_data.display_name`
- Trigger automatically syncs to `profiles.display_name`
- PostCard displays username instead of email

### Image Upload Flow
1. User selects image from device
2. Image is converted to ArrayBuffer
3. Uploaded to Supabase Storage bucket
4. Public URL is returned and stored with post
5. Image is displayed in feed

### Auto-logout on Invalid Session
If a user's session expires or becomes invalid:
1. App detects auth error
2. Automatically logs user out
3. Redirects to login screen
4. Shows appropriate error message

