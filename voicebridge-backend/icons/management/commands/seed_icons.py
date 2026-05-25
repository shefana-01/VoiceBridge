# Copyright (c) 2026 Afsara Saima Mannan
# Licensed under the PolyForm Noncommercial License 1.0. 
# See the LICENSE.txt file in the project root for full terms.

"""
Seed a comprehensive default AAC icon library for a caregiver — WITH real
spoken audio for every icon. Audio is mandatory: giving voice is the point.

Usage:
    python manage.py seed_icons --username admin
    python manage.py seed_icons --username admin --overwrite
    python manage.py seed_icons --username admin --lang bn   # Bangla voice

Each icon gets:
    * a clean, colour-coded image (generated with Pillow — always works)
    * REAL spoken audio (an MP3/WAV generated from its tts_text)

Audio is generated ONCE here, stored on the server, then downloaded to the
tablet — so the child's app still plays it fully offline. Caregivers can later
replace any icon's audio with a personal family-voice recording.

Audio engine (auto-detected, in order of preference):
    1. gTTS      — natural Google voice. `pip install gTTS`. Needs internet
                   ONCE while seeding. Supports many languages incl. Bangla (bn).
    2. pyttsx3   — fully offline, uses the OS voice. `pip install pyttsx3`.
                   On Windows this uses the built-in SAPED5 voices.
At least one must be installed.
"""
import os
import tempfile
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model

from PIL import Image, ImageDraw, ImageFont

from icons.models import Icon


# (label, tts_text) grouped by the model's Category values
VOCAB = {
    "PEOPLE": [
        ("Mom", "Mom"), ("Dad", "Dad"), ("Sister", "My sister"),
        ("Brother", "My brother"), ("Grandma", "Grandma"), ("Grandpa", "Grandpa"),
        ("Baby", "The baby"), ("Me", "Me"), ("You", "You"),
        ("Friend", "My friend"), ("Teacher", "My teacher"), ("Doctor", "The doctor"),
    ],
    "FOOD": [
        ("Water", "I want to drink water"), ("Milk", "I want milk"),
        ("Juice", "I want juice"), ("Rice", "I want rice"), ("Bread", "I want bread"),
        ("Egg", "I want an egg"), ("Banana", "I want a banana"),
        ("Apple", "I want an apple"), ("Chicken", "I want chicken"),
        ("Snack", "I want a snack"), ("Hungry", "I am hungry"),
        ("Thirsty", "I am thirsty"), ("More", "I want more"),
        ("All done", "I am all done"),
    ],
    "ACTIVITIES": [
        ("Toy", "I want my toy"), ("Ball", "I want the ball"),
        ("Car", "I want the car"), ("Doll", "I want my doll"),
        ("Blocks", "I want the blocks"), ("Book", "I want a book"),
        ("Read", "Read to me please"), ("Draw", "I want to draw"),
        ("Music", "I want music"), ("Song", "Sing a song"),
        ("TV", "I want to watch TV"), ("Tablet", "I want the tablet"),
        ("Play", "I want to play"), ("Walk", "I want to go for a walk"),
        ("Swing", "I want to swing"), ("Game", "I want to play a game"),
    ],
    "BODY": [
        ("Washroom", "I need to use the washroom"), ("Toilet", "I need the toilet"),
        ("Wash hands", "I want to wash my hands"),
        ("Brush teeth", "I want to brush my teeth"), ("Bath", "I want a bath"),
        ("Shower", "I want a shower"), ("Soap", "I need soap"),
        ("Towel", "I need a towel"), ("Hurt", "I am hurt"),
        ("Sick", "I feel sick"), ("Tired", "I am tired"),
        ("Sleepy", "I am sleepy"), ("Medicine", "I need my medicine"),
        ("Hot", "I am hot"), ("Cold", "I am cold"),
    ],
    "PLACES": [
        ("Home", "I want to go home"), ("School", "I want to go to school"),
        ("Park", "I want to go to the park"), ("Shop", "I want to go to the shop"),
        ("Hospital", "Go to the hospital"), ("Garden", "I want to go to the garden"),
        ("Outside", "I want to go outside"), ("My room", "I want to go to my room"),
    ],
    "EMOTIONS": [
        ("Happy", "I am happy"), ("Sad", "I am sad"), ("Angry", "I am angry"),
        ("Scared", "I am scared"), ("Excited", "I am excited"),
        ("Love", "I love you"), ("Calm", "I feel calm"), ("Bored", "I am bored"),
        ("Sorry", "I am sorry"), ("Surprised", "I am surprised"),
    ],
    "REQUESTS": [
        ("I want", "I want"), ("Stop", "Stop please"), ("Help", "I need help"),
        ("Please", "Please"), ("Thank you", "Thank you"), ("Yes", "Yes"),
        ("No", "No"), ("Wait", "Please wait"), ("My turn", "It is my turn"),
        ("Open", "Open it please"), ("Close", "Close it please"),
        ("Give me", "Give it to me please"), ("Look", "Look at this"),
        ("Come here", "Please come here"),
    ],
    "EMERGENCY": [
        ("Help!", "I need help right now"), ("Pain", "I am in pain"),
        ("Call Mom", "Please call my mom"), ("Emergency", "This is an emergency"),
        ("Scared", "I am very scared"), ("Hurt", "I am hurt, please help me"),
    ],
    "OTHER": [   # home items / furniture / clothes
        ("Bed", "I want to go to bed"), ("Chair", "I want to sit on the chair"),
        ("Table", "Come to the table"), ("Sofa", "I want to sit on the sofa"),
        ("Door", "Open the door"), ("Window", "Open the window"),
        ("Light", "Turn on the light"), ("Phone", "I want the phone"),
        ("Clothes", "I want to get dressed"), ("Shoes", "I want my shoes"),
        ("Blanket", "I want my blanket"), ("Pillow", "I want my pillow"),
        ("Cup", "I want my cup"), ("Spoon", "I need a spoon"),
        ("Plate", "I need a plate"),
    ],
}

