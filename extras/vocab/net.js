/* Mad Minute Auto vocabulary: Vehicle Networks subject. Rows: [term, definition, other names]. */
window.MM_VOCAB = window.MM_VOCAB || {};
window.MM_VOCAB.net = {
  C: [
    ["CAN", "Controller Area Network. Lets the vehicle's modules share data over one pair of wires instead of separate wires for every signal.", ["CAN bus", "Controller Area Network"]],
    ["Node", "Any module connected to the network.", ["nodes"]],
    ["Module", "A small computer that controls one part of the vehicle, such as the engine, ABS or body.", ["ECU", "control module"]],
    ["Multiplexing", "Sending many signals over the same shared wires.", []],
    ["Bus", "The shared wires every node on the network connects to.", []],
    ["Broadcast", "On CAN, messages go to every node; each one decides whether it needs that message.", []],
    ["Baud rate", "How fast bits move on the network. High-speed CAN commonly runs at 500 kbit/s.", ["bit rate", "kbit/s"]],
    ["High-speed CAN", "The common CAN for powertrain and chassis, up to 1 Mbit/s. Stops working if a wire shorts.", ["HS-CAN"]],
    ["Low-speed fault-tolerant CAN", "A slower CAN, often for body modules, that can keep talking with one wire faulted.", ["LS-CAN", "fault-tolerant CAN"]],
    ["CAN FD", "CAN with flexible data rate. Sends up to 64 bytes per message and switches to a faster speed for the data.", []],
    ["Gateway module", "Links different networks and passes messages between them.", ["gateway"]],
    ["Network topology", "How modules are wired together, such as a linear bus, star or ring.", ["topology"]]
  ],
  K: [
    ["CAN-H", "CAN high. Rests at about 2.5 V and rises to about 3.5 V on a dominant bit.", ["CAN high"]],
    ["CAN-L", "CAN low. Rests at about 2.5 V and drops to about 1.5 V on a dominant bit.", ["CAN low"]],
    ["Differential signal", "Data carried as the difference between two wires. Noise hits both wires equally and cancels out.", ["differential"]],
    ["Twisted pair", "Two wires twisted together so outside noise affects both the same way.", []],
    ["Terminating resistor", "A 120 Ω resistor at each end of a high-speed CAN bus that stops signals from reflecting.", ["terminator", "termination resistor", "termination"]],
    ["60 ohms", "The normal reading across CAN-H and CAN-L with power off: two 120 Ω terminators in parallel.", ["60 Ω"]],
    ["Dominant bit", "A logic 0 on CAN. The lines spread apart, and it overrides a recessive bit.", ["dominant"]],
    ["Recessive bit", "A logic 1 on CAN. Both lines rest at about 2.5 V.", ["recessive"]],
    ["Transceiver", "The chip in each module that turns digital data into CAN-H and CAN-L voltages and back.", []],
    ["Reflection", "A signal bouncing back from an unterminated end, causing ringing on the scope.", ["ringing"]],
    ["Stub", "A short branch wire from the main bus to a module. Long stubs cause reflections.", []]
  ],
  A: [
    ["Frame", "One complete CAN message: start bit, ID, control bits, data, CRC, acknowledgment and end.", ["CAN frame"]],
    ["Identifier", "The number at the front of a CAN message that says what it is and sets its priority.", ["ID", "arbitration ID", "CAN ID"]],
    ["11-bit identifier", "The standard CAN ID length.", ["standard ID"]],
    ["29-bit identifier", "The extended CAN ID length, used in J1939 truck networks and some diagnostics.", ["extended ID"]],
    ["Arbitration", "How CAN decides who talks when two nodes start at once. The lower ID has more dominant bits and wins.", []],
    ["DLC field", "The data length code in a frame, telling how many data bytes follow (0 to 8 in classic CAN).", ["data length code"]],
    ["Data field", "The part of the frame that carries the actual information, up to 8 bytes in classic CAN.", ["payload"]],
    ["CRC", "Cyclic redundancy check. A math check that lets receivers spot corrupted messages.", []],
    ["ACK slot", "Where receivers confirm they got a good message by sending a dominant bit.", ["acknowledgment", "ACK"]],
    ["Error frame", "A frame a node sends when it detects an error, so the message gets resent.", []],
    ["Bus-off", "A node with too many transmit errors disconnects itself from the bus to protect the network.", ["bus off"]],
    ["Error counter", "Each node counts its transmit and receive errors and gets more cautious as they climb.", ["TEC", "REC"]]
  ],
  X: [
    ["U-code", "A network DTC (U0xxx), such as lost communication with a module.", ["U-codes", "U code", "network code"]],
    ["Lost communication", "A module stopped hearing messages from another module it expects.", ["U0100", "no communication"]],
    ["Resistance check", "Measuring across CAN-H and CAN-L with the battery disconnected. 60 Ω is normal, 120 Ω means one terminator is missing.", []],
    ["Short to ground", "A CAN wire touching ground. The bus goes quiet and modules set U-codes.", []],
    ["Short to battery", "A CAN wire touching battery voltage. The lines read near 12 V and the bus fails.", ["short to power"]],
    ["Wire-to-wire short", "CAN-H touching CAN-L. Both read about 2.5 V and resistance is near 0 Ω.", ["H to L short"]],
    ["Open wire", "A broken CAN wire. Modules past the break drop off the network.", []],
    ["Splice pack", "A connector block where many CAN branches join. Unplugging branches one by one isolates a fault.", ["star connector", "splice"]],
    ["Isolate by unplugging", "Disconnecting modules one at a time until the bus comes back, to find a module pulling it down.", []],
    ["Network scan", "A scan tool check of which modules answer and which don't.", ["module scan", "topology scan"]]
  ],
  N: [
    ["LIN", "Local Interconnect Network. A cheap single-wire network up to 20 kbit/s for simple parts like switches and mirrors.", ["LIN bus"]],
    ["LIN commander", "The one module that controls a LIN bus and asks each responder to talk. Older name: master.", ["master", "commander"]],
    ["LIN responder", "A device on a LIN bus that only answers when the commander asks. Older name: slave.", ["responder"]],
    ["FlexRay", "A fast, timed network (up to 10 Mbit/s) used for safety and chassis systems that need exact timing.", []],
    ["MOST", "Media Oriented Systems Transport. A network, often fiber-optic, used for audio and infotainment.", ["MOST bus"]],
    ["Fiber-optic ring", "A network where light passes module to module in a loop. One break stops the whole ring.", ["optical ring"]],
    ["K-line", "An older single-wire diagnostic line (ISO 9141 / KWP2000).", ["ISO 9141"]],
    ["J1939", "The CAN-based standard used on heavy trucks and equipment.", ["SAE J1939"]],
    ["Sleep mode", "Modules shutting down their network activity after key-off to save the battery.", ["network sleep"]],
    ["Wake-up", "A signal that brings sleeping modules back online.", ["wake up"]]
  ],
  D: [
    ["OBD-II", "On-Board Diagnostics, second generation. The standard emissions diagnostics on US vehicles since 1996.", ["OBD2", "OBD"]],
    ["DLC", "The 16-pin diagnostic connector under the dash. CAN-H is pin 6, CAN-L is pin 14, battery power is pin 16.", ["data link connector", "OBD port"]],
    ["DTC", "Diagnostic trouble code. P is powertrain, B body, C chassis, U network.", ["trouble code", "DTCs"]],
    ["Freeze frame", "A snapshot of sensor data saved the moment a DTC set.", []],
    ["Readiness monitors", "Self-tests the computer runs on emission systems. Inspections check that they've completed.", ["monitors", "I/M readiness"]],
    ["Pending code", "A fault seen once. It becomes confirmed if it happens again on another drive cycle.", ["pending DTC"]],
    ["Mode $01", "The OBD-II service that reads live data (PIDs).", ["Service 01", "PID"]],
    ["UDS", "Unified Diagnostic Services (ISO 14229). The deeper diagnostic language modules use for testing and programming.", ["Unified Diagnostic Services"]],
    ["DID", "Data identifier. A UDS number that points to one piece of module data.", ["data identifier"]],
    ["Security access", "A UDS seed-and-key handshake that unlocks protected functions like programming.", ["seed and key"]],
    ["Diagnostic session", "The mode a module is in, such as default, extended or programming, set with UDS service 0x10.", ["extended session"]],
    ["J2534", "The standard pass-thru interface that lets a PC reprogram modules through the DLC.", ["pass-thru"]]
  ],
  E: [
    ["Automotive Ethernet", "Ethernet built for vehicles, running high data rates over a single twisted pair.", []],
    ["100BASE-T1", "Automotive Ethernet at 100 Mbit/s over one twisted pair.", []],
    ["1000BASE-T1", "Automotive Ethernet at 1 Gbit/s over one twisted pair.", []],
    ["10BASE-T1S", "10 Mbit/s automotive Ethernet where several nodes can share one wire pair, like a bus.", []],
    ["Ethernet switch", "Sends each message only to the port that needs it, instead of to everyone.", []],
    ["MAC address", "The fixed hardware address of an Ethernet port.", []],
    ["Point-to-point", "One link connects exactly two devices. Most automotive Ethernet works this way.", []],
    ["Bandwidth", "How much data a link can carry per second.", []],
    ["Zonal architecture", "Grouping a vehicle's electronics by location, with zone controllers linked by Ethernet to central computers.", ["zone controller"]],
    ["Domain controller", "A powerful computer that runs a whole area such as ADAS or infotainment.", []]
  ],
  S: [
    ["DoIP", "Diagnostics over Internet Protocol (ISO 13400). Talks to modules over Ethernet for fast diagnostics and flashing.", ["Diagnostics over IP"]],
    ["Activation line", "OBD connector pin 8, used to wake up the DoIP Ethernet connection.", []],
    ["IP address", "The network address a device uses to send and receive data over Ethernet.", []],
    ["SOME/IP", "Scalable service-Oriented MiddlewarE over IP. Lets modules offer and request services over Ethernet.", []],
    ["VLAN", "Virtual LAN. Splits one physical network into separate, isolated groups.", []],
    ["TSN", "Time-Sensitive Networking. Ethernet standards that guarantee timing for critical data.", ["Time-Sensitive Networking"]],
    ["gPTP", "Generalized Precision Time Protocol. Keeps clocks in sync across the vehicle's Ethernet network.", []],
    ["Vehicle announcement", "The message a DoIP gateway sends when it comes online, identifying the vehicle.", []],
    ["Port 13400", "The network port DoIP uses.", []],
    ["Firewall", "Filters network traffic to block unwanted or unsafe messages.", []]
  ]
};
