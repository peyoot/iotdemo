import json
#from channels.consumer import AsyncConsumer
from channels import Group
from chanmqttproxy.mqttconsumer import MqttConsumer

class MyMqttConsumer(MqttConsumer):
    async def connect(self):
        ... # existing group_add() calls
        # Join mqtt group
        await self.channel_layer.group_add(
            "mqttgroup",
            self.channel_name
        )
        # Ensure MQTT messages come to the room
        # This simplistic approach subscribes the room every
        # time a websocket connects but that's OK
        await self.channel_layer.send(
            "mqtt",
            {
                "type": "mqtt_subscribe",
                "topic": f"demo/#",
                "group": "mqttgroup",
        })
        await self.accept()  # existing accept() call
    # Receive message from mqtt group and send to websocket
    async def mqtt_message(self, event):
        message = event['message']
        topic = messagep["topic"]
        payload = messagep["payload"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': payload
        }))
   # Receive message from WebSocket
    async def receive(self, text_data):
        ... # existing group_send etc
        # Publish on mqtt too
        await self.channel_layer.send(
            "mqtt",
            {
                "type": "mqtt_publish",
                "publish": {  # These form the kwargs for mqtt.publish
                    "topic":  f"demo/#",
                    "payload": message,
                    "qos": 2,
                    "retain": False,
                    }
        })