CATEGORY_COLOR = {
    "PEOPLE": (224, 231, 255), "FOOD": (255, 237, 213), "ACTIVITIES": (220, 252, 231),
    "BODY": (224, 242, 254), "PLACES": (237, 233, 254), "EMOTIONS": (255, 228, 230),
    "REQUESTS": (254, 249, 195), "EMERGENCY": (254, 226, 226), "OTHER": (236, 253, 245),
}
CATEGORY_INK = {
    "PEOPLE": (49, 46, 129), "FOOD": (124, 45, 18), "ACTIVITIES": (6, 78, 59),
    "BODY": (12, 74, 110), "PLACES": (76, 29, 149), "EMOTIONS": (136, 19, 55),
    "REQUESTS": (113, 63, 18), "EMERGENCY": (153, 27, 27), "OTHER": (6, 95, 70),
}


def _load_font(size):
    for path in (
        "C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _render_tile(label, category):
    """PNG bytes for a clean, colour-coded placeholder tile."""
    W = H = 400
    bg = CATEGORY_COLOR.get(category, (240, 240, 240))
    ink = CATEGORY_INK.get(category, (30, 30, 30))
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([10, 10, W - 10, H - 10], radius=36, outline=ink, width=4)

    font = _load_font(54)
    lines, line = [], ""
    for w in label.split():
        trial = (line + " " + w).strip()
        if d.textlength(trial, font=font) <= W - 80:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)

    y = (H - len(lines) * 64) // 2
    for ln in lines:
        tw = d.textlength(ln, font=font)
        d.text(((W - tw) // 2, y), ln, font=font, fill=ink)
        y += 64

    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


# ----------------------------------------------------------------------------
# Audio synthesis — real spoken voice. Audio is MANDATORY for every icon.
# ----------------------------------------------------------------------------
def _detect_engine():
    """Return 'gtts', 'pyttsx3', or None."""
    try:
        import gtts  # noqa: F401
        return "gtts"
    except ImportError:
        pass
    try:
        import pyttsx3  # noqa: F401
        return "pyttsx3"
    except ImportError:
        pass
    return None


def _synthesize(text, lang, engine):
    """Return (audio_bytes, extension) of real spoken audio for `text`."""
    if engine == "gtts":
        from gtts import gTTS
        buf = BytesIO()
        gTTS(text=text, lang=lang).write_to_fp(buf)
        return buf.getvalue(), "mp3"

    if engine == "pyttsx3":
        import pyttsx3
        eng = pyttsx3.init()
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp.close()
        try:
            eng.save_to_file(text, tmp.name)
            eng.runAndWait()
            with open(tmp.name, "rb") as f:
                data = f.read()
        finally:
            try:
                os.unlink(tmp.name)
            except OSError:
                pass
        if not data:
            raise RuntimeError("pyttsx3 produced an empty audio file.")
        return data, "wav"

    raise RuntimeError("No TTS engine selected.")


class Command(BaseCommand):
    help = "Seed a default AAC icon library (with real spoken audio) for a caregiver."

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True,
                            help="Caregiver username who will own the icons.")
        parser.add_argument("--lang", default="en",
                            help="TTS language code (en, bn, hi, …). Default: en.")
        parser.add_argument("--overwrite", action="store_true",
                            help="Replace existing icons with the same label.")

    def handle(self, *args, **opts):
        User = get_user_model()
        try:
            owner = User.objects.get(username=opts["username"])
        except User.DoesNotExist:
            raise CommandError(f"No user named '{opts['username']}'.")

        engine = _detect_engine()
        if engine is None:
            raise CommandError(
                "No text-to-speech engine found, and audio is required for every "
                "icon.\n  Install ONE of these, then re-run:\n"
                "    pip install gTTS        (natural voice, needs internet while seeding)\n"
                "    pip install pyttsx3     (offline, uses your OS voice)"
            )
        self.stdout.write(f"Using TTS engine: {engine}  (lang={opts['lang']})")

        lang = opts["lang"]
        created, skipped, failed = 0, 0, 0

        for category, items in VOCAB.items():
            for label, tts in items:
                existing = Icon.objects.filter(owner=owner, label=label).first()
                if existing and not opts["overwrite"]:
                    skipped += 1
                    continue

                # 1) real spoken audio (mandatory) — skip the icon if this fails,
                #    never create a voiceless icon.
                try:
                    audio_bytes, ext = _synthesize(tts, lang, engine)
                except Exception as e:   # noqa: BLE001
                    failed += 1
                    self.stderr.write(f"  ! audio failed for '{label}': {e}")
                    continue

                if existing and opts["overwrite"]:
                    existing.delete()

                # 2) image
                png = _render_tile(label, category)

                slug = label.lower().replace(" ", "_").replace("!", "")
                icon = Icon(owner=owner, label=label, category=category, tts_text=tts)
                icon.image.save(f"seed_{category.lower()}_{slug}.png",
                                ContentFile(png), save=False)
                icon.audio.save(f"seed_{category.lower()}_{slug}.{ext}",
                                ContentFile(audio_bytes), save=False)
                icon.save()
                created += 1
                self.stdout.write(f"  ✓ {category:<11} {label}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Created {created} icons with spoken audio for "
            f"'{owner.username}'. Skipped {skipped} existing; {failed} failed."
        ))
        if failed:
            self.stdout.write(self.style.WARNING(
                "Some icons failed audio synthesis (often a transient network "
                "error with gTTS). Re-run with --overwrite to fill the gaps."
            ))
        self.stdout.write(
            "Every icon now speaks. Open the dashboard Library to replace any "
            "placeholder image with a real photo, or record a personal "
            "family-voice clip to make it even more meaningful."
        )
