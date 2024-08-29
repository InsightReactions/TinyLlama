/** @typedef {import('snapsvg')} Snap */

// ========================
// GLOBAL CONSTANT DEFINITIONS
// ========================

const EYE_DISTANCE = 60;
const EYE_SIZE = { width: 100, height: 100 };
const EYELID_SIZE = { width: EYE_SIZE.width + 5, height: EYE_SIZE.height };
const SNAP_SIZE = { width: 600, height: 300 };
const CORNER_RADIUS = Math.floor(SNAP_SIZE.height * 0.06);
const UPPER_EYELID_CORNER_RADIUS = CORNER_RADIUS * 0.1;
const MAX_BLINK_DELAY = 10; // in seconds
const BASE_EYE_TOP_Y = Math.floor(SNAP_SIZE.height / 2 - EYE_SIZE.height / 2);
const BASE_UPPER_EYELID_TOP_Y = BASE_EYE_TOP_Y - EYELID_SIZE.height;
const BASE_LOWER_EYELID_TOP_Y = BASE_EYE_TOP_Y + EYELID_SIZE.height;
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

function mapValue(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

function createEye(idPrefix, x) {
    var eyeBase = draw.rect(0, 0, EYE_SIZE.width, EYE_SIZE.height);
    eyeBase.attr({
        id: `${idPrefix}Iris`,
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

function setIrisColor(eye, color) {
    var idPrefix = eye.attr("id").replace("Eye", "");
    var iris = eye.select(`#${idPrefix}Iris`);
    iris.attr({ fill: color });
}

function setEyesColor(eyes, color) {
    const leftEye = eyes.select("#LeftEye");
    const rightEye = eyes.select("#RightEye");
    setIrisColor(leftEye, color);
    setIrisColor(rightEye, color);
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

// Move animation for both eyes to look at a location on the canvas
function moveEyes(eyes, x, y) {
    // Calculate proportional distances from center of screen
    const propX = (x - parseInt(draw.attr("width")) / 2) / (parseInt(draw.attr("width")) / 2);
    const propY = (y - parseInt(draw.attr("height")) / 2) / (parseInt(draw.attr("height")) / 2);

    // Calculate proportional scaling based on distance from the center of the screen (both x and y axes)
    const propS = 1 + Math.sqrt(propX * propX + propY * propY) * 0.5;

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

        var sy = 1.4
        upperEyelid.attr('sy', sy);
        upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    } else if (emotion === "unimpressed") {
        // move the top eyelid down
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        var ox = upperEyelid.attr("ox");
        var oy = upperEyelid.attr("oy");
        var sx = upperEyelid.attr("sx");

        var sy = 1.7
        upperEyelid.attr('sy', sy);
        upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    } else if (emotion === "sleepy") {
        // move the top eyelid down
        var upperEyelid = eye.select(`#${idPrefix}UpperEyelid`);
        var ox = upperEyelid.attr("ox");
        var oy = upperEyelid.attr("oy");
        var sx = upperEyelid.attr("sx");

        var sy = 1.5
        upperEyelid.animate({ transform: `t${ox},${oy} s${sx},${sy},0,0` }, 150);
    }
}

function setEmotion(emotion, eyes) {
    emotion = emotion.toLowerCase();
    // Set the emotion for both eyes
    setEyeEmotion(emotion, eyes.select("#LeftEye"));
    setEyeEmotion(emotion, eyes.select("#RightEye"));
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
draw.rect(0, 0, SNAP_SIZE.width, SNAP_SIZE.height).attr({ fill: '#18181b', rx: CORNER_RADIUS, ry: CORNER_RADIUS });

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
setEmotion("neutral", eyes);
queueBlink();

// ========================
// SOCKETIO INITIALIZATION
// ========================
let socket = io({ transports: ['websocket'], autoConnect: false });
console.log(socket);

socket.on('connect', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    console.log(socket);
    if (roomId) {
        // Connect to the server with the specified room ID.
        console.log(`Connecting to SocketIO in room ${roomId}...`);
        socket.emit('join', {'room': roomId})
    }
});

socket.on("connect_error", (err) => {
    // the reason of the error, for example "xhr poll error"
    console.log(err.message);
  
    // some additional description, for example the status code of the initial HTTP response
    console.log(err.description);
  
    // some additional context, for example the XMLHttpRequest object
    console.log(err.context);
  });

socket.on('new_emotion', function (data) {
    console.log("Received new emotion data:", data);
    setEmotion(data.emotion, eyes);
    moveEyes(eyes, data.x, data.y);
    setEyesColor(eyes, data.color);
});

socket.connect();