# Mad Minute Automotive — SPEC

**Owner:** Mana Industries LLC
**Repo:** manafest01/MadMinute
**Status:** Focus project. Only the current phase gets built.

## What it is
Mad Minute Automotive is a timed quiz trainer for automotive technicians. It runs on the Mad Minute engine and moves techs from novice to master through short, rewarding quiz rounds.

## Who it's for
- **Techs:** to build and prove their knowledge.
- **Shop managers:** to see crew progress for coaching and job assignment, not punishment.
- **First audience:** a demo for a shop manager contact. A larger automotive company is the long-term target.

## Rules that never change
- The original electrical Mad Minute stays separate and untouched.
- Automotive content stays separate from the DJ (Booth Ready), Biology, Music Theory and Dev versions.
- The app works with no internet once it's downloaded.
- Techs can choose their own path. Nothing is strictly locked.

## Modules (easy → hard)
In the app these are the 10 steps of the **Shop Path**, spread across 5 subjects (Automotive Technician, Basic Maintenance, 12 V & 48 V, Vehicle Networks, High Voltage) and 35 topics.

1. Shop Safety
2. Basic Maintenance
3. Wheels & Tires
4. Brakes
5. Steering
6. 12 V Electrical
7. Engine
8. Drivetrain
9. CAN Bus (its own section)
10. High Voltage / HVIL

---

## Phase 1 — Demo build (CURRENT)
Goal: something you can hand someone at work and they say "yes."

**Done when:**
- [x] All 10 modules are playable on your phone.
- [x] It works in airplane mode after the first load.
- [x] It has a home-screen icon (it opens like an app).
- [x] A "DEMO" watermark is visible on every screen.
- [x] Each round shows a score and the missed questions at the end.
- [x] Progress is saved on the phone between sessions.
- [x] Fast, correct electrical answers suggest the 12 V / 48 V modules (Smart jump).
- [x] Each module has a **Vocabulary** button that opens flashcards for that module's terms (e.g., Wheels & Tires: tire size codes, carcass, ply rating; HV: isolation, HVIL, PPE terms).
- [x] Key terms inside quiz questions are tappable and show a quick definition.
- [x] Missed cards come back sooner; known cards come back less often.
- [x] Terms tied to a missed quiz question are added to a "My Weak Words" deck.
- [x] **Diagnostic labs** ("wow" feature, pulled forward from Phase 2): Circuit Lab (12 V circuit with a virtual meter: working, open wire, bad ground, short to ground) and CAN bus Lab (scope plus volts and ohms: working, CAN-H to ground, CAN-L to battery, H and L shorted, missing terminator). Learn and Quiz modes, +10 XP per right answer.
- [ ] It's live at a shareable GitHub link (the app is; the vocabulary and labs go live once merged).
- [ ] You've run it start to finish on your phone with no broken buttons.

## Phase 2 — Smart learning
- Already built: placement test, skills checkup and roadmap, Recall first (switch on Home).
- Lab upgrades: voltage-drop mode (both leads across one part), more faults (bad switch, high-resistance connector, open ground), CAN pinpoint mode (unplug modules to find the one pulling the bus down), DLC pin 6/14 view, and an HV isolation lab.
- Fact-check every lab value and vocabulary card against service information.

## Phase 3 — Manager crew view
- Techs' results sync to the manager's device when they're on the same Wi-Fi.
- The crew overview shows activity minutes and days per week, plus commonly missed questions.

## Later list (park ideas here, don't build)
- Paywall ($1 basic + premium unlock)
- Apple App Store / Google Play
- SharePoint version
- Copyright filing
- AI study-prompt methods (Feynman explain-back, 20-hour plan, etc.)

## Decided
- Both diagnostic labs are in the demo as the "wow" feature. Polish the look later.

## Open questions
- How many questions per module for the demo?
- Will it show Mana Industries branding or a neutral look for the pitch?
