/** @typedef {import('snapsvg')} Snap */

const EYE_DISTANCE = 75;
const EYE_SIZE = { width: 100, height: 100 };
const SNAP_SIZE = { width: 600, height: 300 };
const CORNER_RADIUS = Math.floor(SNAP_SIZE.height * 0.06);
const UPPER_EYELID_CORNER_RADIUS = CORNER_RADIUS * 0.1;
const MAX_BLINK_DELAY = 10; // in seconds
const BASE_EYE_TOP_Y = Math.floor(SNAP_SIZE.height / 2 - EYE_SIZE.height / 2);
const BASE_UPPER_EYELID_TOP_Y = BASE_EYE_TOP_Y - EYE_SIZE.height;
const BASE_LOWER_EYELID_TOP_Y = BASE_EYE_TOP_Y + EYE_SIZE.height;
var eyeTopY = BASE_EYE_TOP_Y;
var upperEyelidTopY = BASE_UPPER_EYELID_TOP_Y;
var lowerEyelidTopY = BASE_LOWER_EYELID_TOP_Y;

function createEye(idPrefix, x, y, w, h) {
    var eyeBase = draw.rect(x, y, w, h);
    eyeBase.attr({ id: `${idPrefix}EyeBase`, fill: "#006fee", rx: CORNER_RADIUS, ry: CORNER_RADIUS });

    var maskOrigin = { x: x, y: y - h };
    var upperEyelid = eyeBase.clone();
    upperEyelid.attr({ id: `${idPrefix}UpperEyelid`, x: maskOrigin.x, y: maskOrigin.y, fill: "#18181b", rx: UPPER_EYELID_CORNER_RADIUS, ry: UPPER_EYELID_CORNER_RADIUS });

    var lowerEyeLid = upperEyelid.clone();
    lowerEyeLid.attr({ id: `${idPrefix}LowerEyelid`, y: y + h, rx: 0, ry: 0 });

    var eyelids = draw.g(upperEyelid, lowerEyeLid);
    eyelids.attr({ id: `${idPrefix}Eyelids` });

    var eye = draw.g(eyeBase, eyelids);
    eye.attr({ id: `${idPrefix}Eye` });

    return eye;
}

// Blink animation for either eye
function blink(eye) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    var eyeBase = eye.select(`#${idPrefix}EyeBase`);
    var eyeHeight = parseInt(eyeBase.attr("height"));

    // upper eyelid
    var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);

    Snap.animate(upperEyelidTopY, upperEyelidTopY + eyeHeight, function (value) {
        upperEyelid.attr({ y: value });
    }, 75, function () {
        Snap.animate(upperEyelidTopY + eyeHeight, upperEyelidTopY, function (value) {
            upperEyelid.attr({ y: value });
        }, 75);
    });

    // lower eyelid
    var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);

    Snap.animate(lowerEyelidTopY, lowerEyelidTopY - eyeHeight * 0.15, function (value) {
        lowerEyelid.attr({ y: value });
     }, 75, function () {
        // move back down
        Snap.animate(lowerEyelidTopY - eyeHeight * 0.15, lowerEyelidTopY, function (value) {
            lowerEyelid.attr({ y: value });
        }, 75);
    });
}

// Move animation for both eyes
function moveEyes(eyes) {
    var moveDistance = eyes.select("#LeftEyeBase").attr("height");
    // Animate eyes moving right, then back
    Snap.animate(0, moveDistance, function (value) {
        eyes.attr({ transform: `t${value},0` });
    }, 1000, mina.easeinout, function () {
        blink(leftEye);
        // Animate eyes moving back to original position
        Snap.animate(moveDistance, 0, function (value) {
            eyes.attr({ transform: `t${value},0` })
        }, 1000, mina.easeinout, function () {
            // reset tranform after animation
            eyes.attr({ transform: "t0,0" });
        });
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

function setEyeEmotion(emotion, eye, altAnim = false) {
    emotion = emotion.toLowerCase();
    var idPrefix = eye.attr("id").replace("Eye", "");
    if (emotion === "happy") {
        // move the bottom eyelid up 66%
        var moveDistance = EYE_SIZE.height * 0.7;
        var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);
        lowerEyelidTopY = BASE_LOWER_EYELID_TOP_Y - moveDistance;
        Snap.animate(BASE_LOWER_EYELID_TOP_Y, lowerEyelidTopY, function (value) {
            lowerEyelid.attr({ y: value });
        }, 150);
    } else {
        // reset the top eyelid to its original position
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        Snap.animate(upperEyelidTopY, BASE_UPPER_EYELID_TOP_Y, function (value) {
            upperEyelid.attr({ y: value });
        }, 150, function () {
            upperEyelidTopY = BASE_UPPER_EYELID_TOP_Y;
        });

        // reset the bottom eyelid to its original position
        var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);
        Snap.animate(lowerEyelidTopY, BASE_LOWER_EYELID_TOP_Y, function (value) {
            lowerEyelid.attr({ y: value });
        }, 150, function () {
            lowerEyelidTopY = BASE_LOWER_EYELID_TOP_Y;
        });
    }
}

function setEmotion(emotion, eyes, altAnim = false) {
    // Set the emotion for both eyes
    setEyeEmotion(emotion, eyes.select("#LeftEye"), altAnim);
    setEyeEmotion(emotion, eyes.select("#RightEye"), altAnim);
}

var draw = Snap(SNAP_SIZE.width, SNAP_SIZE.height);
draw.rect(0, 0, SNAP_SIZE.width, SNAP_SIZE.height).attr({ fill: '#18181b', rx: CORNER_RADIUS, ry: CORNER_RADIUS });

var leftEye = createEye("Left", (SNAP_SIZE.width / 2) - EYE_DISTANCE - (EYE_SIZE.width / 2), eyeTopY, EYE_SIZE.width, EYE_SIZE.height);
var rightEye = createEye("Right", (SNAP_SIZE.width / 2) + EYE_DISTANCE - (EYE_SIZE.width / 2), eyeTopY, EYE_SIZE.width, EYE_SIZE.height);
var eyes = draw.g(leftEye, rightEye);
eyes.attr({ id: "Eyes" });

//blink(leftEye);
//blink(rightEye);
moveEyes(eyes);
queueBlink();

// first, set emotion to "normal", then wait three seconds and change it to happy
setEmotion("normal", eyes);
setTimeout(() => {
    setEmotion("happy", eyes);
    // after another three seconds, change it back to normal
    setTimeout(() => {
        setEmotion("normal", eyes);
    }, 3000);
}, 3000);
