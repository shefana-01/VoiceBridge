# VoiceBridge

![VoiceBridge Banner](banner.png)

> **VoiceBridge** is a beautifully crafted, open-source, and offline-first Augmentative and Alternative Communication (AAC) platform. It is purpose-built to empower non-verbal individuals, ensuring that every child—regardless of their background or internet access—has a voice.

Motivated by deep personal experience supporting a loved one with autism, VoiceBridge was built to break down barriers. While we draw immense inspiration from incredible, advanced AAC solutions like Proloquo2Go that have pioneered this space, VoiceBridge focuses on a distinctly vital mission: serving communities in low-resource environments. We provide a platform that is entirely free, Android-first, and beautifully optimized for native-language (such as Bangla) support without relying on constant internet connectivity.

### 🌟 Why VoiceBridge Stands Out
- **Truly Accessible & Free:** 100% open-source with no hidden costs, subscriptions, or paywalls.
- **Android-First Design:** Optimized for affordable tablets and smartphones, making it accessible globally.
- **Mother-Tongue Ready:** Easily record custom audio in any language or dialect, embracing cultural nuances seamlessly.
- **Offline Reliability:** Once synced, the child's app works entirely offline—perfect for areas with zero connectivity.

## ✨ Detailed Feature Review

### 🪷 Caregiver Web Portal (React)
Our portal is a secure, comprehensive "Sanctuary Dashboard" allowing caregivers to mindfully manage their child's communication journey.
- **Sanctuary Dashboard & Analytics** — Get a clear overview of active boards, daily usage insights, communication progress, and a mindful Care Journal.
- **Advanced Board Editor** — A three-panel, Canva-style editor featuring a drag-and-drop icon library, live canvas, and real-time item properties.
- **Custom Asset Creator & Asset Library** — Upload personal photos and record up to 10 seconds of mother-tongue audio. Assets are tracked across all boards with bulk upload support.
- **Community Hub & Review** — Browse, filter, and one-click clone vetted board templates. Leave detailed reviews and share feedback with a global network of caregivers.
- **Maintenance & Security** — Robust system tools and a dedicated Maintenance page ensure the platform remains secure and optimized.
- **Schedule & Routine Management** — Set daily communication goals and schedule routines to build consistent habits for the child.
- **Version History** — Every save is snapshotted for non-destructive restores. 
- **Multi-Child Profiles** — Easily manage separate boards and vocabularies for multiple individuals under your care.
- **Fully Responsive** — Seamlessly adapts from desktop editing to mobile management on the go.

### 📱 Child's Tablet App (Android, Java)
Built natively for performance, ensuring the child experiences zero friction when communicating.
- **Zero-Latency Playback** — Custom SoundPool-based audio engine ensures speech starts instantly upon tapping—critical for motor-association in AAC.
- **PECS-Style Sentence Strip** — Children can tap multiple icons to compose a phrase, then tap "Speak" to play the full sequence aloud.
- **Offline-First via Room DB** — Local caching of all media and database entries ensures the app functions perfectly in areas with zero connectivity.
- **Background & Manual Sync** — WorkManager refreshes boards automatically when the network is available, with instant manual sync always an option.
- **Kiosk & Immersive Mode** — Distraction-free, full-screen landscape boards with screen-pinning to prevent accidental app exits.

### 🔒 Backend & Security (Django REST Framework)
A robust, secure, and scalable foundation powering the VoiceBridge ecosystem.
- **JWT Authentication** with seamless refresh-token rotation.
- **Strict Owner-Scoped Data** — Every query is securely filtered; caregivers can only access their own data, enforced deeply via the Django ORM.
- **Comprehensive Audit Logs** — Every mutation (create/update/delete) is recorded for security and transparency.
- **Hardened API** — Protected with throttling, CORS, and HSTS. Auto-generated OpenAPI (Swagger) docs via `drf-spectacular`.

## 🏗️ Architecture

```text
┌────────────────────┐         ┌────────────────────┐
│  Caregiver Browser │         │    Child Tablet    │
│  React + Tailwind  │         │  Android · Room    │
│  (Web Audio)       │         │  SoundPool engine  │
└─────────┬──────────┘         └─────────┬──────────┘
          │  HTTPS / JWT                 │  incremental sync · media download
          ▼                              ▼
        ┌──────────────────────────────────────┐
        │          Django REST API             │
        │  /api/v1/                            │
        └───────────┬──────────────┬───────────┘
                    │ Django ORM   │ media (image / audio)
                    ▼              ▼
            ┌──────────────┐  ┌──────────────┐
            │  PostgreSQL  │  │  /media/      │
            │  (source of  │  │  (S3-ready)   │
            │   truth)     │  │               │
            └──────────────┘  └──────────────┘
```

