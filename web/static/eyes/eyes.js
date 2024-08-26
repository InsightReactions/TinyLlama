/** @typedef {import('snapsvg')} Snap */

// Create a new Snap object with the dimensions of the window
var eyeDistance = 75;
var snapSize = { width: 600, height: 300 };
var cornerRadius = Math.floor(snapSize.height * 0.06);
var maskRadius = cornerRadius * 0.1;
var draw = Snap(snapSize.width, snapSize.height);
draw.rect(0, 0, snapSize.width, snapSize.height).attr({ fill: '#18181b', rx: cornerRadius, ry: cornerRadius });

function createEye(idPrefix, x, y, w, h) {
    var eyeBase = draw.rect(x, y, w, h);
    eyeBase.attr({ id: `${idPrefix}EyeBase`, fill: "#006fee", rx: cornerRadius, ry: cornerRadius });

    var maskOrigin = { x: x, y: y - h };
    var upperEyelid = eyeBase.clone();
    upperEyelid.attr({ id: `${idPrefix}UpperEyelid`, x: maskOrigin.x, y: maskOrigin.y, fill: "#18181b", rx: maskRadius, ry: maskRadius });

    var lowerEyeLid = upperEyelid.clone();
    lowerEyeLid.attr({ id: `${idPrefix}LowerEyelid`, y: y + h });

    var eyelids = draw.g(upperEyelid, lowerEyeLid);
    eyelids.attr({ id: `${idPrefix}Eyelids` });

    var eye = draw.g(eyeBase, eyelids);
    eye.attr({ id: `${idPrefix}Eye` });

    return eye;
}
var leftEye = createEye("Left", (snapSize.width / 2) - eyeDistance - 50, 100, 100, 100);
var rightEye = createEye("Right", (snapSize.width / 2) + eyeDistance - 50, 100, 100, 100);
var eyes = draw.g(leftEye, rightEye);
eyes.attr({ id: "Eyes" });

// Blink animation for either eye
function blink(eye) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    var eyeBase = eye.select(`#${idPrefix}EyeBase`);
    var eyeHeight = parseInt(eyeBase.attr("height"));
    var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
    var upperEyelidY = parseInt(upperEyelid.attr("y"));

    Snap.animate(upperEyelidY, upperEyelidY + eyeHeight, function (value) {
        upperEyelid.attr({ y: value });
    }, 75, function () {
        Snap.animate(upperEyelidY + eyeHeight, upperEyelidY, function (value) {
            upperEyelid.attr({ y: value });
        }, 75, function () {
            // Ensure the eyelid is reset to the original position after animation
            // Sometimes a difference can occur due to rounding errors in animation values
            upperEyelid.attr({ y: upperEyelidY });
        });
    });
}

// Move animation for both eyes
function moveEyes(eyes) {
    var moveDistance = eyes.select("#LeftEyeBase").attr("height");
    // Animate eyes moving right, then back
    Snap.animate(0, moveDistance, function (value) {
        eyes.attr({ transform: `t${value},0` });
    }, 1000, mina.easeinout, function () {
        blink(rightEye);
        // Animate eyes moving back to original position
        Snap.animate(moveDistance, 0, function (value) {
            eyes.attr({ transform: `t${value},0` })
        }, 1000, mina.easeinout);
    });
}

// blink at a random inverval, 
function randomBlink() {
    var interval = Math.floor(Math.random() * 10) * 1000;
    setTimeout(function () {
        blink(leftEye);
        blink(rightEye);
        randomBlink();
    }, interval);
}

//blink(leftEye);
//blink(rightEye);
//moveEyes(eyes);
randomBlink();
