/* Vocab flashcards: Component Testing. Row = [term, plain meaning, on-the-job tip]. Easy words first.
   Study aid only: NETA ATS/MTS and manufacturer data always win. */
(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).comp = {
V: [
  ["Visual and mechanical inspection", "Checking condition, nameplate, anchorage, grounding and cleanliness before testing.", "It's step one in almost every NETA procedure."],
  ["Nameplate verification", "Comparing nameplate data to drawings and specs.", "Catches wrong ratings before they're energized."],
  ["Torque verification", "Checking bolted joints with a calibrated torque wrench.", "Use the maker's values and mark torqued bolts."],
  ["Thermography (IR)", "Using an infrared camera to find hot spots.", "Equipment must be energized and loaded."],
  ["ΔT (delta T)", "Temperature difference between similar components or vs ambient.", "Similar parts: 1–3 °C possible, 4–15 °C probable, >15 °C major."],
  ["Emissivity", "How well a surface gives off infrared energy.", "Shiny metal reads low and reflects. Aim at tape or insulation."],
  ["IR window", "A port in a cover for scanning without opening it.", "Lowers arc flash exposure during surveys."]
],
I: [
  ["Megohmmeter (megger)", "Tester that applies DC voltage and reads insulation resistance.", "Never on energized equipment."],
  ["Insulation resistance (IR)", "Resistance of insulation to leakage, in MΩ or GΩ.", "Trend it at a corrected temperature."],
  ["Guard terminal", "Megger terminal that removes surface leakage from the reading.", "Use it on dirty or humid bushings and terminations."],
  ["Spot test", "A single reading, usually at 1 minute.", "Good for quick checks and trending."],
  ["Time-resistance test", "Readings over time, like PI or DAR.", "Shows how insulation absorbs."],
  ["IEEE 43", "Standard for insulation testing of rotating machines.", "Sets minimum IR and PI for motors and generators."],
  ["Phase comparison", "Comparing readings between phases of the same item.", "A low phase stands out even above minimums."]
],
H: [
  ["Hipot", "High-potential test: applies above-normal voltage to prove insulation.", "Do IR first. Barricade every end."],
  ["DC step-voltage test", "Raising DC voltage in steps while watching leakage current.", "Leakage should rise in step with voltage, not jump."],
  ["VLF", "Very low frequency AC (about 0.1 Hz) for testing long cables.", "Preferred over DC for aged XLPE."],
  ["Power factor test (Doble)", "AC test measuring insulation losses.", "Finds moisture, contamination and aging."],
  ["UST / GST", "Ungrounded vs grounded specimen test modes.", "UST measures between two terminals, like bushing C1."],
  ["Bushing C1 / C2", "C1: conductor to test tap. C2: tap to flange.", "Compare to nameplate capacitance and PF."],
  ["Oil dielectric test", "Voltage at which oil breaks down in a test cell (ASTM D877/D1816).", "Low values mean water or particles."],
  ["DGA", "Dissolved gas analysis of transformer oil.", "Acetylene = arcing, hydrogen = PD, ethylene = heating, CO/CO₂ = paper."]
],
G: [
  ["Grounding electrode", "Rod, grid or plate that connects the system to earth.", "Lower resistance helps fault and lightning current."],
  ["Fall-of-potential", "Ground test with a current probe and a potential probe at about 62%.", "Move the P probe ±10% to confirm a plateau."],
  ["Clamp-on ground tester", "Measures ground loop resistance without disconnecting.", "Needs parallel paths. Won't work on an isolated rod."],
  ["IEEE 450", "Standard for testing vented lead-acid batteries.", "Replace below 80% capacity."],
  ["IEEE 1188", "Standard for VRLA battery maintenance.", "Trend ohmic readings against baseline."],
  ["Capacity test", "Discharging a battery at a set rate to measure what it delivers.", "Correct for temperature."],
  ["Intercell connection resistance", "Resistance of straps between cells.", "High values mean loose or corroded connections."],
  ["Float voltage", "Charger voltage that keeps a battery topped off.", "Too high corrodes; too low sulfates."]
],
T: [
  ["TTR", "Transformer turns ratio test.", "Within 0.5% of calculated per NETA."],
  ["Tap changer", "Switch that changes transformer ratio slightly.", "Test ratio and winding resistance on each tap."],
  ["Winding resistance", "DC resistance of each winding.", "Finds loose joints and bad tap contacts."],
  ["Excitation current", "Current to magnetize the core at no load.", "Pattern change flags core or turn problems."],
  ["Polarity (additive / subtractive)", "How transformer terminals relate in voltage direction.", "Matters when paralleling."],
  ["Demagnetizing", "Removing residual core magnetism after DC tests.", "Prevents high inrush and bad excitation results."],
  ["SFRA", "Sweep frequency response analysis.", "Detects winding movement vs a baseline."],
  ["Sudden pressure relay (63)", "Trips on a fast pressure rise inside the tank.", "Test it and its trip wiring."]
],
B: [
  ["Micro-ohmmeter (Ductor)", "Measures very low resistance with high DC current.", "Use 100 A or more on breaker contacts."],
  ["Contact resistance", "Resistance across closed main contacts.", "Investigate >50% deviation between similar poles."],
  ["Primary injection", "High current through the breaker's main path to trip it.", "Tests sensors, trip unit and mechanism together."],
  ["Secondary injection", "Signal injected into the trip unit's test port.", "Doesn't check the current sensors."],
  ["LSIG", "Long-time, short-time, instantaneous, ground fault trip functions.", "Set only per the approved coordination study."],
  ["Vacuum bottle integrity", "Hipot across open vacuum contacts.", "Flashover means lost vacuum."],
  ["Timing test", "Measures open and close times and contact bounce.", "Slow opening means longer faults."],
  ["Trip-free / anti-pump", "Breaker trips even with close held; won't pump closed.", "Test both on every breaker."],
  ["Racking", "Moving a drawout breaker between connected and disconnected.", "Breaker open, PPE on, remote racking if you can."]
],
R: [
  ["Protective relay", "Device that senses abnormal conditions and trips a breaker.", "Relays think; breakers act."],
  ["Relay test set", "Injects simulated currents and voltages into a relay.", "Three-phase sets test directional and differential elements."],
  ["Pickup test", "Finding the value where the relay starts to operate.", "Compare to the setting."],
  ["Timing test (relay)", "Measuring trip time at multiples of pickup.", "Check several points on the curve."],
  ["Target / flag", "Indicator that shows a relay operated.", "Reset after testing."],
  ["CT excitation test", "Plots the CT's voltage vs excitation current.", "Confirms knee point and catches shorted turns."],
  ["Phase-angle meter", "Measures angles between voltages and currents in service.", "Proves CT/PT phasing with real load."],
  ["Trip check", "Proving the relay output actually opens the breaker.", "A perfect relay with a broken trip wire protects nothing."],
  ["As-found / as-left", "Readings before and after adjustment.", "Record both. As-found shows drift."]
],
C: [
  ["Shield", "Metallic layer in MV cable controlling the electric field.", "Must be grounded and continuous."],
  ["XLPE / EPR", "Common MV cable insulations: cross-linked polyethylene / ethylene propylene rubber.", "Aged XLPE prefers AC-type tests."],
  ["Termination", "The cable end fitting that controls stress where the shield stops.", "A common spot for PD and failures."],
  ["Splice", "A joint connecting two cables.", "Another top PD location."],
  ["TDR", "Time domain reflectometer: sends a pulse and times reflections.", "Finds opens and low-resistance faults, and measures length."],
  ["Thumper (surge generator)", "Sends high-energy pulses to flash over a fault.", "Use the lowest energy that works."],
  ["Arc reflection", "TDR plus a surge that briefly shorts the fault.", "Great for high-resistance faults."],
  ["Pre-location / pinpointing", "Finding the rough distance, then the exact spot on the route.", "Pre-locate first to limit thumping."],
  ["IEEE 400 / 400.2", "Guides for field testing shielded cable and VLF testing.", "Where VLF test voltages and times come from."]
],
M: [
  ["Winding resistance (motor)", "DC resistance of each motor phase.", "Phases should closely match."],
  ["Surge comparison test", "Compares phase waveforms to check turn-to-turn insulation.", "A shifted waveform points to shorted turns."],
  ["Current unbalance", "Difference between phase currents in a running motor.", "Check supply voltage unbalance first."],
  ["VFD", "Variable frequency drive.", "Disconnect it before megging the motor."],
  ["Surge arrester", "Device that diverts voltage spikes to ground.", "Its ground lead must be short and solid."],
  ["Watts-loss test", "Measures power loss in an arrester at test voltage.", "Rising loss means a degrading arrester."],
  ["Capacitor bank", "Group of capacitors for power factor correction.", "Discharge and ground before touching."],
  ["Discharge resistor", "Built-in resistor that drains a capacitor after shutdown.", "NEC: to 50 V within 1 min (≤600 V) or 5 min (>600 V)."],
  ["Harmonic resonance", "Capacitors and system inductance amplifying harmonics.", "A common reason for repeated fuse blowing."]
]
};