All caregiver edits flow through PostgreSQL. The child's tablet pulls boards on demand, caches them locally, and downloads media to device storage. After the first sync, the tablet becomes fully autonomous.

## 📂 Repository Structure

The project has evolved significantly, structured into three distinct codebases:

```text
voicebridge/
├── voicebridge-backend/         # Django REST API (Python)
│   ├── accounts/                # Caregiver, Child, AuditLog, CareNote
│   ├── analytics/               # Usage insights and progress tracking
│   ├── api/                     # Core API endpoints & Swagger docs
│   ├── boards/                  # Board logic, versions, and sync
│   ├── community/               # Shared template hub
│   ├── icons/                   # Icon and audio asset management
│   ├── media/                   # Local storage for user uploads
│   └── notifications/           # System and sync notifications
│
├── voicebridge-frontend/        # Caregiver Web Portal (React)
│   └── src/
│       ├── api/                 # Axios clients and interceptors
│       ├── components/          # Reusable UI components
│       ├── context/             # Global state management
│       ├── pages/               # About, Analytics, BoardEditor, Community,
│       │                        # Dashboard, Journal, Security, Settings...
│       └── services/            # Business logic and external integrations
│
└── voicebridge-android/         # Child Tablet App (Native Android/Java)
    └── app/src/main/java/com/voicebridge/
        ├── adapters/            # RecyclerView adapters for icons & boards
        ├── api/                 # Retrofit API interfaces
        ├── db/                  # Room SQLite definitions
        ├── models/              # Local data entities
        ├── sync/                # Background sync workers
        ├── ui/                  # MainActivity, BoardSelectorActivity, Login
        └── utils/               # AudioPlayer, permissions, helpers
```

## 🛠️ Tech Stack & Tooling

Here is the setup I use to build and test VoiceBridge:
- **My Setup:** PyCharm Professional (for both Backend and Frontend) and IntelliJ IDEA Ultimate (for Android).
- **For Contributors:** Feel free to use whatever editor you're most comfortable with (like VS Code or Android Studio).
- **Hardware tested on:** MSI Thin 15 (Development) and Samsung Galaxy S25 (Mobile Testing).
- **Version Control:** Git & GitHub

## 🚀 Getting Started

### Prerequisites
- Python 3.11+ and PostgreSQL 14+
- Node.js 18+ and npm
- Android Studio or IntelliJ IDEA Ultimate (for the mobile app)

### 1. Backend Setup
```bash
cd voicebridge-backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Database setup in PostgreSQL:
#   CREATE DATABASE voicebridge_db;
#   CREATE USER voicebridge_user WITH PASSWORD '<your-password>';
#   GRANT ALL PRIVILEGES ON DATABASE voicebridge_db TO voicebridge_user;

cp .env.example .env               # Configure SECRET_KEY and DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver         # http://localhost:8000
```
*API docs available at `http://localhost:8000/api/schema/swagger-ui/`.*

### 2. Frontend Setup
```bash
cd voicebridge-frontend
npm install
npm start                          # http://localhost:3000
```

### 3. Mobile Setup (Android)
Open the `voicebridge-android/` folder in Android Studio or IntelliJ IDEA Ultimate. Let Gradle sync dependencies. Run on an emulator (ensure server URL is set to `http://10.0.2.2:8000/`) or directly on a physical device like a Samsung Galaxy S25 connected to the same network.

## 🗺️ Roadmap & Future Vision

We are constantly evolving to provide the best possible experience. Here is what is on the horizon:
- 🔐 **Multi-factor authentication (TOTP)** for caregiver accounts.
- ☁️ **Cloud media storage** (AWS S3 / GCS via django-storages) for seamless asset syncing.
- 🎨 **Atmospheric child interface** — pastel-gradient theme with High-Contrast and ARIA-inspect accessibility toggles.
- ❤️ **Vitals tracking integration** to correlate communication patterns with physical well-being.
- ⚡ **Real-time push sync** (FCM) to replace periodic polling, making updates instant.
- 🩺 **Clinical pilot & validation** working closely with professional speech-language therapists.

## 🤝 Join Our Community (Contributing)
We warmly welcome contributions from developers, designers, and therapists! Please fork the repository, create a feature branch, and open a pull request. For major architectural changes, please open an issue first to discuss your brilliant ideas.

## 📄 License & Legal
This project is licensed under the **PolyForm Noncommercial License 1.0.** - see the [LICENSE.txt](LICENSE.txt) file for details.
