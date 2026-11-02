/* Vocab flashcards: Electrical Safety. Row = [term, plain meaning, on-the-job tip]. Easy words first, senior words last.
   Study aid only: NFPA 70E, OSHA, NETA standards and your employer's safety program always win. */
(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).safe = {
A: [
  ["Arc flash", "A burst of heat and light when current jumps through air between conductors.", "It can reach thousands of degrees in a fraction of a second. Treat every open cover as a possible arc source."],
  ["Shock hazard", "Danger from current passing through the body.", "Shock and arc flash are separate hazards with separate boundaries. Check both."],
  ["Arc flash label", "A sticker on gear showing voltage, the arc flash boundary, and incident energy or PPE category.", "No label, an old label or recently changed gear: stop and ask before opening it."],
  ["Limited approach boundary", "The shock boundary unqualified people may not cross without an escort.", "About 3 ft 6 in for fixed parts at 480 V."],
  ["Restricted approach boundary", "The closer shock boundary only qualified, protected people may cross with a plan.", "About 1 ft at 480 V."],
  ["Arc flash boundary", "The distance where incident energy drops to 1.2 cal/cm², the onset of a second-degree burn.", "Inside it, everyone needs arc-rated PPE."],
  ["Incident energy", "The heat energy that would reach you in an arc, in cal/cm² at a set working distance.", "Clearing time and distance change it more than most people expect."],
  ["Working distance", "The distance from the arc source to your face and chest used in the study.", "Usually 18 in for low-voltage gear. Lean in closer and the label no longer applies."],
  ["Clearing time", "How long protection takes to stop the arc.", "Slow breakers mean big arc energy. A maintenance switch can speed them up."]
],
P: [
  ["PPE", "Personal protective equipment: what you wear to reduce injury.", "PPE is the last line of defense, not the first."],
  ["Rubber insulating gloves", "Gloves rated to protect against shock at a set voltage class.", "Air test them before every use."],
  ["Leather protectors", "Leather gloves worn over rubber gloves to protect the rubber.", "Never wear rubber insulating gloves without them unless the standard allows it."],
  ["Glove class", "The voltage rating of rubber gloves: 00, 0, 1, 2, 3, 4.", "Class 0 = 1,000 V AC max use. Class 2 = 17,000 V AC."],
  ["Arc-rated (AR) clothing", "Clothing that self-extinguishes and limits burns in an arc.", "It doesn't stop shock. It stops melting and burning."],
  ["ATPV / arc rating", "The incident energy a fabric can take before a likely second-degree burn, in cal/cm².", "Your clothing rating must meet or beat the incident energy on the label."],
  ["PPE category", "A 1–4 level from the NFPA 70E tables with a minimum arc rating.", "Cat 1 = 4, Cat 2 = 8, Cat 3 = 25, Cat 4 = 40 cal/cm²."],
  ["Arc flash suit", "Full AR coverage: hood, jacket, bib overalls, gloves.", "Used for high-energy tasks like racking big breakers when remote racking isn't available."],
  ["Glove retest date", "The date gloves were last lab-tested; in-service gloves are retested every 6 months.", "Out of date = out of service. Check the stamp before you put them on."]
],
L: [
  ["LOTO", "Lockout/tagout: locking energy sources off and tagging them.", "Your lock, your key, your life."],
  ["Energy isolating device", "A device that physically stops energy, like a disconnect or breaker.", "Push buttons and selector switches are NOT energy isolating devices."],
  ["Electrically safe work condition (ESWC)", "Gear that is disconnected, locked out, tested dead and grounded if needed.", "Until every step is done, treat it as live."],
  ["Absence of voltage test", "Testing every conductor to prove it is dead before touching it.", "Phase-to-phase and phase-to-ground on every conductor."],
  ["Live-dead-live", "Prove the tester on a known source, test the circuit, then prove the tester again.", "It proves the 'dead' reading wasn't a dead meter."],
  ["Backfeed", "Power coming from an unexpected direction, like a generator or PV system.", "Check drawings and the field for every possible source."],
  ["Stored energy", "Energy left in capacitors, springs or cables after the source is off.", "Discharge it and verify before contact."],
  ["Group lockout", "A lockbox system where each worker adds a personal lock.", "The job can't restart until every lock comes off."],
  ["Energized work permit", "A written approval required to work on live parts.", "Testing and troubleshooting by qualified persons are exempt."]
],
G: [
  ["Temporary protective ground", "A heavy cable set clamped to dead conductors and ground during work.", "Ground end on first, off last."],
  ["Equipotential zone", "A work area where everything is bonded to the same potential.", "If everything is at the same voltage, current won't flow through you."],
  ["Hot stick", "An insulated pole for applying grounds and operating gear from a distance.", "Inspect and wipe it clean before each use."],
  ["Induced voltage", "Voltage coupled onto a dead line from nearby energized lines.", "A line that tested dead can still bite. Ground it."],
  ["Recovery voltage", "Charge that slowly comes back on insulation after a DC test.", "Keep cables grounded long after testing, about four times the test time."],
  ["Barricade", "Physical barrier and signs keeping people out of a test area.", "Guard every end of a cable under test, not just your end."],
  ["Bracket grounding", "Grounds placed on both sides of the work location.", "Common on lines near energized circuits."],
  ["Fault-current rating", "How much fault current a ground set can carry for a set time.", "Undersized grounds melt when they're needed most."]
],
R: [
  ["Job briefing", "A short talk before work covering hazards, steps, PPE and roles.", "Re-brief whenever conditions change."],
  ["Qualified person", "Someone trained to recognize and avoid the hazards of a specific task.", "Qualified for one task isn't qualified for all."],
  ["Hierarchy of risk controls", "Elimination, substitution, engineering, awareness, administrative, PPE.", "Start at the top. De-energizing is elimination."],
  ["Risk assessment", "Judging how likely harm is and how bad it could be.", "Likelihood plus severity decide the controls."],
  ["Engineering control", "Changing equipment to reduce the hazard, like arc-resistant gear.", "Works without relying on people doing it right every time."],
  ["Normal operation", "Operating closed, maintained, properly installed gear with no signs of failure.", "Buzzing, heat or smell? It's no longer normal operation."],
  ["Peer check", "A second person confirms the right device before an action.", "Catches wrong-breaker mistakes."],
  ["Root cause", "The underlying reason an incident happened, not just who was involved.", "Fix the system, not just the person."]
],
C: [
  ["NFPA 70E", "Standard for electrical safety in the workplace.", "Covers boundaries, PPE, LOTO and training."],
  ["NFPA 70 (NEC)", "The National Electrical Code for installations.", "The NEC says how to build it; 70E says how to work on it safely."],
  ["NFPA 70B", "Standard for electrical equipment maintenance.", "Became a required standard (not just advice) in 2023."],
  ["NETA", "InterNational Electrical Testing Association.", "Writes ATS, MTS, ECS and ETT."],
  ["ANSI/NETA ATS", "Acceptance testing specifications for new equipment.", "What you test before new gear goes into service."],
  ["ANSI/NETA MTS", "Maintenance testing specifications for in-service equipment.", "Includes test frequencies based on condition and criticality."],
  ["ANSI/NETA ECS", "Standard for commissioning electrical power systems.", "System-level testing beyond single components."],
  ["ANSI/NETA ETT", "Standard for certifying electrical testing technicians.", "Sets Levels 1–4, training hours and experience."],
  ["NAC", "NETA Accredited Company.", "You must work for one to keep NETA certification active."],
  ["OSHA 1910.269", "OSHA rules for generation, transmission and distribution work.", "Utility-style work has its own rules."]
]
};
