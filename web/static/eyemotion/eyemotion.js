/** @typedef {import('snapsvg')} Snap */

// ========================
// GLOBAL CONSTANT DEFINITIONS
// ========================

/**
 * The default eye color.
 * @type {string}
 */
const DEFAULT_EYE_COLOR = "#006fee";

/**
 * The distance between the eyes in pixels.
 *
 * @type {number}
 */
const EYE_DISTANCE = 60;

/**
 * The size of each eye, as a width and height object.
 *
 * @type {{ width: number, height: number }}
 */
const EYE_SIZE = { width: 100, height: 100 };

/**
 * The size of the upper and lower eyelids, as a width and height object.
 *
 * @type {{ width: number, height: number }}
 */
const EYELID_SIZE = { width: EYE_SIZE.width + 5, height: EYE_SIZE.height };

/**
 * The size of the entire animation panel, as a width and height object.
 *
 * @type {{ width: number, height: number }}
 */
const SNAP_SIZE = { width: 600, height: 300 };

/**
 * The radius of each iris corner in pixels.
 *
 * @type {number}
 */
const IRIS_CORNER_RADIUS = Math.floor(SNAP_SIZE.height * 0.06);

/**
 * The maximum delay in seconds for a random eye blink animation to trigger.
 *
 * @type {number}
 */
const MAX_BLINK_DELAY = 15;

/**
 * The base y-coordinate of the top of each eye, relative to the SNAP_SIZE.height and EYE_SIZE.height.
 *
 * @type {number}
 */
const BASE_EYE_TOP_Y = Math.floor(SNAP_SIZE.height / 2 - EYE_SIZE.height / 2);

/**
 * The base y-coordinate of the top of the upper eyelid, which is offset from BASE_EYE_TOP_Y.
 *
 * @type {number}
 */
const BASE_UPPER_EYELID_TOP_Y = BASE_EYE_TOP_Y - EYELID_SIZE.height;

/**
 * The base y-coordinate of the top of the lower eyelid, which is also offset from BASE_EYE_TOP_Y.
 *
 * @type {number}
 */
const BASE_LOWER_EYELID_TOP_Y = BASE_EYE_TOP_Y + EYELID_SIZE.height;

/**
 * An object containing factors to adjust the size and position of the eyelids for different emotions.
 *
 * Each emotion has two keys: Left and Right, representing the left and right eye respectively. Within each key,
 * there are two sub-keys: upper and lower, representing the top and bottom eyelid respectively.
 *
 * @type {{ [emotion: string]: { [side: string]: { upper: number, lower: number } } }}
 */
const EMOTION_EYELID_FACTORS = {
    focused: {
        Left: {
            upper: 1.35,
            lower: 1.35,
        },
        Right: {
            upper: 1.35,
            lower: 1.35,
        }
    },
    suspicious: {
        Left: {
            upper: 1.25,
            lower: 1.2,
        },
        Right: {
            upper: 1.3,
            lower: 1.3,
        }
    },
    sleepy: {
        Left: {
            upper: 1.40,
            lower: 1.45,
        },
        Right: {
            upper: 1.45,
            lower: 1.45,
        }
    }
};

// ========================
// FUNCTION DEFINITIONS
// ========================

/**
 * Creates an eye with the specified id prefix and x-coordinate.
 *
 * @param {string} idPrefix The prefix for the IDs of the eye components.
 * @param {number} x The x-coordinate of the eye.
 * @returns {Snap.Element} The created eye element.
 */
