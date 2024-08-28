/** @typedef {import('snapsvg')} Snap */

const EYE_DISTANCE = 75;
const EYE_SIZE = { width: 100, height: 100 };
const EYELID_SIZE = { width: EYE_SIZE.width + 5, height: EYE_SIZE.height };
const SNAP_SIZE = { width: 600, height: 300 };
const CORNER_RADIUS = Math.floor(SNAP_SIZE.height * 0.06);
const UPPER_EYELID_CORNER_RADIUS = CORNER_RADIUS * 0.1;
const MAX_BLINK_DELAY = 10; // in seconds
const BASE_EYE_TOP_Y = Math.floor(SNAP_SIZE.height / 2 - EYE_SIZE.height / 2);
const BASE_UPPER_EYELID_TOP_Y = BASE_EYE_TOP_Y - EYELID_SIZE.height;
const BASE_LOWER_EYELID_TOP_Y = BASE_EYE_TOP_Y + EYELID_SIZE.height;

function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function createEye(idPrefix, x) {
    var eyeBase = draw.rect(0, 0, EYE_SIZE.width, EYE_SIZE.height);
    eyeBase.attr({
        id: `${idPrefix}EyeBase`,
        fill: "#006fee",
        rx: CORNER_RADIUS,
        ry: CORNER_RADIUS,
        ox: x,
        oy: BASE_EYE_TOP_Y,
        transform: `t${x},${BASE_EYE_TOP_Y}`
    });

    var eyeBbox = eyeBase.getBBox();
    var upperEyelid = draw.rect(0, 0, EYELID_SIZE.width, EYELID_SIZE.height);
    var ox = eyeBbox.cx - EYELID_SIZE.width / 2;
    upperEyelid.attr({
        id: `${idPrefix}UpperEyelid`,
        fill: "#18181b",
        rx: UPPER_EYELID_CORNER_RADIUS,
        ry: UPPER_EYELID_CORNER_RADIUS,
        ox: ox,
        oy: BASE_UPPER_EYELID_TOP_Y,
        sx: 1,
        sy: 1,
        transform: `t${ox},${BASE_UPPER_EYELID_TOP_Y}`
    });

    var lowerEyelid = upperEyelid.clone();
    lowerEyelid.attr({
        id: `${idPrefix}LowerEyelid`,
        rx: 0,
        ry: 0,
        fill: "#18181b",
        oy: BASE_LOWER_EYELID_TOP_Y,
        transform: `t${ox},${BASE_LOWER_EYELID_TOP_Y}`
    });

    var eyelids = draw.g(upperEyelid, lowerEyelid);
    eyelids.attr({ id: `${idPrefix}Eyelids` });

    var eye = draw.g(eyeBase, eyelids);
    eye.attr({
        id: `${idPrefix}Eye`,
        emotion: 'neutral'
    });

    return eye;
}

// Blink animation for either eye
function blink(eye) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
    var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);

    // upper eyelid
    var uSx = upperEyelid.attr("sx"); // scale x
    var uSy = upperEyelid.attr("sy"); // scale y
    var uOx = upperEyelid.attr("ox"); // origin x
    var uOy = upperEyelid.attr("oy"); // origin y
    upperEyelid.animate({ transform: `t${uOx},${uOy} s${uSx},2,0,0` }, 75, function () {
        upperEyelid.animate({ transform: `t${uOx},${uOy} s${uSx},${uSy},0,0` }, 75);
    });

    // lower eyelid
    var lSx = lowerEyelid.attr("sx");
    var lSy = lowerEyelid.attr("sy");
    var lOx = lowerEyelid.attr("ox");
    var lOy = lowerEyelid.attr("oy");
    lowerEyelid.animate({ transform: `t${lOx},${lOy} s${lSx},1.15,0,${EYE_SIZE.height}` }, 75, function () {
        lowerEyelid.animate({ transform: `t${lOx},${lOy} s${lSx},${lSy},0,${EYE_SIZE.height}` }, 75);
    });
}

