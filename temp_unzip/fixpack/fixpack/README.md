# VoiceBridge — Critical Fix Pack

Fixes the two problems from your faculty demo:

- **(A)** The child's app opened a board ("food 4×4") to an **empty grid** —
  icons never appeared, so tapping did nothing.
- **(B)** The dashboard **Library was nearly empty** (water, food, a few
  others). You needed family, toy, washroom, bed, chair — a full vocabulary.

---

## (A) Why the child's board was empty — root cause

Your `MainActivity`, `IconDao`, `FileDownloader`, `IconAdapter`, and
`AudioPlayer` were all **correct**. The break was entirely in the **sync**:

1. **`SyncManager` saved boards but never saved their icons.** The method
   `processBoardsFromSync` inserted the board rows and then stopped — the
   comment literally said *"for now we store the board"*. So
   `getIconsForBoard(boardId)` always returned an empty list → empty grid.
2. **`Board.java` had no `items` field.** The backend sends the icons nested
   inside each board (`board.items[].icon`), but with no field to receive
   them, Gson silently threw them away — so even a fixed SyncManager would
   have had nothing to insert.
3. **(latent)** Reusing one icon on several boards would have collided on the
   Room primary key. Fixed with composite IDs (`boardId_iconId`).

### Apply (Android) — into `voicebridge-android/app/src/main/java/com/voicebridge/`

| File | Action |
|---|---|
| `api/IconDto.java` | **NEW** — copy in |
| `api/BoardItemDto.java` | **NEW** — copy in |
| `models/Board.java` | **REPLACE** your existing file |
| `api/SyncManager.java` | **REPLACE** your existing file |
| `MainActivity.java` | **REPLACE** (now uses the board's real column count) |
| `BoardSelectorActivity.java` | **one-line edit** — see `BoardSelectorActivity_patch.md` |

No Gradle changes. In Android Studio: paste the files, then **Build → Clean
Project → Rebuild**, and run on your Galaxy S25.

### What you'll see after the fix
Open a board on the tablet → the grid fills with the icons the caregiver
placed. Tap an icon → it speaks. If the caregiver recorded audio, you hear
that; if not, the tablet speaks the icon's `tts_text` (e.g. *"I want to
drink water"*) via text-to-speech.

---

## (B) A full default icon library — 110 everyday icons, every one with a voice

A Django management command seeds a comprehensive vocabulary owned by a
caregiver: **family** (Mom, Dad, Grandma…), **food/drink**, **toys & play**
(toy, ball, blocks…), **body & the washroom** (washroom, brush teeth,
bath…), **furniture/home** (bed, chair, table, door…), **feelings**, **core
words** (I want, more, stop, help, yes, no…), **places**, and **emergency**.

**Audio is mandatory — nothing is cut.** Every seeded icon is generated WITH
real spoken audio so it speaks the moment it appears (e.g. *"I want to drink
water"*). The audio is synthesised once during seeding, stored on the server,
and downloaded to the tablet — so the child's app still plays it **fully
offline**. Caregivers can later replace any icon's audio with a personal
family-voice recording, and swap the placeholder image for a real photo.

### One-time setup: install a voice engine

The seed needs a text-to-speech engine to create the audio. Install **one**:

```bash
pip install gTTS        # natural Google voice; needs internet WHILE seeding
                        # supports Bangla too:  --lang bn
# — or —
pip install pyttsx3     # fully offline; uses your Windows/Mac/Linux OS voice
```

> "Needs internet while seeding" does **not** affect the child's offline use.
> Audio files are created once on your machine and cached on the tablet; the
> app plays them with Wi-Fi off, forever.

### Apply (backend) — in `voicebridge-backend/`

1. **Copy the command** into your project, preserving folders:
   ```
   icons/management/__init__.py
   icons/management/commands/__init__.py
   icons/management/commands/seed_icons.py
   ```
2. **Seed** (use your caregiver's username — e.g. admin):
   ```bash
   python manage.py seed_icons --username admin
   # Bangla voices:   python manage.py seed_icons --username admin --lang bn
   # Re-fill/replace: python manage.py seed_icons --username admin --overwrite
   ```

No model change, no migration — your `Icon.audio` field stays exactly as it
is (required). Refresh the dashboard Library: all 110 icons appear, each with
a real recorded voice clip. Drag them onto a board, sync the tablet, and the
child taps to speak.

---

## End-to-end test (the exact thing your faculty asked for)

1. Backend running, tablet logged in (child set up once).
2. On the dashboard: open the Library (now full), create a board, drag on a
   few icons, save. (Optionally upload a custom photo + record audio for one.)
3. On the tablet: tap **Sync**, open the board.
4. **Expected:** the icons appear in a grid; tapping one speaks
   ("I want to drink water"); it keeps working with Wi-Fi turned off.

---

## Honest notes

- The seeded **images** are clean placeholders (coloured cards with the
  word). Replace them with real photos over time — but they're usable today.
- The seeded **audio** is real synthesised speech so every icon speaks out of
  the box. For the icons that matter most, record a personal family-voice clip
  in the dashboard — that's the heart of the project.
- Your `Icon.audio` field stays **required**, exactly as you designed it.
  Nothing about the offline feature set was reduced.
- Before the app-store build, do a real device test of the full
  sync → open → tap → speak flow with Wi-Fi off, on more than one board, to
  confirm offline caching.
