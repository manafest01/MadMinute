/* ===== Mad Minute schematic symbols (shared) =====
   Standard wiring-diagram symbols, hand-drawn as SVG in the Circuit Lab style.
   Every symbol fits a 120 x 70 box, with its wire entering at the left edge and leaving at the
   right edge on the middle line (y = 35). That's what lets the cards line up in series
   like a real circuit.

   Colors come from CSS: lines use currentColor, so the card decides the color
   (normal text color on the card, amber for "you are here" in the circuit strip).

   Use:  MMSymbols.svg("fuse")            -> a full <svg> string
         MMSymbols.svg("fuse", "mini")    -> small version for the circuit strip
   To add a symbol: add one entry to DRAW below. Keep the wire at y = 35 on both edges. */
(function () {
  "use strict";

  // each entry returns the inside of the <svg>: plain lines and shapes, no colors
  var DRAW = {
    battery: function () {
      // short plate = negative, long plate = positive (on the right, where current leaves)
      return '<path d="M0 35 H54 M66 35 H120"/>' +
        '<path class="t" d="M54 26 V44"/>' +
        '<path d="M66 16 V54"/>' +
        '<text x="78" y="20">+</text><text x="36" y="22">−</text>';
    },
    fuse: function () {
      return '<path d="M0 35 H38 M82 35 H120"/>' +
        '<rect x="38" y="25" width="44" height="20" rx="10"/>' +
        '<path d="M44 35 C51 26 55 44 60 35 S69 26 76 35"/>';
    },
    switch: function () {
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle class="f" cx="42" cy="35" r="3.5"/><circle class="f" cx="78" cy="35" r="3.5"/>' +
        '<path d="M42 35 L75 16"/>';
    },
    pushbutton: function () {
      // normally open push button: a bar held above two contacts
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle class="f" cx="42" cy="35" r="3.5"/><circle class="f" cx="78" cy="35" r="3.5"/>' +
        '<path d="M38 25 H82 M60 25 V9 M52 9 H68"/>';
    },
    lamp: function () {
      return '<path d="M0 35 H44 M76 35 H120"/>' +
        '<circle cx="60" cy="35" r="16"/>' +
        '<path d="M48.7 23.7 L71.3 46.3 M71.3 23.7 L48.7 46.3"/>';
    },
    ground: function () {
      return '<path d="M0 35 H60 V46"/>' +
        '<path d="M44 46 H76 M50 53 H70 M56 60 H64"/>';
    },
    resistor: function () {
      return '<path d="M0 35 H30 L35 25 L45 45 L55 25 L65 45 L75 25 L85 45 L90 35 H120"/>';
    },
    thermistor: function () {
      return '<path d="M0 35 H30 L35 25 L45 45 L55 25 L65 45 L75 25 L85 45 L90 35 H120"/>' +
        '<path d="M36 56 H44 L84 12"/>' +
        '<text x="88" y="16">t°</text>';
    },
    potentiometer: function () {
      // the arrow is the wiper (signal wire) touching the track
      return '<path d="M0 35 H30 L35 25 L45 45 L55 25 L65 45 L75 25 L85 45 L90 35 H120"/>' +
        '<path d="M60 4 V19"/><path class="f" d="M54 15 L66 15 L60 24 Z"/>';
    },
    diode: function () {
      return '<path d="M0 35 H48 M72 35 H120"/>' +
        '<path class="f" d="M48 22 L48 48 L70 35 Z"/>' +
        '<path d="M71 22 V48"/>';
    },
    led: function () {
      return '<path d="M0 35 H48 M72 35 H120"/>' +
        '<path class="f" d="M48 22 L48 48 L70 35 Z"/>' +
        '<path d="M71 22 V48"/>' +
        '<path d="M64 17 L74 7 M71 7 H74 V10 M74 21 L84 11 M81 11 H84 V14"/>';
    },
    capacitor: function () {
      return '<path d="M0 35 H55 M65 35 H120"/>' +
        '<path d="M55 18 V52 M65 18 V52"/>';
    },
    coil: function () {
      // relay coil: loops of wire; the dashed line shows it moves the contacts
      return '<path d="M0 35 H36 C36 21 48 21 48 35 C48 21 60 21 60 35 C60 21 72 21 72 35 C72 21 84 21 84 35 H120"/>' +
        '<path class="d" d="M60 22 V3"/>';
    },
    contacts: function () {
      // relay contacts (30 -> 87); the dashed line comes up from the coil
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle class="f" cx="42" cy="35" r="3.5"/><circle class="f" cx="78" cy="35" r="3.5"/>' +
        '<path d="M42 35 L75 18"/>' +
        '<path class="d" d="M60 27 V66"/>' +
        '<text class="s" x="34" y="56">30</text><text class="s" x="78" y="56">87</text>';
    },
    motor: function () {
      return '<path d="M0 35 H44 M76 35 H120"/>' +
        '<circle cx="60" cy="35" r="16"/>' +
        '<text class="c" x="60" y="41">M</text>';
    },
    alternator: function () {
      // generator: a circle with a sine wave (makes AC)
      return '<path d="M0 35 H44 M76 35 H120"/>' +
        '<circle cx="60" cy="35" r="16"/>' +
        '<path d="M50 35 C53 26 57 26 60 35 S67 44 70 35"/>';
    },
    splice: function () {
      // filled dot = wires joined; the branch runs down to the next part
      return '<path d="M0 35 H120 M60 35 V68"/>' +
        '<circle class="f" cx="60" cy="35" r="5"/>';
    },
    connector: function () {
      // a harness connector: pin (male) meets socket (female)
      return '<path d="M0 35 H48 M70 35 H120"/>' +
        '<path d="M44 25 L54 35 L44 45"/>' +
        '<path d="M70 25 L60 35 L70 45"/>';
    },

    /* ----- high voltage / EV ----- */
    hvpack: function () {
      // many cells in series: short plate (-) then long plate (+), repeated
      return '<path d="M0 35 H30 M42 35 H52 M64 35 H74 M86 35 H120"/>' +
        '<path class="t" d="M30 28 V42 M52 28 V42 M74 28 V42"/>' +
        '<path d="M42 20 V50 M64 20 V50 M86 20 V50"/>' +
        '<text x="92" y="18">+</text><text x="14" y="22">−</text>' +
        '<text class="s" x="50" y="64">HV</text>';
    },
    msd: function () {
      // manual service disconnect: a pull-out plug with a fuse inside
      return '<path d="M0 35 H36 M84 35 H120"/>' +
        '<rect x="36" y="22" width="48" height="26" rx="4"/>' +
        '<path d="M44 35 C51 27 55 43 60 35 S69 27 76 35"/>' +
        '<path d="M50 22 V12 H70 V22"/>';
    },
    contactor: function () {
      // heavy-duty relay contacts; the dashed line runs up to its coil (the small box)
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle class="f" cx="42" cy="35" r="3.5"/><circle class="f" cx="78" cy="35" r="3.5"/>' +
        '<path d="M42 35 L75 20"/>' +
        '<path class="d" d="M60 27 V14"/><rect x="50" y="2" width="20" height="12" rx="2"/>';
    },
    precharge: function () {
      // a small contactor in line with a resistor
      return '<path d="M0 35 H14 M40 35 H52 L56 26 L64 44 L72 26 L80 44 L88 26 L96 44 L100 35 H120"/>' +
        '<circle class="f" cx="14" cy="35" r="3"/><circle class="f" cx="40" cy="35" r="3"/>' +
        '<path d="M14 35 L38 22"/>';
    },
    inverter: function () {
      // converter box: DC (=) in one corner, AC (~) in the other
      return '<path d="M0 35 H38 M82 35 H120"/>' +
        '<rect x="38" y="13" width="44" height="44" rx="3"/>' +
        '<path d="M38 57 L82 13"/>' +
        '<path d="M44 22 H56 M44 28 H56"/>' +
        '<path d="M62 48 C65 42 68 42 70 48 S75 54 78 48"/>';
    },
    motor3: function () {
      // three-phase AC motor
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle cx="60" cy="35" r="18"/>' +
        '<text class="c" x="60" y="33">M</text><text class="s" x="60" y="48" text-anchor="middle">3~</text>';
    },
    megger: function () {
      // insulation tester (megohmmeter)
      return '<path d="M0 35 H42 M78 35 H120"/>' +
        '<circle cx="60" cy="35" r="18"/>' +
        '<text class="s" x="47" y="40">MΩ</text>';
    },
    chassis: function () {
      // chassis (body) ground: a comb with slanted teeth
      return '<path d="M0 35 H60 V46 M42 46 H78"/>' +
        '<path d="M44 46 L37 57 M60 46 L53 57 M76 46 L69 57"/>';
    },
    hvil: function () {
      // HVIL: a low-voltage loop that runs through each HV connector
      return '<path d="M0 35 H30 V12 H52 M68 12 H90 V35 H120"/>' +
        '<path d="M50 5 L56 12 L50 19 M70 5 L64 12 L70 19"/>' +
        '<text class="s" x="40" y="58">12 V loop</text>';
    },

    /* ----- networks (CAN) ----- */
    module: function () {
      return '<path d="M0 35 H34 M86 35 H120"/>' +
        '<rect x="34" y="14" width="52" height="42" rx="4"/>' +
        '<text class="s" x="47" y="40">ECU</text>';
    },
    twisted: function () {
      // two wires twisted together: CAN-H and CAN-L
      return '<path d="M0 35 H10 C20 18 30 18 40 35 S60 52 70 35 S90 18 100 35 H120"/>' +
        '<path d="M10 35 C20 52 30 52 40 35 S60 18 70 35 S90 52 100 35 H120"/>';
    },
    term: function () {
      // terminating resistor, 120 ohms
      return '<path d="M0 35 H30 L35 25 L45 45 L55 25 L65 45 L75 25 L85 45 L90 35 H120"/>' +
        '<text class="s" x="40" y="62">120 Ω</text>';
    },
    dlc: function () {
      // the 16-pin OBD-II data link connector
      return '<path d="M0 35 H34 M86 35 H120"/>' +
        '<path d="M34 18 H86 L80 52 H40 Z"/>' +
        '<circle class="f" cx="46" cy="28" r="2"/><circle class="f" cx="56" cy="28" r="2"/><circle class="f" cx="66" cy="28" r="2"/><circle class="f" cx="76" cy="28" r="2"/>' +
        '<circle class="f" cx="50" cy="42" r="2"/><circle class="f" cx="60" cy="42" r="2"/><circle class="f" cx="70" cy="42" r="2"/>';
    },

    /* ----- signals on a scope: solid = CAN-H, dashed = CAN-L ----- */
    recessive: function () {
      return '<path d="M0 33 H120"/><path class="d" d="M0 38 H120"/>' +
        '<text class="s" x="4" y="22">H</text><text class="s" x="4" y="56">L</text><text class="s" x="78" y="60">2.5 V</text>';
    },
    dominant: function () {
      return '<path d="M0 34 H40 V14 H80 V34 H120"/><path class="d" d="M0 37 H40 V56 H80 V37 H120"/>' +
        '<text class="s" x="84" y="16">3.5 V</text><text class="s" x="84" y="64">1.5 V</text>';
    },
    canshort: function () {
      // CAN-H shorted to ground: it flatlines near 0 V
      return '<path d="M0 64 H120"/><path class="d" d="M0 40 H120"/>' +
        '<text class="s" x="4" y="58">H ≈ 0 V</text>';
    },
    pwm: function () {
      // pulse width modulation: on time vs off time
      return '<path d="M0 50 H8 V14 H38 V50 H62 V14 H92 V50 H120"/>' +
        '<text class="s" x="15" y="9">on</text><text class="s" x="41" y="66">off</text>';
    }
  };

  function svg(name, size) {
    var d = DRAW[name];
    if (!d) return "";
    var mini = size === "mini";
    return '<svg class="mms ' + (mini ? "mms-mini" : "mms-big") + '" viewBox="0 0 120 70" ' +
      (mini ? 'aria-hidden="true"' : 'role="img" aria-label="Wiring diagram symbol"') +
      ' focusable="false">' + d() + '</svg>';
  }

  window.MMSymbols = { svg: svg, names: Object.keys(DRAW) };
})();