// Move animation for both eyes
function moveEyes(eyes) {
    var moveDistance = eyes.select("#LeftEyeBase").attr("width");
    // Animate eyes moving right, then back
    eyes.animate({ transform: `t${moveDistance},0` }, 1000, mina.easeinout, function () {
        // Animate eyes moving back to original position
        eyes.animate({ transform: `t0,0` }, 1000, mina.easeinout);
    });
}

function queueBlink() {
    var interval = Math.floor(Math.random() * MAX_BLINK_DELAY) * 1000;
    setTimeout(function () {
        blink(leftEye);
        blink(rightEye);
        queueBlink();
    }, interval);
}

function resetEye(eye) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    // reset the top eyelid to its original position
    var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);

    var uOx = upperEyelid.attr("ox");
    var uOy = BASE_UPPER_EYELID_TOP_Y;

    //upperEyelid.attr('ox', uOx);
    upperEyelid.attr('oy', uOy);
    upperEyelid.attr('sx', 1);
    upperEyelid.attr('sy', 1);

    upperEyelid.animate({ transform: `t${uOx},${uOy} s1,1,0,0` }, 150);

    // reset the bottom eyelid to its original position
    var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);

    var lOx = lowerEyelid.attr("ox");
    var lOy = BASE_LOWER_EYELID_TOP_Y;

    //lowerEyelid.attr('ox', lOx);
    lowerEyelid.attr("oy", lOy);
    lowerEyelid.attr('sx', 1);
    lowerEyelid.attr('sy', 1);

    lowerEyelid.animate({ transform: `t${lOx},${lOy} s1,1,0,0` }, 150);
}

function setEyeEmotion(emotion, eye) {
    var curEmotion = eye.attr('emotion');
    emotion = emotion.toLowerCase();
    if (curEmotion === emotion) {
        return;
    } else {
        resetEye(eye);
        eye.attr("emotion", emotion);
    }
    var idPrefix = eye.attr("id").replace("Eye", "");

    if (emotion === "happy") {
        // move the bottom eyelid up 
        var moveDistance = EYE_SIZE.height * 0.7;
        var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);
        var ox = lowerEyelid.attr("ox");
        var sx = lowerEyelid.attr("sx");
        var sy = lowerEyelid.attr("sy");

        var oy = BASE_LOWER_EYELID_TOP_Y - moveDistance;
        lowerEyelid.attr("oy", oy);

        lowerEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,${EYE_SIZE.height}` }, 150);
    } else if (emotion === "skeptic") {
        if (idPrefix === "Right") {
            // move the top eyelid down
            var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
            var ox = upperEyelid.attr("ox");
            var oy = upperEyelid.attr("oy");

            var sx = upperEyelid.attr("sx");

            var sy = 1.5
            upperEyelid.attr('sy', sy);
            upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
        }
    }
}

function setEmotion(emotion, eyes) {
    // Set the emotion for both eyes
    setEyeEmotion(emotion, eyes.select("#LeftEye"));
    setEyeEmotion(emotion, eyes.select("#RightEye"));
}

var draw = Snap(SNAP_SIZE.width, SNAP_SIZE.height);
draw.rect(0, 0, SNAP_SIZE.width, SNAP_SIZE.height).attr({ fill: '#18181b', rx: CORNER_RADIUS, ry: CORNER_RADIUS });

var leftEye = createEye("Left", (SNAP_SIZE.width / 2) - EYE_DISTANCE - (EYE_SIZE.width / 2));
var rightEye = createEye("Right", (SNAP_SIZE.width / 2) + EYE_DISTANCE - (EYE_SIZE.width / 2));
var eyes = draw.g(leftEye, rightEye);
var eyesBbox = eyes.getBBox();
eyes.attr({
    id: "Eyes",
    ox: eyesBbox.x,
    oy: eyesBbox.y,
    transform: 't0,0'
});

//moveEyes(eyes);
//blink(leftEye);
//blink(rightEye);
setEmotion("neutral", eyes);
queueBlink();
