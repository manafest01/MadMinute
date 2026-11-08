/* Symbol flashcards in series: high voltage / EV.
   Same format as sym-e12.js: [symbol, term, what the symbol shows and does, shop tip];
   [symbol] alone = a part from an earlier circuit, shown in the strip without a new card.
   Training model only: HV layouts differ by maker, so always follow the OEM procedure. */
window.MM_SYMBOLS = (window.MM_SYMBOLS || []).concat([
  { key: "hv-drive", group: "High voltage / EV", name: "HV drive path", sub: "From the pack to the wheels", steps: [
    ["hvpack", "HV battery pack", "Many cells in series, drawn as repeated battery plates. Usually about 200–800 V DC, depending on the vehicle.", "Treat it as live at all times. Orange cables are high voltage. De-energize by the OEM procedure, wearing rated gloves."],
    ["msd", "Service disconnect (MSD)", "A pull-out plug, often with a fuse inside, that splits the pack in the middle.", "Pulling it breaks the HV circuit, but each half of the pack still holds voltage. Wait the OEM time, then verify zero with a rated meter."],
    ["contactor", "Main contactor", "A heavy-duty relay that connects the pack to the rest of the car. It's open when the car is off.", "There's usually one on the positive side and one on the negative. A welded contactor sets a code and can leave voltage on the bus."],
    ["precharge", "Precharge circuit", "A small contactor in line with a resistor, used for a moment at start-up before the main contactor closes.", "It charges the inverter's capacitors gently so the main contactor doesn't arc. A failure usually means a precharge code and no Ready mode."],
    ["capacitor", "DC link capacitor", "The capacitor symbol again, this time a big one in the inverter that smooths the DC bus.", "It can hold dangerous voltage after shutdown. Most systems drain it automatically, but always verify zero voltage yourself."],
    ["inverter", "Inverter", "A box split by a diagonal: DC (=) on one side, AC (~) on the other. It turns pack DC into 3-phase AC for the motor.", "It runs backwards during regen braking, turning the motor's AC back into DC to charge the pack."],
    ["motor3", "Traction motor (3-phase)", "A motor circle marked 3~: a three-phase AC motor that drives the wheels.", "Three orange cables, phases U, V and W. Phase-to-phase resistance should be low and even; insulation to the case should be very high."],
    ["hvpack"]
  ]},
  { key: "hv-isolation", group: "High voltage / EV", name: "Isolation check", sub: "HV is kept apart from the body", steps: [
    ["hvpack"],
    ["megger", "Insulation tester (megohmmeter)", "A meter marked MΩ. It puts a test voltage on the circuit (often 500 or 1,000 V) and reads resistance in megohms.", "Test from each HV conductor to the chassis, at the OEM's test voltage. Readings should be very high; compare to the OEM minimum."],
    ["chassis", "Chassis ground", "A comb with slanted teeth: the vehicle's metal body.", "The 12 V system grounds to the body, but HV is kept isolated from it. Low resistance from HV to chassis is an isolation fault."]
  ]},
  { key: "hvil", group: "High voltage / EV", name: "HV interlock (HVIL)", sub: "A safety loop through every HV plug", steps: [
    ["hvil", "HVIL (interlock loop)", "A low-voltage loop that runs through every HV connector and cover, drawn as a wire looping through a plug.", "Unplug any HV connector and the loop breaks, so the contactors open. A loose connector can cause an HVIL code and no Ready."],
    ["connector"], ["contactor"]
  ]}
]);
