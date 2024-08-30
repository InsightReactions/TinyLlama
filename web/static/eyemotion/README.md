Here's the updated `README.md`:

# Testing the Eyemotion Endpoint

This guide walks you through manually testing the `/eyemotion/room/<room_id>` endpoint, which is responsible for handling new emotions in a specified room.

## Prerequisites

Before proceeding, ensure that:

* Your server is running on `http://localhost:8000`.
* You have access to the Eyemotion controller interface.

## Step 1: Test the Endpoint Using curl

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
In this example, we're specifying an emotion of `"furious"` and a color of `#FF0000`. The `x` and `y` properties are optional and represent the normalized eye position along the X and Y axes (-1 to 1), respectively. If not provided, they default to 0.

The `/eyemotion/room/<room_id>` endpoint is designed to validate incoming requests against this schema using JSON Schema. If your request data does not conform to this structure, you may encounter errors or unexpected behavior.

## Step 2: Verify the Server Response

The server should respond with a JSON object indicating whether the emission was successful or not. If the response is:
```json
{
    "message": "Data pushed successfully"
}
```
Then the test was successful.

## Step 3: Observe Client-Side Behavior (Recommended)

To manually interact with the Eyemotion controller and observe how it reacts to new emotions, navigate to:

http://localhost:8000/eyemotion/index.html?room_id=test

This URL will assign you to a test room (`test`) where you can manually change your emotion by clicking on one of the emotion buttons.

**Understanding Room IDs**

The `room_id` parameter is used to identify a specific room within the Eyemotion controller. Each room has its own set of connected clients, and the `/eyemotion/room/<room_id>` endpoint sends new emotions only to clients assigned to that particular room. In this case, by navigating to the test URL with `?room_id=test`, you're effectively joining a test room where you can manually interact with the Eyemotion controller.

By observing how your emotion changes in response to the curl command sent in Step 1, you'll gain insight into how the Eyemotion endpoint handles new emotions and broadcasts them to connected clients.