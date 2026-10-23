/* Mad Minute Auto vocabulary: High Voltage subject. Rows: [term, definition, other names].
   Training content only: always follow the manufacturer's HV procedure and your employer's safety program. */
window.MM_VOCAB = window.MM_VOCAB || {};
window.MM_VOCAB.hv = {
  P: [
    ["High voltage", "In vehicles, above 60 V DC or 30 V AC. Enough to stop a heart.", ["HV"]],
    ["Orange cable", "Orange wiring and connectors mark high voltage. Never cut, pierce or back-probe them.", ["orange cables"]],
    ["Class 0 gloves", "Rubber insulating gloves rated for up to 1,000 V AC / 1,500 V DC, worn with leather protectors.", ["Class 0", "insulating gloves", "lineman's gloves"]],
    ["Glove inflation test", "Rolling or inflating a rubber glove before each use to find pinholes. A leaking glove is thrown out.", ["air test", "glove check"]],
    ["Leather protectors", "Leather gloves worn over rubber insulating gloves so sharp edges can't cut the rubber.", []],
    ["CAT III", "A meter safety rating for high-energy circuits. Use a CAT III or CAT IV, 1,000 V meter on HV systems.", ["CAT IV", "CAT rating"]],
    ["Insulated tools", "Hand tools rated and tested for 1,000 V work.", ["1000 V tools"]],
    ["Rescue hook", "An insulated hook used to pull a person off a live electrical source without touching them.", ["safety hook"]],
    ["Arc flash", "An explosive electrical blast of heat and light that can burn and blind.", []],
    ["Live-dead-live", "Test your meter on a known live source, test the circuit, then retest the known source to prove the meter worked.", ["live dead live", "test before touch"]],
    ["Absence of voltage", "Proving with a meter that the HV system is at 0 V before touching it.", ["verify zero voltage"]],
    ["Barrier and signs", "Taping off the vehicle and posting HV warning signs while it's being worked on.", ["barrier tape"]],
    ["HV qualified person", "A tech trained and authorized by the employer to work on HV systems.", ["qualified person"]]
  ],
  I: [
    ["Isolation", "The HV system is electrically separate from the chassis, so touching one HV terminal and the body shouldn't complete a path.", ["electrical isolation"]],
    ["Floating system", "An HV system with no connection to chassis ground.", ["floating"]],
    ["Insulation resistance", "How well insulation stops current leaking from HV to chassis, measured in megohms.", []],
    ["Megohmmeter", "An insulation tester that applies a test voltage, often 500 V or 1,000 V, to measure insulation resistance.", ["insulation tester", "megger"]],
    ["Isolation fault", "A leak path between HV and chassis. The vehicle detects it and warns or shuts down.", ["insulation fault"]],
    ["Isolation monitoring", "The vehicle continuously checking insulation resistance between HV and chassis.", ["IMD"]],
    ["Ohms per volt", "How insulation limits are written. Rules call for at least 100 Ω/V on DC systems, and many makers use stricter limits.", ["Ω/V"]],
    ["Equipotential bonding", "Low-resistance straps connecting HV component cases to the chassis so they stay at the same voltage.", ["bonding", "chassis bonding"]],
    ["Bonding check", "A low-ohm test from a component case to chassis. Should read a fraction of an ohm.", []],
    ["Coolant conductivity", "HV systems use low-conductivity coolant. The wrong coolant can cause isolation faults.", []]
  ],
  L: [
    ["HVIL", "High Voltage Interlock Loop. A low-voltage circuit that runs through HV connectors and covers.", ["interlock loop", "high voltage interlock loop"]],
    ["HVIL break", "When an HV connector or cover is opened, the loop opens and the system opens the contactors.", ["interlock open"]],
    ["Interlock pin", "A short pin in an HV connector that breaks the HVIL before the main HV pins separate.", []],
    ["First-make, last-break", "Connector design where the HV pins connect first and disconnect last, while the interlock does the opposite.", []],
    ["Service disconnect", "A removable plug or switch that physically splits the HV battery for service.", ["MSD", "manual service disconnect", "service plug"]],
    ["Wait time", "The minutes required after power-down before HV work, letting capacitors discharge. Check service info.", []],
    ["Crash disconnect", "Opening the HV contactors, and on some vehicles firing a pyro fuse, when a crash is detected.", ["pyro fuse", "pyrotechnic disconnect"]],
    ["Cut loop", "A labeled low-voltage loop first responders cut to shut down the HV system.", ["first responder cut loop"]],
    ["HVIL fault code", "A DTC set when the interlock loop reads open or out of range, often from an unseated connector.", []]
  ],
  C: [
    ["Contactor", "A heavy-duty relay that connects or disconnects the HV battery from the rest of the system.", ["contactors", "main contactor"]],
    ["Main positive contactor", "Connects the HV battery's positive side.", []],
    ["Main negative contactor", "Connects the HV battery's negative side.", []],
    ["Pre-charge", "Charging the system's capacitors slowly through a resistor before closing the main contactor, to prevent a huge inrush current.", ["precharge"]],
    ["Pre-charge resistor", "The resistor that limits current during pre-charge.", ["precharge resistor"]],
    ["Inrush current", "The large current surge into empty capacitors. Pre-charge prevents it.", []],
    ["DC link capacitor", "A large capacitor in the inverter that smooths the HV DC. It can hold a charge after shutdown.", ["DC-link", "bulk capacitor"]],
    ["Active discharge", "The inverter quickly drains the DC link capacitor at shutdown.", []],
    ["Passive discharge", "Bleeder resistors slowly drain the capacitor if active discharge fails.", ["bleeder resistor"]],
    ["Welded contactor", "A contactor stuck closed. The system checks for this at startup and shutdown.", ["stuck contactor"]],
    ["Power-down procedure", "The maker's steps to make the HV system safe, ending with proving zero voltage.", ["shutdown procedure", "de-energize"]]
  ],
  B: [
    ["Cell", "The smallest battery unit, usually 3.2 to 3.7 V nominal for lithium-ion.", ["cells"]],
    ["Module", "A group of cells packaged together.", ["battery module"]],
    ["Pack", "All the modules together with the BMS, contactors and cooling.", ["battery pack"]],
    ["BMS", "Battery management system. Watches cell voltages and temperatures, balances cells and protects the pack.", ["battery management system"]],
    ["Cell balancing", "Evening out the charge between cells so none is overcharged or overdrained.", ["balancing"]],
    ["SOC", "State of charge: how full the pack is, in percent.", ["state of charge"]],
    ["SOH", "State of health: how much capacity the pack has left compared with new.", ["state of health"]],
    ["kWh", "Kilowatt-hours. The amount of energy the pack holds.", ["kilowatt-hours"]],
    ["Thermal runaway", "A cell overheating in a self-feeding chain reaction that can spread fire through the pack.", []],
    ["Thermal management", "Heating and cooling the pack to keep cells in their best temperature range.", ["battery cooling"]],
    ["Lithium-ion", "The common EV battery chemistry. NMC and LFP are two main types.", ["Li-ion", "LFP", "NMC"]],
    ["Series string", "Cells connected end to end so their voltages add up to the pack voltage.", []]
  ],
  M: [
    ["Inverter", "Converts the battery's DC into three-phase AC to run the motor, and back again during regen.", ["traction inverter"]],
    ["Three-phase AC", "Three AC waves offset from each other, used to spin an electric motor smoothly.", ["3-phase"]],
    ["IGBT", "A high-power transistor that switches current in many inverters. Newer ones use SiC MOSFETs.", ["SiC", "SiC MOSFET"]],
    ["Permanent magnet motor", "A motor with magnets in the rotor. Efficient and common in EVs.", ["PMSM", "PM motor"]],
    ["Induction motor", "A motor with no magnets; the stator's field induces current in the rotor.", []],
    ["Resolver", "A rotor position sensor that tells the inverter exactly where the motor is.", ["motor position sensor"]],
    ["Onboard charger", "Converts AC from a wall or station into DC to charge the pack.", ["OBC"]],
    ["DC fast charging", "The station supplies DC straight to the pack, skipping the onboard charger.", ["DCFC", "Level 3"]],
    ["Level 2 charging", "240 V AC charging through the onboard charger.", ["Level 2"]],
    ["CCS", "Combined Charging System. The J1772 AC plug with two large DC pins added below for fast charging.", ["Combined Charging System"]],
    ["NACS", "North American Charging Standard (SAE J3400). A compact plug that carries AC and DC charging on the same pins.", ["J3400"]],
    ["J1772", "The standard North American plug for Level 1 and Level 2 AC charging.", []],
    ["Regenerative braking", "The motor works as a generator to slow the vehicle and recharge the pack.", ["regen"]],
    ["DC-DC converter", "Steps HV down to about 14 V to charge the 12 V battery. There's usually no alternator.", ["DC/DC"]]
  ]
};