function createEye(idPrefix, x) {
    var eyeBase = draw.rect(0, 0, EYE_SIZE.width, EYE_SIZE.height);
    eyeBase.attr({
        id: `${idPrefix}Iris`,
        fill: DEFAULT_EYE_COLOR,
        rx: IRIS_CORNER_RADIUS,
        ry: IRIS_CORNER_RADIUS,
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
        ox: ox,
        oy: BASE_UPPER_EYELID_TOP_Y,
        sx: 1,
        sy: 1,
        transform: `t${ox},${BASE_UPPER_EYELID_TOP_Y}`
    });

    var leftAngledUpperPath = `M 0,0 V ${EYELID_SIZE.height * 0.75} L ${EYELID_SIZE.width},${EYELID_SIZE.height} L ${EYELID_SIZE.width},0 Z`;
    var leftAngledUpper = draw.path(leftAngledUpperPath);
    leftAngledUpper.attr({
        fill: '#18181b',
        id: `${idPrefix}LAngledUpperEyelid`,
        ox: ox,
        oy: BASE_UPPER_EYELID_TOP_Y,
        sx: -1,
        sy: 1,
        transform: `t${ox},${BASE_UPPER_EYELID_TOP_Y} s1,1,0,0`
    })

    var rightAngledUpperPath = `M 0,0 V ${EYELID_SIZE.height} L ${EYELID_SIZE.width},${EYELID_SIZE.height * 0.75} L ${EYELID_SIZE.width},0 Z`;
    var rightAngledUpper = draw.path(rightAngledUpperPath);
    rightAngledUpper.attr({
        fill: '#18181b',
        id: `${idPrefix}RAngledUpperEyelid`,
        ox: ox,
        oy: BASE_UPPER_EYELID_TOP_Y,
        sx: -1,
        sy: 1,
        transform: `t${ox},${BASE_UPPER_EYELID_TOP_Y} s1,1,0,0`
    })

    var lowerEyelid = upperEyelid.clone();
    lowerEyelid.attr({
        id: `${idPrefix}LowerEyelid`,
        rx: 0,
        ry: 0,
        fill: "#18181b",
        oy: BASE_LOWER_EYELID_TOP_Y,
        transform: `t${ox},${BASE_LOWER_EYELID_TOP_Y}`
    });

    var eyelids = draw.g(upperEyelid, rightAngledUpper, leftAngledUpper, lowerEyelid);
    eyelids.attr({ id: `${idPrefix}Eyelids` });

    var eye = draw.g(eyeBase, eyelids);
    eye.attr({
        id: `${idPrefix}Eye`,
        emotion: 'neutral'
    });

    return eye;
}

/**
 * Sets the iris color of a given eye.
 *
 * @param {Snap.Element} eye - The eye element to modify.
 * @param {string} color - The desired iris color (e.g. "#006fee").
 */
function setIrisColor(eye, color) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    var iris = eye.select(`#${idPrefix}Iris`);

    // Define an animation object to smoothly transition from startColor to color
    iris.animate({ fill: Snap.color(color) }, 1000);
}

/**
 * Sets the iris color of both eyes.
 *
 * @param {Snap.Element} eyes - The container element containing both left and right eyes.
 * @param {string} color - The desired iris color (e.g. "#006fee").
 */
function setEyesColor(eyes, color) {
    const leftEye = eyes.select("#LeftEye");
    const rightEye = eyes.select("#RightEye");
    setIrisColor(leftEye, color);
    setIrisColor(rightEye, color);
}

/**
 * Animates a blink effect for either eye.
 *
 * @param {Snap.Element} eye - The eye element to animate.
 */
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

/**
 * Move eyes to a target location on the canvas.
 *
 * @param {Snap.Group} eyes - A group of eye elements.
 * @param {number} propX - The proportion of x distance between the eyes and their original position.
 * @param {number} propY - The proportion of y distance between the eyes and their original position.
 */
function moveEyes(eyes, propX, propY) {
    // Animate eyes coming closer together slightly to look at a location on the canvas
    const leftEye = eyes.select("#LeftEye");
    const rightEye = eyes.select("#RightEye");
    var leftOx = leftEye.attr("ox");
    var leftOy = leftEye.attr("oy");
    var leftSx = leftEye.attr("sx");
    var rightOx = rightEye.attr("ox");
    var rightOy = rightEye.attr("oy");
    var rightSx = rightEye.attr("sx");

    // Adjust eye positions based on proportional distances
    if (propX > 0) {
        // The left eye moves closer to the right eye
        leftOx = leftOx + EYE_SIZE.width * propX * 0.1;
        // The right eye scales down slightly to give the 3D effect
        rightSx = rightSx - rightSx * Math.abs(propX) * 0.25;
    } else if (propX < 0) {
        // The right eye moves closer to the left eye
        rightOx = rightOx + EYE_SIZE.width * propX * 0.1;
        // The left eye scales down slightly to give the 3D effect
        leftSx = leftSx - leftSx * Math.abs(propX) * 0.25;
    }

    // Move eyes vertically based on propY value
    const verticalOffset = EYE_SIZE.height * Math.abs(propY) * 0.1;
    if (propY > 0) {
        // Both eyes up
        leftOy = leftOy - verticalOffset;
        rightOy = rightOy - verticalOffset;
    } else if (propY < 0) {
        // Both eyes down
        leftOy = leftOy + verticalOffset;
        rightOy = rightOy + verticalOffset;
    }

    // Animate eyes moving as a group
    eyes.animate({ transform: `t${EYE_SIZE.width * propX},${EYE_SIZE.height * propY}` }, 1000, mina.easeinout);

    // perform the animation to the target transform
    leftEye.animate({ transform: `t${leftOx},${leftOy} s${leftSx},${leftSx}` }, 1000, mina.easeinout);
    rightEye.animate({ transform: `t${rightOx},${rightOy} s${rightSx},${rightSx}` }, 1000, mina.easeinout);
}

