# Manasthiti: Mental Health Platform

## Overview
Manasthiti (meaning State of Mind in Nepali) is a comprehensive mental health web application designed to provide immediate psychological first aid and community support. The platform is built to be universally accessible, offering full bilingual support in English and Nepali. 

It balances user privacy with personalized care by allowing users to access all features completely anonymously, with the optional ability to create a secure account to save their progress across devices.

## What It Does the Core Features

### 1. Phoenix AI Companion
An intelligent conversational assistant tuned specifically for crisis de-escalation and cognitive behavioral therapy techniques. 
- Users can type or speak directly to Phoenix using their microphone.
- The AI provides structured, empathetic, and highly readable guidance to help users navigate tough moments.

### 2. Anonymous Support Groups
A real-time community forum where users can connect with others facing similar challenges.
- Conversations happen instantly without the need to refresh the page.
- The platform uses automated filters to block toxic or abusive language, ensuring a safe and supportive space.
- Accurate live counters show exactly how many people are online in a room at any given moment.

### 3. Mood Tracking Dashboard
Users can take a quick daily assessment to calculate their current stress levels.
- Results are securely saved and plotted on an interactive, visual line graph.
- This helps users track their mental health trends over time to identify what triggers their stress.

### 4. Interactive Resource Library
A collection of self-help tools focused on grounding and relaxation.
- Includes a built-in audio player for streaming guided breathing exercises and meditation sessions.
- Features interactive journaling prompts configured to stay entirely private to the user's local device.

---

## Technical Architecture

### Frontend
- React.js: Powers the user interface and fast client-side routing.
- Recharts: Renders the dynamic data visualizations for mood tracking.
- i18next: Manages the seamless, real-time translation toggling between English and Nepali without page reloads.
- Web Speech API: Integrates native browser voice-to-text accessibility.

### Backend and Infrastructure
- Supabase : Serves as the primary database, ensuring high availability and secure data warehousing.
- Supabase Realtime: Powers the live community chatting features and active user presence tracking via WebSockets.
- Hybrid Authentication: The application automatically provisions a secure, anonymous session token on the user's first visit. This secures their data instantly via database constraints. Users can later link an email address to permanently save their profile.

### Artificial Intelligence
- Google Gemini 1.5 Flash SDK: Drives the logic and empathy of the Phoenix Chatbot. 
- The integration includes a built-in dynamic failover mechanism to seamlessly switch to a backup API key if primary rate limits are reached, preventing the UI from crashing during a crisis.

---

## Installation and Setup

To run Manasthiti on your local machine:

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/shubhampuri264-cell/Mental-Health-Web-App.git
cd "Mental Health Web App"/manasthiti
npm install
```

2. Set up environment variables:
Create a file named `.env` in the root of the project and add your API keys:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GEMINI_API_KEY=your_primary_gemini_key
REACT_APP_GEMINI_API_KEY_BACKUP=your_backup_gemini_key
```

3. Start the application:
```bash
npm start
```
The app will launch at http://localhost:3000.

## Security and Privacy
Manasthiti uses strict Row Level Security on its databases. By assigning anonymous authentication tokens to all visitors automatically, the platform actively blocks automated bots and malicious scrapers from accessing or altering the community data APIs.
