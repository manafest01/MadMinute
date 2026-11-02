/* Vocab flashcards: Testing Fundamentals & Theory. Row = [term, plain meaning, on-the-job tip]. Easy words first.
   Study aid only: NETA standards and manufacturer data always win. */
(window.MM_FLASH_DECKS = window.MM_FLASH_DECKS || {}).theory = {
T: [
  ["Three-phase", "Power delivered on three conductors, each 120° apart.", "Smooth power for motors and big loads."],
  ["Line (phase-to-phase) voltage", "Voltage between two phase conductors.", "480 V on a 480Y/277 system."],
  ["Phase-to-neutral voltage", "Voltage from one phase to the neutral.", "277 V on a 480Y/277 system."],
  ["Wye (Y)", "Three windings joined at a common neutral point.", "Line voltage = √3 × phase voltage."],
  ["Delta (Δ)", "Three windings connected end to end in a triangle.", "Line current = √3 × winding current."],
  ["Power factor", "Real power ÷ apparent power (kW ÷ kVA).", "Low PF means more current for the same work."],
  ["kVAR", "Reactive power that magnetizes motors and transformers.", "Capacitors supply it locally to improve PF."],
  ["Phase rotation", "The order the phases peak: ABC or ACB.", "Swap two phases and motors run backward."],
  ["Voltage unbalance", "Max deviation from the average voltage ÷ average × 100.", "1% voltage unbalance can mean 6–10% current unbalance."],
  ["Symmetrical components", "Breaking unbalanced phases into positive, negative and zero sequence.", "The math behind fault studies and many relays."]
],
W: [
  ["One-line diagram", "Map of the power system with one line for all phases.", "Start every job by finding your gear on it."],
  ["Three-line diagram", "Shows each phase plus CT/PT wiring and polarity.", "Use it to check how relays and meters are wired."],
  ["Schematic (elementary)", "Shows how control contacts, coils and relays work together.", "Follow trip and close circuits here."],
  ["Wiring diagram", "Shows actual terminal-to-terminal wiring.", "Use it to find the wire on the terminal block."],
  ["52a contact", "Breaker auxiliary contact that is closed when the breaker is closed.", "Sits in series with the trip coil."],
  ["52b contact", "Breaker auxiliary contact that is closed when the breaker is open.", "Often in the close circuit and open-indication light."],
  ["Shelf state", "Devices drawn de-energized on drawings.", "A 'normally open' contact may be closed in service."],
  ["Red-line", "Field markup showing what's really installed.", "Becomes the as-built drawing at turnover."]
],
M: [
  ["Ohm's law", "V = I × R.", "Rearrange it to solve for any one value."],
  ["Megohm (MΩ)", "One million ohms.", "Insulation readings live here."],
  ["Micro-ohm (µΩ)", "One millionth of an ohm.", "Contact resistance readings live here."],
  ["Full-load amps (FLA)", "Rated current at full load.", "3-phase: I = kVA × 1000 ÷ (1.732 × V)."],
  ["Percent impedance (%Z)", "Transformer impedance as a percent of rated voltage.", "Available fault ≈ FLA ÷ %Z."],
  ["Ratio", "Primary ÷ secondary value, like 1200:5 = 240:1.", "Secondary = primary ÷ ratio."],
  ["Temperature correction", "Adjusting readings to a base temperature for fair comparison.", "Insulation resistance roughly halves per 10 °C rise."],
  ["√3 (1.732)", "The factor linking line and phase values in three-phase systems.", "Shows up in power and current formulas."]
],
F: [
  ["Fault", "An abnormal current path, like a short circuit.", "Most start as one phase to ground."],
  ["Bolted fault", "A solid, zero-impedance fault.", "Gives the highest fault current for equipment ratings."],
  ["Equipment grounding conductor (EGC)", "The path that brings fault current back to the source.", "Low impedance means fast trips."],
  ["Bonding", "Connecting metal parts so they're at the same potential.", "No voltage difference, no shock."],
  ["Solidly grounded", "Neutral tied straight to ground.", "Ground faults draw big current and trip fast."],
  ["High-resistance grounding (HRG)", "Neutral grounded through a resistor that limits fault current to a few amps.", "Keeps running on a first ground fault. Find it fast."],
  ["Low-resistance grounding", "Neutral resistor limiting ground faults to hundreds of amps.", "Common on medium voltage. Still trips."],
  ["Main bonding jumper", "The neutral-to-ground link at the service or source.", "Only one. Extra bonds confuse ground fault protection."],
  ["Zero sequence (3I0)", "Current that shows up when phases don't sum to zero, as in ground faults.", "Window CTs read it directly."],
  ["X/R ratio", "Reactance-to-resistance ratio of the fault path.", "High X/R = more DC offset and higher peak current."]
],
I: [
  ["Insulation", "Material that keeps current in the conductor.", "Heat, moisture, dirt and stress wear it down."],
  ["Leakage current", "Small current that flows through or across insulation.", "Rising leakage means trouble."],
  ["Charging current", "Current that fills the insulation like a capacitor when DC is applied.", "Dies off in seconds."],
  ["Absorption current", "Current that slowly drops as insulation polarizes.", "Why good insulation readings rise over time."],
  ["Polarization index (PI)", "10-minute reading ÷ 1-minute reading.", "Most machines want 2.0 or more."],
  ["Dielectric absorption ratio (DAR)", "60-second reading ÷ 30-second reading.", "A quicker cousin of PI."],
  ["Dissipation factor (tan δ)", "How much test current turns into heat in the insulation.", "Rising values mean aging or moisture."],
  ["Partial discharge (PD)", "Tiny sparks in voids or on surfaces of insulation.", "A slow killer of medium-voltage insulation."],
  ["Water tree", "Branching damage in XLPE from moisture plus stress.", "Can grow into electrical trees and failure."],
  ["Tip-up", "Power factor rising as test voltage rises.", "Points to ionization in voids."]
],
D: [
  ["ANSI device number", "Standard numbers naming protective functions.", "Learn 25, 27, 32, 50, 51, 52, 59, 67, 81, 86, 87."],
  ["50", "Instantaneous overcurrent.", "Trips with no intentional delay."],
  ["51", "Time overcurrent.", "Trips faster as current climbs."],
  ["87", "Differential protection.", "Compares current in vs out of a zone."],
  ["86", "Lockout relay.", "Trips and blocks closing until manually reset."],
  ["Pickup (tap)", "Current where the relay starts to operate.", "Below pickup, it ignores the current."],
  ["Time dial", "Setting that moves the curve up or down.", "Higher dial = slower trip at every current."],
  ["TCC", "Time-current curve, plotted log-log.", "Shows how devices coordinate."],
  ["Selective coordination", "Only the device nearest the fault opens.", "Keeps the outage small."],
  ["Coordination time interval", "Time margin between upstream and downstream relays.", "Usually about 0.2–0.4 s."],
  ["Harmonic restraint", "Blocks transformer differential trips on inrush.", "Inrush is heavy in 2nd harmonic."]
],
X: [
  ["Current transformer (CT)", "Steps big current down for relays and meters.", "Never open its secondary under load."],
  ["Potential transformer (PT/VT)", "Steps high voltage down to 120 V or 69 V.", "Never short its secondary."],
  ["Shorting block", "Terminal block that safely shorts CT secondaries.", "Short the CT before opening the circuit."],
  ["Polarity", "Which way current flows through the CT, shown by dots or H1/X1.", "Backward polarity fools differential and directional relays."],
  ["Burden", "Total impedance on a CT secondary.", "Too much burden and the CT saturates early."],
  ["Accuracy class (C400)", "CT can make 400 V at 20× rated current within 10% error.", "Relaying CTs need a good C class."],
  ["Saturation", "Core can't carry more flux, so output stops tracking primary.", "Saturated CTs make relays slow or blind."],
  ["Knee point", "Where 10% more voltage needs 50% more excitation current.", "Found on the excitation curve."],
  ["Multi-ratio CT", "CT with taps for several ratios.", "Confirm which taps are wired."],
  ["Ferroresonance", "PT core and system capacitance resonating, causing overvoltage.", "Most likely on ungrounded systems."]
]
};