/**
 * Queue blink animation for both eyes.
 *
 * @param {number} interval - The time in milliseconds to wait before blinking.
 */
function queueBlink() {
    var interval = Math.floor(Math.random() * MAX_BLINK_DELAY) * 1000;
    setTimeout(function () {
        blink(leftEye);
        blink(rightEye);
        queueBlink();
    }, interval);
}

/**
 * Resets an eye to its original state.
 *
 * @param {Snap.Group} eye - The eye element to reset.
 */
function resetEye(eye) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    // reset the top eyelid to its original position
    var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);

    // Upper offset X and Y
    var uox = upperEyelid.attr("ox");
    var uoy = BASE_UPPER_EYELID_TOP_Y;

    upperEyelid.attr('oy', uoy);
    upperEyelid.attr('sx', 1);
    upperEyelid.attr('sy', 1);

    upperEyelid.animate({ transform: `t${uox},${uoy} s1,1,0,0` }, 150);

    // reset the left angled upper eyelid to its original position
    var leftAngledUpper = eye.select(`#${idPrefix}LAngledUpperEyelid`);

    // Left angled upper offset X and Y
    var lauox = leftAngledUpper.attr("ox");
    var lauoy = BASE_UPPER_EYELID_TOP_Y;

    leftAngledUpper.attr('oy', lauoy);
    leftAngledUpper.attr('sx', 1);
    leftAngledUpper.attr('sy', 1);

    leftAngledUpper.animate({ transform: `t${lauox},${lauoy} s1,1,0,0` }, 150);

    // reset the right angled upper eyelid to its original position
    var rightAngledUpper = eye.select(`#${idPrefix}RAngledUpperEyelid`);

    // Right angled upper offset X and Y
    var rauox = rightAngledUpper.attr("ox");
    var rauoy = BASE_UPPER_EYELID_TOP_Y;

    rightAngledUpper.attr('oy', rauoy);
    rightAngledUpper.attr('sx', 1);
    rightAngledUpper.attr('sy', 1);

    rightAngledUpper.animate({ transform: `t${rauox},${rauoy} s1,1,0,0` }, 150);

    // reset the bottom eyelid to its original position
    var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);

    var lox = lowerEyelid.attr("ox");
    var loy = BASE_LOWER_EYELID_TOP_Y;

    lowerEyelid.attr("oy", loy);
    lowerEyelid.attr('sx', 1);
    lowerEyelid.attr('sy', 1);

    lowerEyelid.animate({ transform: `t${lox},${loy} s1,1,0,0` }, 150);
}

/**
 * Set the emotion of an eye to a specified value.
 *
 * @param {Snap.Group} eye - The eye element whose emotion will be changed.
 * @param {string} emotion - The desired emotion for the eye.
 */
function setEyeEmotion(eye, emotion) {
    var curEmotion = eye.attr('emotion');
    emotion = emotion.toLowerCase();
    if (curEmotion === emotion) {
        return;
    } else {
        resetEye(eye);
        eye.attr("emotion", emotion);
        if (emotion === "neutral") {
            return;
        }
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
    } else if (emotion === "sad" || emotion === "worried" || emotion === "angry" || emotion === "furious") {
        // Selects the appropriate angled eyelids
        var isMad = emotion === "angry" || emotion === "furious";
        // propY is equivalent to emotional intensity
        var propY = emotion === "worried" || emotion === "angry" ? 0.3 : 0.7;
        // This determines which selected angled eyelid will be moved (left or right)
        var angleTag = idPrefix === "Left" ? (isMad ? "L" : "R") : (isMad ? "R" : "L");

        // move the angled upper eyelid down
        var moveDistance = EYE_SIZE.height * propY;
        var angledUpperEyelid = eye.select(`#${idPrefix}${angleTag}AngledUpperEyelid`);
        var ox = angledUpperEyelid.attr("ox");
        var sx = angledUpperEyelid.attr("sx");
        var sy = angledUpperEyelid.attr("sy");

        var oy = BASE_UPPER_EYELID_TOP_Y + moveDistance;
        angledUpperEyelid.attr("oy", oy);

        angledUpperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    } else if (emotion === "focused" || emotion === "suspicious" || emotion === "sleepy") {
        // move the top eyelid down
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        var uox = upperEyelid.attr("ox");
        var uoy = upperEyelid.attr("oy");
        var usx = upperEyelid.attr("sx");

        var usy = EMOTION_EYELID_FACTORS[emotion][idPrefix].upper;
        upperEyelid.attr('sy', usy);
        upperEyelid.animate({ transform: `t${uox},${uoy} s${usx},${usy},0,0` }, 150);

        // move the bottom eyelid up
        var lowerEyelid = eye.select(`#${idPrefix}LowerEyelid`);
        var lox = lowerEyelid.attr("ox");
        var loy = lowerEyelid.attr("oy");
        var lsx = lowerEyelid.attr("sx");

        var lsy = EMOTION_EYELID_FACTORS[emotion][idPrefix].lower;
        lowerEyelid.attr('sy', lsy);
        lowerEyelid.animate({ transform: `t${lox},${loy} s${lsx},${lsy},0,${EYE_SIZE.height}` }, 150);
    } else if (emotion === "skeptical" && idPrefix === "Right") {
        // move the top eyelid down
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        var ox = upperEyelid.attr("ox");
        var oy = upperEyelid.attr("oy");
        var sx = upperEyelid.attr("sx");

        var sy = 1.4;
        upperEyelid.attr('sy', sy);
        upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    } else if (emotion === "unimpressed") {
        // move the top eyelid down
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        var ox = upperEyelid.attr("ox");
        var oy = upperEyelid.attr("oy");
        var sx = upperEyelid.attr("sx");

        var sy = 1.7;
        upperEyelid.attr('sy', sy);
        upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    } else {
        console.log(`Unable to execute animation: Emotion "${emotion}" not found for eye "${idPrefix}Eye"`);
    }
}

