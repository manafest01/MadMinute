"""Vehicle Networks round 2, extra Frames & Arbitration cards. Sources: ISO 11898-1, ISO 15765-2, SAE J1939-21."""
CARDS = {
"A": [
  ["Arbitration field", "The ID bits (plus RTR) that decide who wins the bus.", "Sent first so arbitration happens right away."],
  ["Losing arbitration", "A module sees a dominant bit where it sent recessive and stops.", "It becomes a listener and retries later."],
  ["ID collision", "Two modules sending the same ID at the same time.", "Not allowed by design; each ID has one sender."],
  ["Single frame (ISO-TP)", "A diagnostic message that fits in one CAN frame.", "First byte tells the length."],
  ["First frame (ISO-TP)", "The first frame of a long diagnostic message.", "Tells the total length coming."],
  ["Flow control frame", "The receiver tells the sender how fast to send the rest.", "Missing flow control stalls the transfer."],
  ["Consecutive frame", "The following frames of a long message.", "Numbered so they stay in order."],
  ["Block size / STmin", "Flow control settings: frames per block and gap time.", "Wrong settings slow programming."],
  ["Padding bytes", "Filler bytes to make a frame full length.", "Often 0x00, 0x55 or 0xAA."],
  ["PGN", "Parameter group number in J1939: what a message contains.", "Like a CAN ID's meaning for trucks."],
  ["SPN", "Suspect parameter number in J1939: one value or fault.", "Truck fault codes use SPN and FMI."],
  ["FMI", "Failure mode identifier in J1939 codes.", "Tells how the SPN failed, like voltage high."],
  ["Source address", "The sender's address in J1939 IDs.", "Shows which module sent the message."],
]}
