/* Vocab flashcards: Systems & Commissioning. Row = [term, plain meaning, on-the-job tip]. Easy words first.
   Study aid only: NETA ECS, NFPA 110, the NEC and the project specs always win. */
(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).sys = {
P: [
  ["Commissioning", "Proving a system works as designed before handover.", "Assume nothing works until it's proven."],
  ["Acceptance testing", "Testing new equipment before it goes into service.", "Governed by ANSI/NETA ATS."],
  ["FAT", "Factory acceptance test at the manufacturer.", "Cheaper to fix problems before shipping."],
  ["Commissioning levels (L1–L5)", "Factory, installation, start-up, functional and integrated systems testing.", "Common in data center work."],
  ["Commissioning tags", "Colored tags showing which level each item has passed.", "A quick floor-level status check."],
  ["IST", "Integrated systems test: all systems tested together, like a utility loss.", "The final exam before go-live."],
  ["Punch list", "Open items to fix before turnover.", "Each item gets an owner and a close-out."],
  ["Switching order", "Written step-by-step plan for operating devices.", "Brief it, read it back, check off each step."],
  ["Phasing out", "Checking voltage across each phase pair before tying two sources.", "Prevents closing out of phase."],
  ["Test script", "Approved test steps with expected results and pass criteria.", "Agree on 'pass' before testing starts."]
],
D: [
  ["Test report", "Record of equipment, tests, results, instruments and tester.", "If it isn't written down, it didn't happen."],
  ["As-found", "Condition and readings before any repair or adjustment.", "Shows drift and hidden problems."],
  ["As-left", "Condition and readings when you leave.", "Proves the final state."],
  ["Calibration", "Checking a test instrument against a known standard.", "Out of cal = results can't be trusted."],
  ["NIST traceability", "Calibration chain linked back to national standards.", "Ask for the cert if in doubt."],
  ["Deficiency", "A result that fails the acceptance criteria.", "Report the reading, the limit and a recommendation."],
  ["Acceptance criteria", "The values a result must meet to pass.", "From the maker, NETA tables or the project spec."],
  ["Trending", "Comparing results over time.", "Slow decline shows up only in trends."],
  ["As-built drawings", "Drawings updated to show what was actually installed.", "Part of every good turnover package."]
],
F: [
  ["Functional testing", "Proving equipment and controls work as intended when operated.", "Parts passing tests ≠ system working."],
  ["Interlock", "A device that blocks unsafe operation.", "Prove it actually blocks."],
  ["Kirk key", "Key interlock that forces a safe operating sequence.", "The key stays trapped until its device is safe."],
  ["Control circuit test", "Energizing control wiring to check close, trip and alarms.", "Done with the primary de-energized first."],
  ["Main-tie-main", "Two mains and a tie breaker with transfer logic.", "Test every source-loss and return scenario."],
  ["Lockout relay test", "Proving the 86 trips every breaker it should and blocks closing.", "Check each trip output wire."],
  ["End-to-end test", "Testing from sensor input through relay logic to the breaker opening.", "Proves the whole chain."],
  ["DC ground", "Unwanted ground on an ungrounded DC control system.", "A second ground can cause false trips or block trips."],
  ["Sequence of operations", "Written description of how the system should respond.", "Build test steps from it."]
],
A: [
  ["ATS", "Automatic transfer switch.", "Moves load to emergency power when normal fails."],
  ["Engine-start delay", "Short delay before starting the generator.", "Rides through momentary blips."],
  ["Retransfer delay", "Wait time before switching back to normal.", "Makes sure utility power is stable."],
  ["Cooldown delay", "Unloaded run time after retransfer.", "Protects the engine from heat soak."],
  ["In-phase monitor", "Lets transfer happen only when sources are nearly in phase.", "Protects motors from out-of-phase reconnection."],
  ["Closed transition", "Briefly parallels both sources so load never drops.", "Utility interconnect rules may apply."],
  ["NFPA 110", "Standard for emergency and standby power systems.", "Sets monthly, annual and 36-month tests."],
  ["Level 1 / Level 2 EPSS", "Level 1: failure could cost lives. Level 2: less critical.", "Level 1 needs the 4-hour triennial test."],
  ["NEC Article 700", "Emergency systems.", "Power within 10 seconds."]
],
G: [
  ["Standby generator", "Generator that powers loads when the utility fails.", "Monthly tests keep it ready."],
  ["Load bank", "Artificial load for testing a generator.", "Proves capacity without risking site loads."],
  ["Wet stacking", "Unburned fuel buildup from light-load running.", "Load testing burns it off."],
  ["Synchronizing", "Matching voltage, frequency, angle and rotation before paralleling.", "Close just before 12 o'clock on a slowly turning synchroscope."],
  ["Synchroscope", "Instrument showing phase difference between generator and bus.", "Clockwise = generator faster."],
  ["Sync-check relay (25)", "Blocks closing unless sources match.", "A backstop for manual or auto sync."],
  ["Reverse power (32)", "Trips a generator that starts motoring.", "Protects the engine."],
  ["Loss of excitation (40)", "Trips a generator that loses its field.", "Prevents overheating."],
  ["Governor / AVR", "Governor controls speed and kW; voltage regulator controls voltage and kVAR.", "kVAR sharing problems are AVR problems."],
  ["Step-load test", "Adding large blocks of load to check voltage and frequency dips.", "Watch dip size and recovery time."]
]
};
