/* Mad Minute Auto vocabulary: 12 V & 48 V Electrical subject. Rows: [term, definition, other names]. */
window.MM_VOCAB = window.MM_VOCAB || {};
window.MM_VOCAB.e12 = {
  V: [
    ["State of charge", "How full a battery is. At rest, about 12.6 V is full, 12.4 V about 75%, and 12.2 V about half.", ["SOC"]],
    ["Open circuit voltage", "Battery voltage with nothing drawing current, measured after the surface charge is gone.", ["resting voltage"]],
    ["Surface charge", "Extra voltage that sits on the plates right after charging and reads falsely high. Turn on headlights briefly to remove it.", []],
    ["CCA", "Cold cranking amps. Current a battery can deliver at 0 °F for 30 seconds while staying above 7.2 V.", ["cold cranking amps"]],
    ["Conductance tester", "A handheld tester that estimates battery health and CCA without a heavy load.", ["battery tester"]],
    ["Load test", "Draws a heavy current from the battery and watches how far the voltage drops.", []],
    ["Sulfation", "Lead sulfate crystals that harden on the plates when a battery sits discharged, cutting capacity.", ["sulfated"]],
    ["AGM", "Absorbed glass mat battery. Needs a charger setting made for AGM.", ["AGM battery"]],
    ["EFB", "Enhanced flooded battery. A tougher flooded battery made for basic start-stop systems.", []],
    ["Battery sensor", "Intelligent battery sensor on the negative cable that tells the computer the battery's current, voltage and temperature.", ["IBS"]],
    ["Jump starting", "Using another battery to start the car. Final ground connection goes on engine metal, away from the battery.", ["jump start"]]
  ],
  G: [
    ["Starter motor", "The motor that cranks the engine. It draws over 100 amps.", ["starter"]],
    ["Starter solenoid", "Pushes the starter gear into the flywheel and switches the heavy starter current.", []],
    ["Cranking voltage", "Battery voltage while cranking. Should stay above about 9.6 V.", []],
    ["Alternator", "Makes electricity from engine rotation to run the vehicle and recharge the battery.", ["generator"]],
    ["Voltage regulator", "Controls alternator output to hold charging voltage in the right range.", ["regulator"]],
    ["Charging voltage", "Usually about 13.5 to 14.7 V with the engine running. Smart systems vary it on purpose.", []],
    ["Diode", "A one-way valve for current. The alternator's diodes turn AC into DC.", ["diodes", "rectifier"]],
    ["AC ripple", "Leftover AC on the DC charging output. Too much points to a bad diode.", ["ripple"]],
    ["Start-stop", "A system that shuts the engine off at stops and restarts it when you go.", ["stop-start", "auto start-stop"]],
    ["Smart charging", "Charging controlled by the engine computer, which raises or lowers voltage for fuel economy and battery life.", []]
  ],
  W: [
    ["Ohm's law", "Voltage = current × resistance (V = I × R).", ["V = I x R"]],
    ["Voltage", "Electrical pressure, measured in volts.", ["volts"]],
    ["Current", "The flow of electricity, measured in amps.", ["amps", "amperage"]],
    ["Resistance", "Opposition to current flow, measured in ohms.", ["ohms"]],
    ["Open circuit", "A break in the path, so no current flows.", []],
    ["Short to ground", "A power wire touching ground before the load. Usually blows the fuse.", ["short circuit"]],
    ["High resistance", "Extra resistance from corrosion or a loose connection. Current drops and parts work weakly.", []],
    ["Voltage drop", "Voltage used up across part of a circuit. Measured with current flowing; a good connection drops only a fraction of a volt.", ["volt drop"]],
    ["Load", "The part that uses the power, such as a bulb or motor.", []],
    ["Ground", "The return path to the battery negative, usually through the body or a ground wire.", ["ground strap", "ground circuit"]],
    ["Fuse", "A weak link that melts to protect wiring when current gets too high.", ["fuses"]],
    ["Relay", "A switch worked by a small current that controls a larger current.", ["relays"]],
    ["Series circuit", "One path for current. The same current flows through every part.", []],
    ["Parallel circuit", "Several paths for current. Each branch gets the full voltage.", []],
    ["Wiring diagram", "A drawing showing how a circuit's wires, connectors, switches and loads connect.", ["schematic"]]
  ],
  S: [
    ["Reference voltage", "A steady voltage, usually 5 V, the computer sends to a sensor.", ["5 V reference", "VREF"]],
    ["Signal wire", "The wire that carries the sensor's reading back to the computer.", []],
    ["Thermistor", "A sensor whose resistance changes with temperature. Most car temp sensors lose resistance as they warm (NTC).", ["NTC", "NTC thermistor"]],
    ["Potentiometer", "A variable resistor that reports position, like a throttle position sensor.", []],
    ["Hall effect sensor", "Uses a magnetic field to make an on-off square-wave signal. Needs power to work.", ["Hall sensor"]],
    ["Variable reluctance sensor", "A magnetic pickup that makes its own AC signal as a toothed wheel passes. Signal grows with speed.", ["reluctor sensor", "magnetic pickup"]],
    ["Pull-up resistor", "A resistor inside the computer that holds a signal line high until a switch or sensor pulls it low.", []],
    ["Actuator", "A part the computer moves or switches on, such as an injector, solenoid or motor.", ["actuators"]],
    ["Solenoid", "A coil that makes a magnetic field to move a plunger.", []],
    ["PWM", "Pulse width modulation. Switching on and off fast; more on time means more average power.", ["pulse width modulation"]],
    ["Duty cycle", "The percent of time a PWM signal is on.", []],
    ["H-bridge", "Four switches that let a computer run a motor in both directions.", []]
  ],
  T: [
    ["DMM", "Digital multimeter. Measures volts, ohms and amps.", ["digital multimeter", "multimeter"]],
    ["Input impedance", "How much a meter loads the circuit. Use a 10-megohm meter on computer circuits.", ["high impedance"]],
    ["Lab scope", "An oscilloscope. Shows voltage changing over time as a picture.", ["oscilloscope", "scope"]],
    ["Test light", "A probe that lights when voltage is present. Don't use one on airbag or computer circuits.", []],
    ["Amp clamp", "A clamp that measures current by sensing the magnetic field around a wire, without breaking the circuit.", ["inductive amp clamp", "current clamp"]],
    ["Back-probing", "Testing through the back of a connector without piercing the wire's insulation.", ["back probe"]],
    ["Fused jumper", "A jumper wire with a fuse in it, used to bypass a switch or bring in power safely.", []],
    ["Min/max", "A meter mode that records the lowest and highest reading, good for catching glitches.", ["min max"]],
    ["Pinpoint test", "A step-by-step test from service info that narrows a fault to one wire or part.", []],
    ["Wiggle test", "Moving a harness or connector while watching a reading to find an intermittent fault.", []]
  ],
  H: [
    ["48 V system", "A mid-voltage system that runs a starter-generator and big loads. Under 60 V DC, so it isn't classed as high voltage.", ["48 V", "mid-voltage"]],
    ["Mild hybrid", "A vehicle with a 48 V motor that helps the engine and recovers energy but can't drive far on electric power alone.", ["MHEV"]],
    ["Belt starter generator", "A motor-generator driven by the engine belt that restarts the engine and recovers braking energy.", ["BSG", "BISG"]],
    ["DC-DC converter", "Steps 48 V down to charge the 12 V battery and run 12 V loads.", ["DC/DC converter"]],
    ["Regenerative braking", "Using the motor as a generator to slow the vehicle and recharge the battery.", ["regen"]],
    ["Torque assist", "The 48 V motor adding power to help the engine accelerate.", ["e-boost"]],
    ["48 V battery", "Usually a small lithium-ion pack with its own management electronics.", []],
    ["Arc risk", "Unplugging a 48 V connector under load can draw an arc that burns contacts. Follow the power-down steps.", ["arcing"]]
  ]
};
