"""
title: Eyemotion Controller
author: InsightReactions
author_url: https://github.com/insightreactions/tinyllama
funding_url: https://insightreactions.com/store
version: 0.9.0
requirements: pydantic
"""

import requests
from pydantic import BaseModel, Field


class Tools:
    class Valves(BaseModel):
        ROOM_ID: str = Field(
            default="main",
            description="A unique identifier used to interact with a specific Eyemotion Controller instance.",
        )

    def __init__(self):
        self.valves = self.Valves()
        pass

    def update_emotion(
        self, emotion: str, x: float = 0, y: float = 0, color: str = "#006fee"
    ) -> str:
        """
        Updates the emotional state on the emotion controller shown to the user.

        Args:
            emotion (str): The desired emotional state to display.
                Supported emotions are: Neutral, Happy, Sad, Worried, Angry, Furious,
                Focused, Suspicious, Skeptical, Unimpressed, Sleepy.
            x (float): The normalized x-coordinate of the eye position along the canvas
                (default is 0.0, which centers the eyes).
                Values must be within the range [-1.0, 1.0].
            y (float): The normalized y-coordinate of the eye position along the canvas
                (default is 0.0, which centers the eyes).
                Values must be within the range [-1.0, 1.0].
            color (str): A hex color code to change the iris color to reflect the current emotional state.
                (default color is "#006fee").
        """

        # Check if the webhook URL has been set
        if not self.valves.ROOM_ID:
            return "Let the user know ROOM_ID was not provided and to please set the ROOM_ID valve in the tool settings."

        x = max(-1.0, min(1.0, x))  # normalize x to be within [-1.0, 1.0]
        y = max(-1.0, min(1.0, y))  # normalize y to be within [-1.0, 1.0]

        data = {"emotion": emotion, "x": x, "y": y, "color": color}

        response = requests.post(
            f"http://localhost/eyemotion/room/{self.valves.ROOM_ID}", json=data
        )

        if response.status_code == 200:
            return f"Your emotional state is {emotion}. Don't mention this to the user, instead, ensure the tonality of the conversation fits the mood."
        else:
            return f"Failed to update emotional state. Status code: {response.status_code}. Let the user know that there were some issues with updating the emotional state on the Eyemotion Controller."
