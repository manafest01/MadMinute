"""Accuracy pass: give the Shop Safety questions whose right answer stood out as the longest option
more believable wrong answers (and trim a few right answers). Run once: python3 polish_distractors.py <repo>"""
import json, re, sys, os
FIX = {
"Safety shoes in a shop should have:": ["Protective toes, slip-resistant soles", "Light mesh uppers for airflow", "Soft soles for kneeling", "Smooth soles that slide easily"],
"Which glove resists a chemical is found on:": ["The SDS and the glove maker's chart", "The color code on the glove box", "Any glove's size label", "The shop's PPE price list"],
"For paint or solvent vapors, you need:": ["A respirator with vapor cartridges", "An N95 dust mask", "A surgical face mask", "A damp cloth over the face"],
"Heat-resistant gloves are the right choice for:": ["Handling hot exhaust parts", "Mixing two-part epoxy", "Cleaning up battery acid", "Working on live HV parts"],
"PPE training must cover:": ["When, what, how to wear, limits, care", "Only the price and where to buy it", "Only where the PPE is stored", "Nothing if the PPE is simple"],
"Grinding with sparks flying calls for:": ["Glasses, shield, gloves, no loose clothes", "Sunglasses and a long-sleeve shirt", "A dust mask and nitrile gloves", "Safety glasses only, sleeves rolled"],
"Rubber insulating gloves for HV work are rated by:": ["Class and voltage, and retested", "Color and thickness only", "Glove size and length only", "Brand and price only"],
"Wearing hearing protection becomes mandatory:": ["Above 90 dBA or after a hearing shift", "Only above 120 dBA", "Only when it hurts", "Only on the night shift"],
"A pictogram on a chemical label is:": ["A hazard symbol in a red diamond", "The maker's logo in a circle", "A recycling code in a triangle", "A barcode for inventory"],
"SDS Section 1 tells you:": ["Product name and supplier contact", "The hazards and signal word", "First aid for each exposure", "PPE and exposure limits"],
"A label's precautionary statements tell you:": ["How to prevent and respond to harm", "The price and shelf life", "How much is in the container", "Which store sells it"],
"A shipped chemical's label must include:": ["Name, signal word, hazards, pictograms, supplier", "Name, price, weight, barcode, date", "Pictograms and a price only", "The SDS number only"],
"SDS Section 8 includes:": ["Exposure limits and PPE", "First aid for exposure", "Safe storage rules", "Disposal instructions"],
"SDS Section 9 lists:": ["Properties like flash point", "First aid steps", "Disposal methods", "Required PPE"],
"SDS Sections 12–15 (ecology, disposal, transport, regulations):": ["Are included but not enforced by OSHA", "Are left out of every SDS", "Are the parts OSHA checks most", "Are written only for managers"],
"SDS Section 16 shows:": ["When it was prepared or revised", "First aid for each exposure", "The main hazards", "Required PPE"],
"A written hazard communication program includes:": ["A chemical list, labels, SDSs and training", "Only an SDS binder by the door", "Only posters in the break room", "Only the fire evacuation plan"],
"Hazcom training must happen:": ["At hire and when new hazards arrive", "Once every 10 years", "Only if someone asks for it", "Only for managers and leads"],
"Flash point is:": ["The lowest temperature its vapor can ignite", "The temperature where it boils", "The temperature where it freezes", "The temperature where it lights with no spark"],
"When an SDS withholds a trade-secret ingredient, it must still:": ["List the hazards and protections", "Hide the hazards as well", "Skip Sections 2 through 8", "Call the product harmless"],
"SDS Section 11 (toxicology) tells you:": ["Health effects and symptoms", "How to store it", "How to fight a fire", "How to ship it"],
"Used oil waiting for pickup should be kept in:": ["Closed containers labeled \"Used Oil\"", "Open drain pans under the bench", "Unlabeled drums out back", "Old coolant jugs, any label"],
"A tech gets solvent on their skin and feels it burn. First:": ["Rinse it, then check SDS Section 4", "Check SDS Section 14 first", "Wipe it off with a shop rag", "Wait to see if it blisters"],
"Chemical labels in U.S. workplaces must be in:": ["English, other languages optional", "Any one language the maker picks", "Pictures only, no words", "Code numbers only"],
"Clean-agent or CO2 extinguishers are a good choice near:": ["Electronics and computers", "Wood and paper piles", "Burning metal shavings", "Deep cooking-oil fryers"],
"If a parts washer catches fire, its lid should:": ["Drop shut on its fusible link", "Stay open so smoke can clear", "Be lifted off and set aside", "Be propped up for spraying"],
"Before lowering a lift, remove:": ["Stands, tools and drain pans", "Only the ignition key", "Only the wheel chocks", "The lift arm pads"],
"Lowering a lift usually starts by:": ["Raising it slightly off the locks", "Pulling the arm pads out", "Opening the driver's door", "Bleeding the hydraulic lines"],
"An asymmetric two-post lift sets the car:": ["Farther back, on shorter front arms", "Exactly centered between posts", "On its tires, on two runways", "Farther forward, on long front arms"],
"ALI's gold label on a lift means:": ["It's certified to the safety standard", "It was sold at a discount", "It's less than a year old", "It passed its last oil change"],
"Running a car in gear on a lift is dangerous because:": ["Spinning wheels and shafts can catch you", "The lift can't hold a running car", "It drains the lift's hydraulic fluid", "It always sets off the lift alarm"],
"Overhead clearance matters on a lift because:": ["Tall vehicles can hit the ceiling", "Air is cooler up high", "Lights work better close up", "Lifts run faster with room"],
"ANSI/ALI ALOIM covers:": ["Lift operation, inspection and maintenance", "Tire sizes, load ratings and pressures", "Engine oil types and change intervals", "Paint booth airflow and filters"],
"Lift anchors need concrete that:": ["Meets the maker's thickness and strength", "Is any slab, as long as it's level", "Was poured within the last week", "Is sealed with epoxy floor paint"],
"A rolling (bridge) jack on a four-post lift lets you:": ["Lift the wheels off the runways", "Drive on without the ramps", "Skip the lift's safety locks", "Raise the lift higher than rated"],
"Lift crush injuries happen most when:": ["Pads are set wrong or locks aren't used", "The shop is busy near closing time", "The lift is painted the wrong color", "The car's engine is shut off"],
"Compressed air for cleaning must be under:": ["30 psi, with chip guarding", "150 psi, with a long nozzle", "90 psi, any nozzle", "300 psi, with gloves on"],
"Air hoses should be checked for:": ["Cuts, bulges and bad fittings", "Color and brand only", "Length and coil shape", "Dust on the outside"],
"A whip check on an air hose:": ["Stops a loose hose from whipping", "Raises the line pressure", "Oils the tool as it runs", "Dries water out of the air"],
"Before reaching near a belt or fan, you should:": ["Shut it off and pull the key", "Put on mechanic's gloves", "Wait for the idle to drop", "Rev it to clear the belt"],
"Flashback arrestors on a torch:": ["Stop flames running back into the hoses", "Make the flame bigger and hotter", "Measure the gas pressure", "Light the torch automatically"],
"A brake lathe should be run with:": ["Chip shield on, no loose clothing", "Gloves on, guiding the bit", "The guard off for a better view", "A hand on the rotor to steady it"],
"A new bench grinder wheel should run about a minute before use because:": ["A cracked wheel usually fails at startup", "The bearings need oil to warm up", "Sparks need time to start", "The wheel sharpens itself first"],
"If you feel dizzy around running engines:": ["Get to fresh air and tell someone", "Sit down by the car and rest", "Drink coffee and keep working", "Close the doors to stay warm"],
"Sanding body filler should be done with:": ["Dust extraction and a respirator", "A fan blowing across the panel", "A wet rag over the mouth", "Compressed air to clear dust"],
"Exhaust hose adapters should:": ["Cover every tailpipe, including duals", "Cover one pipe on dual exhaust", "Rest near the tailpipe on the floor", "Point at the car's front bumper"],
"Heavier-than-air gases and vapors collect in:": ["Service pits and low spots", "The shop ceiling", "The front office", "Fan housings"],
"Gasoline contains benzene, which is:": ["A cancer-causing chemical", "A harmless fuel additive", "A cleaning detergent", "A type of coolant"],
"When a CO alarm sounds, you should:": ["Shut off engines, ventilate, get fresh air", "Silence it and keep working", "Start a fan and stay in the bay", "Close the bay doors to keep heat"],
"Asbestos may still be found in:": ["Some brakes, clutches and gaskets", "New tires and tubes only", "Engine coolant", "Washer fluid"],
"Who can service vehicle A/C for pay?": ["EPA Section 609 certified techs", "Any tech with A/C gauges", "Only dealer technicians", "Anyone using small cans"],
"R-134a and R-1234yf systems use:": ["Different fittings and machines", "The same recovery machine", "Shared hoses and couplers", "The same fittings, new labels"],
"OSHA's brake-dust methods include:": ["Wet wash, low-pressure spray or HEPA enclosure", "Dry brushing into a dustpan", "Blowing out with shop air", "Tapping drums on the floor"],
"Burning or overheated refrigerant can form:": ["Hydrogen fluoride and other acids", "Harmless water vapor", "Extra oxygen", "Plain carbon dioxide"],
"Nitrogen used for leak testing can:": ["Push oxygen out of small spaces", "Add oxygen to the air", "Cool the shop down", "Clean the A/C lines"],
"Brake dust washed onto the floor and left there:": ["Dries and gets stirred up later", "Is safe once it's wet", "Breaks down in a day", "Washes away by itself"],
"Work clothes with brake or clutch dust should be:": ["Bagged or washed at work, not shaken", "Shaken out by the bay door", "Worn home and washed there", "Blown off with shop air"],
"A wrench laid across battery posts can:": ["Arc, burn and blow up the battery", "Charge the battery faster", "Test the battery's health", "Clean corrosion off the posts"],
"A coworker is being shocked. First:": ["Cut the power or use a nonconductive object", "Grab their arm and pull hard", "Pour water on them to cool them", "Shout their name until they let go"],
"A car battery should be lifted:": ["With a carrier or strap, using your legs", "By one post, close to your body", "By bending at the waist", "By its cables"],
"A lockout device keeps equipment:": ["Off while you work on it", "Running at low speed", "Unlocked for others", "Ready for a quick start"],
"The one-hand rule means:": ["Keep one hand away from the circuit", "Carry tools in one hand only", "Always work one-handed", "Hold the meter in one hand"],
"An HV work area should be:": ["Marked off with signs or barriers", "Open so others can watch", "Unmarked to avoid worry", "Out in the parking lot"],
"HID (xenon) headlight ballasts can produce:": ["Very high starting voltage", "Only 5 volts", "No voltage at all", "Only light, no power"],
"A rotten-egg smell while charging means:": ["Overcharging; stop and ventilate", "Normal charging", "It's finished charging", "A fuel leak nearby"],
"Arc flash can cause:": ["Severe burns and blindness", "A mild sunburn only", "No injury if gloved", "Cooler air nearby"],
"After applying your lock and tag, you should:": ["Try to start it to verify it's dead", "Walk away and start the job", "Remove the tag but keep the lock", "Tell a coworker to start it"],
"The live-dead-live test means:": ["Check meter on a live source, test, recheck", "Test the circuit three times fast", "Test only circuits you think are live", "Test, then touch it with a glove on"],
"Leaking hybrid or EV battery coolant or electrolyte should be:": ["Treated as hazardous; check the SDS", "Wiped up with bare hands", "Left to dry on the floor", "Washed into the floor drain"],
"An insulated rescue hook in an HV shop is used to:": ["Pull a person off a live circuit", "Hang tools near the vehicle", "Lift the HV battery pack", "Hold the hood open"],
"On day one, learn where to find:": ["Exits, extinguishers, eyewash and first aid", "The vending machine and break room", "The boss's car and the lot", "The parts catalog and price list"],
"An emergency shower is used for:": ["Big chemical splashes on the body", "Cleaning greasy parts", "Cooling off on hot days", "Rinsing off cars"],
"Someone may have a neck or back injury. You should:": ["Not move them unless they're in danger", "Sit them up so they can breathe", "Help them walk it off", "Carry them to your car"],
"Treat any blood as:": ["Possibly infectious; wear gloves", "Harmless if it's a coworker's", "Just a stain to wipe up", "Safe once it dries"],
"A big spill, or one you can't identify, means:": ["Leave the area and get help", "Mop it up right away", "Hose it into the drain", "Sweep it with sawdust"],
"A near miss should be:": ["Reported so it can be fixed", "Kept quiet if no one was hurt", "Laughed off", "Ignored"],
"OSHA requires quick flushing or drenching facilities where:": ["Corrosives can splash eyes or body", "Only in the front office", "Only in paint booths", "Only where there are sinks"],
"A shop's emergency action plan covers:": ["Alarms, exits, head counts and reporting", "Prices, labor rates and warranties", "Lunch breaks and shift times", "Tool brands and suppliers"],
"An object stuck in the eye should be:": ["Left in, covered and seen by a doctor", "Pulled out with tweezers", "Rubbed out gently", "Blown out with shop air"],
"A shock victim should see a doctor because:": ["Burns and heart effects can be hidden", "It's only needed for paperwork", "Shocks never cause injuries", "It's quicker than first aid"],
"Reporting a hazard or injury is:": ["Your right; retaliation is illegal", "Against most shop rules", "Only for managers", "Optional and can get you fired"],
"If someone is pinned under a fallen car:": ["Call 911, then lift carefully with a jack", "Pull them out by the legs", "Wait for the boss to decide", "Rock the car off them"],
}
REPO = sys.argv[1]
p = os.path.join(REPO, "index.html"); s = open(p, encoding="utf-8").read()
a = s.index('{ id: "safe"'); b = s.index("\n  ]\n},", a)
seg = s[a:b]; done = set()
def fix(m):
    q = json.loads(m.group(1))
    if q[2] in FIX:
        opts = FIX[q[2]]; assert len(opts) == 4 and len(set(opts)) == 4
        q[3] = opts; done.add(q[2])
    return "  " + json.dumps(q, ensure_ascii=False) + m.group(2)
seg = re.sub(r'^  (\[".*\])(,?)$', fix, seg, flags=re.M)
missing = set(FIX) - done
assert not missing, missing
s = s[:a] + seg + s[b:]
open(p, "w", encoding="utf-8").write(s)
print("polished", len(done))
