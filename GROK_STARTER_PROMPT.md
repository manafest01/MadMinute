# Starter prompt for Grok (or any AI coding assistant)

Copy everything in the box below and paste it as your first message. Fill in the two lines in
[brackets] first.

```
You're helping me build on Mad Minute, my offline quiz and flashcard web app for automotive
technicians. The code is public on GitHub:

  https://github.com/manafest01/MadMinute

Live demo: https://manafest01.github.io/MadMinute/

Step 1. Read AGENTS.md in the repo root before anything else. It explains the folder layout, the
question and flashcard formats, and the rules that must not break (cache version bumps, saved-progress
keys, offline only, accuracy). Then read ENGINE_HISTORY.md to see how the app grew. If you can't open
the repo, tell me and I'll upload the zip instead.

Step 2. Tell me back, in a few short bullets, how the app is built and how a new subject is added,
so I know you've got it.

Step 3. Here is what I want:
  [Example: Make an EV edition as a new app in a new folder "ev/", with the storage prefix "mmev_",
  using the Shop Safety, 12 V & 48 V Electrical, Vehicle Networks and High Voltage subjects from the
  Auto demo, plus a new subject on EV charging and thermal management with 60 questions and
  40 flashcards per topic.]

How I want you to work:
  - Plain HTML, CSS and JavaScript only, matching the existing style. No frameworks, no build step,
    no outside scripts or fonts. It must keep working offline.
  - Every technical or safety answer must come from a real source (OSHA, ANSI, SAE, EPA or the
    maker's service info). Put the rule number in the explanation when there is one. If you're not
    sure of a number, say so instead of guessing.
  - Questions: [topicKey, level 1-4, question, [right answer first, 3 believable wrong answers],
    explanation]. Short answers, plain words, wrong answers about the same length as the right one.
  - Bump the service worker VERSION and any ?v= numbers you touch, exactly as AGENTS.md says.
  - Give me complete files (or exact find-and-replace edits) that I can paste into GitHub, and list
    every file you changed. Add a new Stage to ENGINE_HISTORY.md describing the change.
  - [Anything else: brand, colors, app name, who it's for.]

Ask me before you change how saved progress works or remove any existing content.
```

## Notes

- **Where to run it:** use an AI that can read a GitHub link or an uploaded zip and write long files
  (for example Grok on the web or in the X app). The Grok assistant built into the car is a voice
  assistant; it can talk through ideas but can't edit code or files.
- **If the AI can't open GitHub:** download `MadMinute.zip` (the whole app) and upload it in the chat,
  then use the same prompt and say "the repo is in the zip I uploaded."
- **Before sharing your work:** check the terms of the AI service you use (xAI/Tesla or any other)
  for how they handle and may use what you upload, especially if Mad Minute content is something you
  plan to sell. The GitHub repo is already public; a private repo or a zip shared only in that chat
  keeps tighter control.
- **Putting changes live:** paste the files into GitHub (or replace them in the repo), commit to
  `main`, and GitHub Pages updates the live site in a minute or two.