/**
 * Set the emotion of both eyes to a specified value.
 *
 * @param {Snap.Group} eyes - A group of eye elements whose emotions will be changed.
 * @param {string} emotion - The desired emotion for the eye.
 */
function setEmotion(eyes, emotion) {
    emotion = emotion.toLowerCase();
    // Set the emotion for both eyes
    setEyeEmotion(eyes.select("#LeftEye"), emotion);
    setEyeEmotion(eyes.select("#RightEye"), emotion);
}

// ========================
// RUNTIME INITIALIZATION
// ========================

var draw = Snap(SNAP_SIZE.width, SNAP_SIZE.height);
draw.mousedown(function (event) {
    moveEyes(eyes, event.clientX, event.clientY);
    // move back to the 0,0 position after a short delay
    setTimeout(function () {
        moveEyes(eyes, SNAP_SIZE.width / 2, SNAP_SIZE.height / 2);
    }, 2000);
});

// Fill in background
draw.rect(0, 0, SNAP_SIZE.width, SNAP_SIZE.height).attr({ fill: '#18181b', rx: IRIS_CORNER_RADIUS, ry: IRIS_CORNER_RADIUS });

// Create eyes
var leftEye = createEye("Left", (SNAP_SIZE.width / 2) - EYE_DISTANCE - (EYE_SIZE.width / 2));
var rightEye = createEye("Right", (SNAP_SIZE.width / 2) + EYE_DISTANCE - (EYE_SIZE.width / 2));
var eyes = draw.g(leftEye, rightEye);
var eyesBbox = eyes.getBBox();
eyes.attr({
    id: "Eyes",
    ox: eyesBbox.x,
    oy: eyesBbox.y,
    transform: 't0,0',
});

// Initialize animation states
setEmotion(eyes, "neutral");
queueBlink();

// ========================
// SOCKETIO INITIALIZATION
// ========================
let socket = io({ transports: ['websocket', 'polling'] });
console.log(socket);

socket.on('connect', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    console.log(socket);
    if (roomId) {
        // Connect to the server with the specified room ID.
        console.log(`Connecting to SocketIO in room ${roomId}...`);
        socket.emit('join', { 'room': roomId })
    }
});

socket.on("connect_error", (err) => {
    console.log(err);
});

socket.on('new_emotion', function (data) {
    /**
     * Expected format of the 'new_emotion' event data:
     * {
     *   "emotion": string, // REQUIRED. (e.g. "furious")
     *   x: number, // OPTIONAL. normalized eye position along X axis (-1 to 1), 0 is center of screen
     *   y: number, // OPTIONAL. normalized eye position along Y axis (-1 to 1), 0 is center of screen
     *   "color": string // OPTIONAL. (e.g. "#ff0000")
     * }
     */
    console.log("new_emotion:", data);

    var emotion = data.emotion;
    var x = data.x || 0; // default to no movement along X axis if not provided
    var y = data.y || 0; // default to no movement along Y axis if not provided
    var color = data.color;

    setEmotion(eyes, emotion);

    if (color) {
        setEyesColor(eyes, color);
    }
    moveEyes(eyes, x, y);

    setTimeout(function () {
        setEmotion(eyes, "neutral");
        if (color) {
            setEyesColor(eyes, DEFAULT_EYE_COLOR);
        }
        moveEyes(eyes, 0, 0);
    }, 5000);
});

socket.connect();
