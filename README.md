# Manasthiti
> A bilingual, AI-powered mental health companion and crisis platform

Manasthiti (meaning State of Mind in Nepali) is a comprehensive mental health web application designed to provide immediate psychological first aid and anonymous community support. The platform is universally accessible, offering seamless bilingual support in English and Nepali. 

It balances absolute user privacy with personalized care by allowing users to access all features completely anonymously, with the data heavily protected by Row Level Security (RLS).

---

## Core Features

### 1. Phoenix AI Companion
An intelligent conversational assistant tuned specifically for crisis de-escalation, empathy, and cognitive behavioral therapy techniques. 
- **Voice-to-Text**: Users can type or speak directly to Phoenix using native browser speech recognition.
- **Graceful Degradation**: Phoenix employs strict rate-limiting and custom modals to gracefully handle API Quota limits without crashing, ensuring a safe experience during a crisis.
- **Dynamic Failover**: Seamlessly switches to backup proxy models (like `gemini-1.5-flash-8b`) if primary rate limits are actively exhausted.

### 2. Anonymous Support Groups
A real-time community forum where users can connect with others facing similar challenges.
- **Live Sync**: Conversations happen instantly via WebSockets without page reloads.
- **Safe Spaces**: Automated filters block toxic or abusive language, ensuring a welcoming environment.
- **Active Presence**: Accurate live counters show precisely how many people are online in a room at any given moment.

### 3. Mood Tracking Dashboard
Users can take a quick daily assessment to calculate their emotional weight and stress levels.
- Results are securely saved and plotted on an interactive, visual line graph.
- Helps users track their mental health trends over time to identify what triggers their stress.

### 4. Interactive Resource Library
A beautiful, static-fallback architecture housing self-help tools focused on grounding and relaxation.
- **Emergency Helplines**: High-contrast, immediate fast-dial buttons for the US 988 Suicide Lifeline and Nepal TUTH Helplines.
- Features interactive journaling prompts configured to stay entirely private to the user's local device.

---

## Technical Architecture & Performance

Manasthiti has been heavily optimized for maximum speed and minimal bandwidth on mobile devices:

- **Aggressive Code Splitting**: The entire application uses `React.lazy()` and `<Suspense>`, dynamically breaking down the massive JavaScript bundle. Users download *only* the screen they are currently viewing, making the initial "Time to Interactive" nearly instant.
- **Vercel Edge Caching**: A customized `vercel.json` intercepts all static asset requests, appending `Cache-Control: public, max-age=31536000, immutable` headers. This pushes the frontend directly to Vercel's Edge CDN worldwide.
- **i18next**: Manages the seamless, real-time translation toggling between English and Nepali without expensive server roundtrips.
- **Google Gemini 2.0 Flash**: Drives the logic and empathy of the Phoenix Chatbot at blisteringly fast speeds.

## Security and Privacy
Manasthiti uses strict Row Level Security (RLS) on its databases. By assigning anonymous authentication tokens to all visitors automatically upon arrival, the platform actively blocks automated bots and malicious scrapers from accessing or altering the community data APIs, while guaranteeing user privacy.

## Website URL Deployed on vercel
https://mental-health-web-app-delta.vercel.app/