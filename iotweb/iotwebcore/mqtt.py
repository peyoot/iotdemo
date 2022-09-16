import paho.mqtt.client as mqttc
from random import randrange,uniform
import time
import ssl
import os
from django.conf import settings



AWSIOT_ENABLE = True
#change linux to a specific device ID like ix15 or cc6ulsbc-1, or device ID
MQTT_SUBTOPIC="demo/#"
clientID = "appclient"
mqtt_port = 8883

# Certs define
AWS_ROOTCA = os.path.join(settings.BASE_DIR, 'iotwebcore/aws_certs/AmazonRootCA1.pem')
AWS_CERT = os.path.join(settings.BASE_DIR, 'iotwebcore/aws_certs/17f000a56e4ecf9510dd5d5fa153ca8877d8f727865e2bf7b01722827cf47b04-certificate.pem.crt')
AWS_KEY = os.path.join(settings.BASE_DIR, 'iotwebcore/aws_certs/17f000a56e4ecf9510dd5d5fa153ca8877d8f727865e2bf7b01722827cf47b04-private.pem.key')
AWS_ENDPOINT = "a1nl1xxmre4mok.ats.iot.cn-north-1.amazonaws.com.cn"

MY_CA = os.path.join(settings.BASE_DIR, 'iotwebcore/certs/ca.crt')
MY_CERT = os.path.join(settings.BASE_DIR, 'iotwebcore/certs/client1.crt')
MY_KEY = os.path.join(settings.BASE_DIR, 'iotwebcore/certs/client1.key')

#MY_CA = "./certs/ca.crt"
#MY_CERT = "./certs/client1.crt"
#MY_KEY = "./certs/client1.key"
MY_BROKER = "52.80.119.72"


if AWSIOT_ENABLE == True:
    #type_install = 'thingboard.demo:8080'
    broker = AWS_ENDPOINT
    cacert = AWS_ROOTCA
    certfile = AWS_CERT
    keyfile = AWS_KEY
else:
    broker = MY_BROKER
    cacert = MY_CA
    certfile = MY_CERT
    keyfile = MY_KEY

keepalive = 60 

#callback define

def on_connect(client, userdata, flags, rc):
#    print(rc)
    if rc == 0:
        client.connected_flag = True  # set flag
#        global mqtt_connected
#        mqtt_connected = True
        client.subscribe(MQTT_SUBTOPIC,0)
        time.sleep(2)
        print(broker,"connected ok",client)

    else:
        print("Bad connection Returned code=", rc)
        client.loop_stop()


#def on_connect(self,mosq, obj, rc):
#    print("connecting to broker "+str(broker)+":"+str(mqtt_port))
#    print("cacert =",cacert)
#    self.subscribe(MQTT_SUBTOPIC, 0)

def on_message(client, userdata, message):
	print ("Topic: " + str(message.topic))
	print ("QoS: " + str(message.qos))
	print ("Payload: " + str(message.payload))

def on_subscribe(client, obj, mid, granted_qos):
    print("Subscribed to Topic: " + 
	MQTT_SUBTOPIC + " with QoS: " + str(granted_qos))


client = mqttc.Client(clientID)
client.on_connect = on_connect
client.on_message = on_message
client.tls_set(ca_certs=cacert, certfile=certfile, keyfile=keyfile, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
client.connect(broker, mqtt_port, keepalive)