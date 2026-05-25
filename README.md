# VoiceBridge 🗣️
### Open-Source AAC (Augmentative & Alternative Communication) Hub

> *"Communication should not be a luxury."*

VoiceBridge is a free, open-source platform that gives non-verbal individuals — particularly children with severe ASD — a digital voice. Caregivers upload pictures and record audio in their mother tongue. The child taps an icon on their tablet and the voice plays instantly, even without an internet connection.

---

## Why VoiceBridge?

Commercial AAC apps (Proloquo2Go, TouchChat) cost $200+, putting them out of reach for most families. VoiceBridge is completely free, fully customizable, and designed for real-world daily use — not just a research prototype.

Built as a personal project for my niece, who has autism and uses a Samsung tablet.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              CAREGIVER (Parent / Therapist)              │
│                                                         │
│   React.js Web Dashboard (Admin Panel)                  │
│   • Upload icon images & record mother-tongue audio     │
│   • Drag-and-drop board layout editor                   │
│   • Manage multiple children & boards                   │
└──────────────────────┬──────────────────────────────────┘
                       │  REST API (JWT Auth)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Django + PostgreSQL)               │
│                                                         │
│   • Caregiver accounts with roles (Parent/Therapist)    │
│   • Communication boards with grid layout system        │
│   • Secure media storage (images + audio)               │
│   • Incremental sync endpoint for offline Android app   │
│   • Community Hub — share boards with other families    │
└──────────────────────┬──────────────────────────────────┘
                       │  Sync once → works offline forever
                       ▼
┌─────────────────────────────────────────────────────────┐
│              CHILD'S TABLET (Native Android / Java)      │
│                                                         │
│   • Simple grid of icon tiles — tap to speak            │
│   • Audio plays from local storage (zero latency)       │
│   • TTS fallback if audio file is unavailable           │
│   • 100% offline after first sync                       │
│   • Room (SQLite) database for local data               │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Android App | Java (Native Android) | Child's offline communication interface |
| Web Dashboard | React.js | Caregiver board editor & icon manager |
| Backend API | Django REST Framework | Auth, media storage, sync endpoints |
| Database | PostgreSQL | Production data store |
| Offline DB | SQLite (Room) | On-device cache for the Android app |
| Auth | JWT (SimpleJWT) | Stateless auth for mobile + web |

---

## Project Structure

```
voicebridge/
├── voicebridge-android/     # Native Java Android app (child's interface)
├── voicebridge-backend/     # Django REST API + PostgreSQL
│   ├── accounts/            # Caregiver auth + Child profiles
│   ├── boards/              # Communication board management
│   ├── icons/               # Icon images + audio upload
│   ├── community/           # Shared board templates hub
│   └── config/              # Django settings, URLs
└── voicebridge-frontend/    # React.js caregiver admin dashboard
```

---

## Getting Started

### Backend Setup (PyCharm)
```bash
cd voicebridge-backend
pip install -r requirements.txt

# Create .env from template
copy .env.example .env
# Edit .env — fill in your PostgreSQL password

python manage.py makemigrations accounts icons boards community
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API docs available at: `http://127.0.0.1:8000/api/docs/`

### Android Setup (IntelliJ IDEA / Android Studio)
1. Open `voicebridge-android/` as an Android project
2. Sync Gradle (`File → Sync Project with Gradle Files`)
3. Connect your Android device
4. Run — enter your server IP and caregiver credentials on first launch

### Frontend Setup
```bash
cd voicebridge-frontend
npm install
npm start
```

---

## Key Features

- ✅ **Zero cost** — completely free and open source
- ✅ **Mother-tongue audio** — caregivers record in any language
- ✅ **100% offline** — works without Wi-Fi after first sync
- ✅ **No login for the child** — tap and go
- ✅ **TTS fallback** — child's voice never goes silent
- ✅ **Community Hub** — families share boards globally
- ✅ **Incremental sync** — only downloads what changed

---

## Contributing

This project is open for collaboration. If you are a therapist, developer, or parent with ideas — pull requests are welcome.

---

## License

MIT License — free to use, modify, and distribute.
