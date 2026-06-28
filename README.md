# VoiceBridge

![VoiceBridge Banner](banner.png)

VoiceBridge is an open-source, offline-first Augmentative and Alternative Communication (AAC) platform designed to bridge the communication gap for non-verbal individuals, particularly in low-resource environments. 

Motivated by personal experience supporting a loved one with autism, VoiceBridge was built to be accessible to everyone. While we draw deep inspiration from incredible, advanced AAC solutions like Proloquo2Go that have pioneered this space, VoiceBridge focuses on a distinct mission: serving communities that require free, Android-first, and native-language (such as Bangla) support without relying on constant internet connectivity.

**Why Choose VoiceBridge?**
- **Truly Accessible:** 100% free and open-source.
- **Android-First:** Designed for affordable tablets and smartphones widely available globally.
- **Mother-Tongue Ready:** Easily record custom audio in any language or dialect, complete with cultural nuances.
- **Offline Reliability:** Once synced, the child's app works entirely offline—no internet required.

## ✨ Key Features

### 🪷 Caregiver Web Portal (React)
Our portal is designed as a secure, comprehensive "Sanctuary Dashboard" for caregivers to manage their child's communication journey.
- **Sanctuary Dashboard & Analytics** — Get a clear overview of active boards, daily usage insights, communication progress, and a mindful Care Journal.
- **Advanced Board Editor** — A three-panel, Canva-style editor featuring a drag-and-drop icon library, live canvas, and real-time item properties.
- **Custom Asset Creator & Asset Library** — Upload personal photos and record up to 10 seconds of mother-tongue audio. Assets are tracked across all boards with bulk upload support.
- **Community Hub** — Browse, filter, and one-click clone vetted board templates shared by a global network of caregivers.
- **Version History & Security** — Every save is snapshotted for non-destructive restores. Robust security settings ensure privacy.
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

## 🚀 Getting Started

### Prerequisites
- Python 3.11+ and PostgreSQL 14+
- Node.js 18+ and npm
- Android Studio (for the mobile app)

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
Open the `voicebridge-android/` folder in Android Studio. Let Gradle sync dependencies. Run on an emulator (ensure server URL is set to `http://10.0.2.2:8000/`) or directly on an Android tablet connected to the same network.

## 🗺️ Roadmap

- **Multi-factor authentication (TOTP)** for caregiver accounts.
- **Cloud media storage** (AWS S3 / GCS via django-storages).
- **Atmospheric child interface** — pastel-gradient theme with High-Contrast and ARIA-inspect accessibility toggles.
- **Vitals tracking integration**.
- **Real-time push sync** (FCM) to replace polling.
- **Clinical pilot & validation** with speech-language therapists.

## 🤝 Contributing
We warmly welcome contributions! Please fork the repository, create a feature branch, and open a pull request. For major architectural changes, please open an issue first to discuss your ideas.

## 📄 License
This project is licensed under the PolyForm Noncommercial License 1.0. - see the [LICENSE.txt](LICENSE.txt) file for details.
