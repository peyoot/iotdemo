# IoT Demo

[中文说明](README-cn.md)

This is an open-source real-time IoT program hosted that demonstrates real-time communication between a local wireless network and an internet web program consisting of an XBee-based wireless gateway. The entire demo program is divided into two parts: [iotweb](https://github.com/peyoot/iotdemo) and [mqttdevice](https://github.com/peyoot/mqttdevice). Among them, iotweb is the web UI of the demo, and mqttdevice can be used for gateways or smart devices to send data to iotweb and receive command instructions. Real-time communication between the two is achieved through the MQTT protocol, and the communication level is asynchronous, which greatly improves efficiency and is production oriented. This demo program supports both AWSIOT and self-hosted MQTT brokers like mosquitto.Through AWSIOT, you can continue to use Lambda to build various data pools and achieve multi-terminal collaborative applications.

Program Highlights: Support local databases, can be used as a local SCADA program, and support cloud websocket communication. MQTT, Websocket uses asynchronous channel for real-time communication. The data that implements MQTT asynchronous and web-side communication in Django is almost non-existent on the Internet, so the IoT web program serves as the best reference for the IoT web real-time program. The gateway program MQTT uses a multi-threaded MQTT channel to achieve synchronous data acquisition and update of multiple network nodes.

# Undergoing Development

This demo program is still in development phase. More features will be included in later release.