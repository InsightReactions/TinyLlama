/** @typedef {import('snapsvg')} Snap */

// Create a new Snap object with the dimensions of the window
var eyeDistance = 100;
var snapSize = { width: 600, height: 300 };
var cornerRadius = Math.floor(snapSize.height * 0.06);
var maskRadius = cornerRadius * 0.1;
var draw = Snap(snapSize.width, snapSize.height);
draw.rect(0, 0, snapSize.width, snapSize.height).attr({ fill: '#18181b', rx: cornerRadius, ry: cornerRadius });

function createEye(x, y, w, h) {
    var eyeBase = draw.rect(x, y, w, h);
    eyeBase.attr({ fill: "#006fee", rx: cornerRadius, ry: cornerRadius });
    var maskOrigin = { x: x, y: y - h };
    var eyeMask = eyeBase.clone();
    eyeMask.attr({ x: maskOrigin.x, y: maskOrigin.y, fill: "#18181b", rx: maskRadius, ry: maskRadius });
    var eye = draw.g(eyeBase, eyeMask);
    return eye;
}
var leftEye = createEye((snapSize.width / 2) - eyeDistance - 50, 100, 100, 100);
var rightEye = createEye((snapSize.width / 2) + eyeDistance - 50, 100, 100, 100);
var eyes = draw.g(leftEye, rightEye);

// Blink animation for either eye
function blink(gEye) {
    var eye = gEye.children()[0]; // Get the eye (index 0 in this case)
    var eyeHeight = parseInt(eye.attr("height"));
    var eyeMask = gEye.children()[1]; // Get the eye mask (index 1 in this case)
    var originalMaskY = parseInt(eyeMask.attr("y"));

    Snap.animate(originalMaskY, originalMaskY + eyeHeight, function (value) {
        eyeMask.attr({ y: value });
    }, 150, function () {
        Snap.animate(originalMaskY + eyeHeight, originalMaskY, function (value) {
            eyeMask.attr({ y: value });
        }, 150);
    });
}

// Move animation for both eyes
function moveEyes() {
    var moveDistance = rightEye.getBBox().width;
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

blink(leftEye);
//blink(rightEye);
moveEyes();
