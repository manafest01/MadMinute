/* Symbol flashcards in series: vehicle networks (CAN).
   Same format as sym-e12.js: [symbol, term, what the symbol shows and does, shop tip];
   [symbol] alone = a part from an earlier circuit, shown in the strip without a new card.
   Voltages are for high-speed CAN, the kind most cars use for engine, transmission and ABS. */
window.MM_SYMBOLS = (window.MM_SYMBOLS || []).concat([
  { key: "can-bus", group: "Networks (CAN)", name: "CAN bus", sub: "Modules talking over two wires", steps: [
    ["term", "Terminating resistor", "A 120 Ω resistor across CAN-H and CAN-L, one at each end of the bus. It stops signals echoing back.", "Power off, measure CAN-H to CAN-L at the DLC: about 60 Ω means both are there; about 120 Ω means one is missing."],
    ["module", "Module (node)", "A box with CAN-H and CAN-L pins: one computer on the network, like the ECM or ABS.", "Each module needs good power and ground before it can talk. Check those first on a no-communication code."],
    ["twisted", "Twisted pair", "Two wires drawn crossing over and over: CAN-H and CAN-L twisted together.", "The twist cancels out noise. Keep the twist in repairs, and keep any untwisted section short."],
    ["dlc", "DLC (OBD-II port)", "The 16-pin diagnostic connector under the dash.", "Pin 6 is CAN-H and pin 14 is CAN-L. Pin 16 is battery power; pins 4 and 5 are grounds."],
    ["module"], ["term"]
  ]},
  { key: "can-scope", group: "Networks (CAN)", name: "Signals on the scope", sub: "What good and bad look like", steps: [
    ["recessive", "Recessive bit (bus at rest)", "Both wires sit at about 2.5 V, with almost no difference between them. It means a 1.", "Any module can override it. Solid line = CAN-H, dashed line = CAN-L."],
    ["dominant", "Dominant bit", "CAN-H rises to about 3.5 V while CAN-L drops to about 1.5 V, about 2 V apart. It means a 0.", "Dominant always wins over recessive. On a scope, a good bus looks like a mirror image around 2.5 V."],
    ["canshort", "CAN-H shorted to ground", "The shorted wire flatlines near 0 V instead of switching.", "The bus usually stops talking. Unplug modules or branches one at a time to find the short."],
    ["pwm", "PWM (pulse width modulation)", "A square wave switching on and off fast. The share of time it's on is the duty cycle.", "Modules use it to control fans, pumps and solenoids. More on-time means more average power to the part."]
  ]}
]);
