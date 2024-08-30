# Eyemotion

The Eyemotion runtime supports 11 distinct emotional states for the eyes, each with unique visual cues to convey the intended sentiment. The supported emotions are:

* **Neutral**: The default. A calm and neutral expression, ideal for situations where no emotion is desired.
* **Focused**: A calm and alert expression, ideal for situations where attention is required.
* **Suspicious**: An expression of uncertainty or mistrust, suitable for scenarios where doubt is present.
* **Sleepy**: A tired and drowsy expression, perfect for depicting sleep deprivation or fatigue.
* **Happy**: A cheerful and joyful expression, great for showcasing happiness and contentment.
* **Sad**: A melancholic and sorrowful expression, ideal for depicting emotional pain or sadness.
* **Worried**: An anxious and concerned expression, suitable for scenarios where worry or anxiety is present.
* **Angry**: A fierce and irate expression, perfect for depicting anger or frustration.
* **Furious**: A furious and enraged expression, great for showcasing intense anger or outrage.
* **Skeptical**: An asymmetrical expression of skepticism or doubt, suitable for situations where the character's belief is uncertain.
* **Unimpressed**: A disinterested and unimpressed expression, perfect for depicting a lack of enthusiasm or interest.

## Testing the Eyemotion Endpoint

This section walks you through manually testing the `/eyemotion/room/<room_id>` endpoint, which is responsible for handling new emotions in a specified room.

### Prerequisites

Before proceeding, ensure that the TinyLlama server is running on `http://localhost:8000`, or substitute the domain path for your local configuration.

### Step 1: Test the Endpoint Using curl

To test the endpoint manually, use the following command in your terminal:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"emotion": "furious", "color": "#FF0000"}' http://localhost:8000/eyemotion/room/test
```
**Note on Request Data Structure**

The JSON payload sent with the `POST` request should conform to a specific schema, which is defined as follows:
```json
{
  "emotion": string,
  "x": number (optional),
  "y": number (optional),
  "color": string (optional)
}
```

The `/eyemotion/room/<room_id>` endpoint is designed to validate incoming requests against this schema using JSON Schema. If your request data does not conform to this structure, you may encounter errors or unexpected behavior.

Here's an example of how to use this API with the specified payload:
```json
{
  "emotion": "furious",
  "x": -0.5,
  "y": 0.2,
  "color": "#FF0000"
}
```

In this example, we're specifying an emotion of `"furious"`, a color of `#FF0000`, and some movement towards the bottom-left corner of the canvas. 

The `x` and `y` properties define the position of the eye within the canvas, normalized along the X and Y axes. The center of the canvas is at (0, 0), with positive values on the Y-axis pointing downwards. If not specified, they default to the middle.


### Step 2: Verify the Server Response

The server should respond with a JSON object indicating whether the emission was successful or not. If the response is:
```json
{
    "message": "Data pushed successfully"
}
```
Then the test was successful.

### Step 3: Observe Client-Side Behavior (Recommended)

To  observe how the Eyemotion controller reacts to new emotions, navigate to:

http://localhost:8000/eyemotion/index.html?room_id=test

This URL will assign you to a test room (`test`) where you can preview the effects of your API calls in real-time.

## Understanding Room IDs

The `room_id` parameter is used to identify a specific room within the Eyemotion controller. Each room has its own set of connected clients, and the `/eyemotion/room/<room_id>` endpoint sends new emotions only to clients assigned to that particular room. In this case, by navigating to the test URL with `?room_id=test`, you're effectively joining a test room where you can view the Eyemotion controller assigned to that room.
