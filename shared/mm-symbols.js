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
