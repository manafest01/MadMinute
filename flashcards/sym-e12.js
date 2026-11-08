/* Symbol flashcards in series: 12 V circuits.
   Each circuit lists its parts in the order current meets them, from the battery around to ground.
   Step = [symbol, term, what the symbol shows and does, shop tip]
   A step with only [symbol] is a part you already learned in an earlier circuit: it shows in the
   circuit strip so the circuit stays complete, but it doesn't get its own card again.
   Symbols are drawn in shared/mm-symbols.js. */
window.MM_SYMBOLS = (window.MM_SYMBOLS || []).concat([
  { group: "12 V", key: "lamp", name: "Lamp circuit", sub: "The basic loop every circuit follows", steps: [
    ["battery", "Battery", "Long line is positive (+), short line is negative (−). The power source: about 12.6 V fully charged at rest.", "Current leaves the + post, does its work, and comes home to − through ground. Every circuit starts and ends here."],
    ["fuse", "Fuse", "An S-shaped link in a box (some diagrams draw a plain box). It melts open when current gets too high.", "It sits right after the power source, so a short anywhere downstream blows it. It protects the wire, not the part."],
    ["switch", "Switch", "A blade between two contacts. It opens or closes the path.", "Diagrams draw switches at rest, usually key off. An open switch upstream means 0 V across the load."],
    ["lamp", "Lamp", "A circle with an X: the load that turns current into light (and heat).", "A healthy load drops nearly all of the battery's voltage. With it on, you should read close to battery voltage across it."],
    ["ground", "Ground", "Stacked lines getting shorter: the return path to battery negative through the body and engine.", "More than about 0.1–0.2 V dropped on the ground side under load points to a bad ground."]
  ]},
  { group: "12 V", key: "relay-control", name: "Relay: control side", sub: "A small current to switch on the relay", steps: [
    ["battery"], ["fuse"],
    ["pushbutton", "Push button (normally open)", "A bar held above two contacts. It closes only while it's pressed.", "Horn buttons are drawn this way. \"Normally open\" means open at rest."],
    ["coil", "Relay coil", "A coil of wire (the loops). Current through it makes a magnet that pulls the relay's contacts closed.", "On an ISO relay the coil is pins 85 and 86. It draws a small current, so a small switch can run a big load."],
    ["diode", "Diode (across the coil)", "Triangle and bar: current flows only the way the triangle points. Here it's wired across the coil, side by side with it, not in line.", "It soaks up the voltage spike when the coil shuts off. Installed backwards, it shorts the control side and can blow the fuse."],
    ["ground"]
  ]},
  { group: "12 V", key: "relay-load", name: "Relay: load side", sub: "The big current the relay switches", steps: [
    ["battery"], ["fuse"],
    ["contacts", "Relay contacts", "The switch half of the relay. The dashed line shows the coil moves it.", "Pins 30 (power in) and 87 (power out) on an ISO relay. Coil on = 30 connects to 87."],
    ["motor", "Motor", "A circle with an M: a load that turns current into motion, like a cooling fan or blower.", "A motor that draws too much current (tight bearings, a dragging fan) can blow fuses and burn relay contacts."],
    ["ground"]
  ]},
  { group: "12 V", key: "temp-sensor", name: "Coolant temperature sensor", sub: "A 2-wire sensor the ECU reads", steps: [
    ["resistor", "Resistor", "A zigzag line (a plain box on European diagrams). It limits current and drops voltage.", "Inside the ECU, a fixed resistor feeds 5 V to a 2-wire sensor. The ECU reads the voltage left after it."],
    ["splice", "Splice (connection dot)", "A filled dot where wires join. Lines that cross without a dot are not connected.", "This is the point the ECU reads as the sensor signal. Splices are also a common spot for corrosion."],
    ["thermistor", "Thermistor", "A resistor with a slanted line and t°: its resistance changes with temperature.", "Most coolant sensors are NTC: resistance drops as the engine warms, so the signal voltage drops too."],
    ["ground"]
  ]},
  { group: "12 V", key: "tps", name: "Throttle position sensor", sub: "A 3-wire sensor: reference, signal, ground", steps: [
    ["connector", "Connector", "A pin meeting a socket (or a box with pin numbers): where the harness unplugs.", "Check pin fit and corrosion before you condemn a part. Back-probe; don't spread the terminals."],
    ["potentiometer", "Potentiometer", "A resistor with an arrow touching it. The arrow is the wiper, which slides along as the part moves. Three wires: 5 V reference, signal, ground.", "A throttle position sensor works this way: the signal sweeps smoothly from about 0.5 V to about 4.5 V. A dropout mid-sweep means a worn track."],
    ["ground"]
  ]},
  { group: "12 V", key: "indicator", name: "Dash indicator light", sub: "An LED with its current-limiting resistor", steps: [
    ["battery"], ["fuse"], ["switch"], ["resistor"],
    ["led", "LED", "A diode with arrows pointing out: it lights when current flows forward through it.", "It needs a resistor in series to limit current, and it only works one way round."],
    ["ground"]
  ]},
  { group: "12 V", key: "charging", name: "Charging circuit", sub: "How the alternator refills the battery", steps: [
    ["alternator", "Alternator (generator)", "A circle with a wave: it makes AC power while the engine runs.", "Charging voltage is usually about 13.5–14.7 V with the engine running."],
    ["diode", "Rectifier diode", "The same diode symbol. Inside the alternator, a set of diodes turns AC into DC for the battery.", "More than about 0.5 V AC at the battery with the engine running points to a failed diode."],
    ["capacitor", "Capacitor", "Two parallel plates with a gap: it stores a small charge and smooths out voltage ripple.", "Many alternators have one on the output to cut radio noise."],
    ["battery"], ["ground"]
  ]}
]);
