# Mad Minute Auto — Demo

One-minute automotive knowledge drills from **Mana Industries LLC**.

**Open it:** https://manafest01.github.io/MadMinute/

## Put it on your phone (with its own icon)
1. Open the link above on your phone.
2. **iPhone (Safari):** tap Share → **Add to Home Screen**.
   **Android (Chrome):** tap ⋮ → **Install app** (or Add to Home Screen).
3. Open it once from the new **AUTO** icon. After that it works with **no internet**.

## What's inside
Five subjects, 600 questions each:
- **Automotive Technician**: 9 topics, ordered easy to hard (Shop Safety → Tires & Wheels → Brakes → Steering & Suspension → Engine → Drivetrain → Heating & A/C)
- **Basic Maintenance**: oil & filter service, fluids & levels, belts/hoses/filters, battery/lights/wipers, under-car checks, and inspections & intervals
- **12 V & 48 V Electrical**: batteries, starting & charging, wiring, sensors & actuators, test tools, and 48 V mid-voltage systems
- **Vehicle Networks**: CAN, LIN and other networks, OBD-II & UDS, automotive Ethernet, and DoIP
- **High Voltage**: HV safety & PPE, isolation, HVIL & interlocks, contactors & shutdown, HV battery & BMS, and inverter, motor & charging

A **Shop Path** card on the home screen walks a new tech through all five subjects in order: Shop Safety → Basic Maintenance → Tires & Wheels → Brakes → Steering → 12 V & 48 V → Engine → Drivetrain → Vehicle Networks → High Voltage. Tap any step to jump to it.

**Vocabulary**: 408 flashcard terms, one deck per topic (tire size codes, CAN-H/CAN-L, HVIL and more). "Got it" pushes a card out to 1, 3, 7, 21 and 60 days; "Again" brings it right back. Key terms in quiz questions are tappable for a quick definition, and words from questions you miss collect in **My Weak Words**.

**Diagnostic labs**: a **Circuit Lab** (12 V circuit: tap six test points with a virtual meter; working, open wire, bad ground, short to ground) and a **CAN bus Lab** (scope view of CAN-H/CAN-L plus volts and ohms; working, shorts, missing terminator). Each has Learn mode and a Quiz mode worth XP.

Placement test, ranks (Trainee → Master Tech), progress timeline, and a sample manager crew view. Progress is saved only on your device. No account, no Claude, no internet needed after the first open.

Training content only. Always follow the manufacturer's service procedure and your employer's safety program.

## Also here: Mad Minute Biology
One-minute drills for a college freshman General Biology course — 12 topics, 637 questions, from chemistry of life through ecology.

**Open it:** https://manafest01.github.io/MadMinute/biology/

Add it to a phone's home screen the same way (it gets its own **BIO** icon). Its progress is kept separate from the Auto demo.

## Also here: Mad Minute Music
One-minute drills for college music majors — 7 subjects, 300+ questions each (2,114 total):
Applied Lessons, Harmony & Theory, Aural Skills (ear training with real sound), Sight Reading & Sight Singing (real staff notation), Keyboard Skills (drawn piano keyboard), Music History, and Music Composition.

A **Music Path** card walks through all seven subjects in 24 steps, easy to hard.

**Open it:** https://manafest01.github.io/MadMinute/music/

Add it to a phone's home screen the same way (it gets its own **MUS** icon). Sound plays on the device, so ear training works offline too. Its progress is kept separate from the other apps.

## Also here: Mad Minute Dev
One-minute drills from first line of code to junior full-stack and DevOps — 9 subjects, 1,369 questions, levels Beginner → Junior → Intermediate → Senior:
Dev Vocabulary, Programming Fundamentals, Read & Debug (predict the output, spot the bug, reading errors, working with AI code), Git & Version Control, Front-End, Back-End, Full Stack & Architecture, DevOps & Kubernetes, and **Real-World Problems** (scenarios based on what developers hit most: Git disasters, async surprises, CSS fights, database surprises, "works on my machine", and production fires).

- **Dev Path**: 38 steps, easy to hard, across all 9 subjects.
- **Recall first**: answer from memory before the choices appear (active recall).
- **Skills checkup + Roadmap**: one test across everything, then a map of your gaps and your next 3 moves.
- Code questions show real, scrollable code.

**Open it:** https://manafest01.github.io/MadMinute/dev/

Add it to a phone's home screen the same way (it gets its own **DEV** icon). Its progress is kept separate from the other apps.

How the engine got here, stage by stage: [ENGINE_HISTORY.md](ENGINE_HISTORY.md)

---
## In every app: Skills checkup, Roadmap and Recall first
- **Skills checkup**: one test across every subject, about 2 questions per topic. Stop any time; it picks up where you left off.
- **Roadmap**: what you have, what's missing, and your next 3 moves. "Copy roadmap as text" to share it with a manager or teacher.
- **Recall first**: the choices stay hidden until you've pulled the answer from memory. Switch it on or off on Home.

These live in one shared file (`shared/mm-learn.js`), so an improvement there reaches every app.

---
© 2026 Mana Industries LLC. All rights reserved. This demo is provided for evaluation only. No part of it may be copied, modified, redistributed, or resold without written permission.
