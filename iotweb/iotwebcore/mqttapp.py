"""
import paho.mqtt.client as mqttc
from random import randrange,uniform
import time
import ssl
import os
from django.conf import settings

class mqttAPP():

    AWSIOT_ENABLED = False
    #define gateway device that will managed by gateway
    GATEWAY_NAME = "gateway1"
    GATEWAY_ID = "0001"
    GATEY_TYPE =  "ConnectCore"
    my_devices = [{"device_name": GATEWAY_NAME, "device_mac": GATEWAY_ID, "device_type": GATEY_TYPE}]

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


    if AWSIOT_ENABLED == True:
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

    #in case threads goes too many, put forward exception
    too_many_threads = 10
    init_time = time.time()
    #callback define

    def Connect(client, broker, port, cacert, certfile, keyfile, keepalive, run_forever=False):
        connflag = False
        #delay = 5
        print("connecting ",client)
        badcount = 0  # counter for bad connection attempts
        while not connflag:
            print(logging.info("connecting to broker " + str(broker)))
            #print("connecting to broker "+str(broker)+":"+str(port))
            #print("cacert =",cacert)
            #print("certfile = ",certfile)
            print("Attempts ", str(badcount))
            time.sleep(2)
            try:
                #client.username_pw_set(token)
                #client.tls_set(ca_certs=aws_rootCA, certfile=aws_cert, keyfile=aws_key, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
                client.tls_set(ca_certs=cacert, certfile=certfile, keyfile=keyfile, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
                client.connect(broker, port, keepalive)
                connflag = True

            except:
                client.badconnection_flag = True
                logging.info("connection failed " + str(badcount))
                badcount += 1
                if badcount >= 3 and not run_forever:
                    return -1
                    raise SystemExit  # give up

        return 0


    def wait_for(client, msgType, period=1, wait_time=20, running_loop=False):
        # running loop is true when using loop_start or loop_forever
        client.running_loop = running_loop  #
        wcount = 0
        while True:
            logging.info("waiting" + msgType)
            if msgType == "CONNACK":
                if client.on_connect:
                    if client.connected_flag:
                        return True
                    if client.bad_connection_flag:  #
                        return False

            if msgType == "SUBACK":
                if client.on_subscribe:
                    if client.suback_flag:
                        return True
            if msgType == "MESSAGE":
                if client.on_message:
                    if client.message_received_flag:
                        return True
            if msgType == "PUBACK":
                if client.on_publish:
                    if client.puback_flag:
                        return True

            if not client.running_loop:
                client.loop(.01)  # check for messages manually
            time.sleep(period)
            wcount += 1
            if wcount > wait_time:
                print("return from wait loop taken too long")
                return False
        return True


    def client_loop(client, broker, port, cacert, certfile, keyfile, device_type, device_mac, loop_function=None, keepalive=300,
                    loop_delay=10, run_forever=False):

        client.run_flag = True
        client.broker = broker
        
        print("running loop ")
        print("device id is ", deviceid)
        client.reconnect_delay_set(min_delay=1, max_delay=12)

        while client.run_flag:  # loop forever

            if client.bad_connection_flag:
                break
            if not client.connected_flag:
                print("Connecting to " + broker)
                if Connect(client, broker, port, cacert, certfile, keyfile, keepalive, run_forever) != -1:
                    if not wait_for(client, "CONNACK"):
                        client.run_flag = False  # break no connack
                else:  # connect fails
                    client.run_flag = False  # break
                    print("quitting loop for  broker ", broker)

            client.loop(0.01)

            if client.connected_flag and loop_function:  # function to call
                loop_function(client, device_type, deviceid, loop_delay)  # call function ,ie pub

        time.sleep(1)
        print("disconnecting from", broker)
        if client.connected_flag:
            client.disconnect()
            client.connected_flag = False


    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            client.connected_flag = True  # set flag
            time.sleep(2)
            for c in clients:
                #print("connected ok")
                if client == c["client"]:
                    if c["type"] != "":
                        sub_topic = "demo/#"
                        client.subscribe(sub_topic)

                        print("connected OK",c["name"],c["device_mac"], "subscribe to", sub_topic)
        else:
            print("Bad connection Returned code=", rc)
            client.loop_stop()


    def on_message(client, userdata, message):
        print ("Topic: " + str(message.topic))
        print ("QoS: " + str(message.qos))
        print ("Payload: " + str(message.payload))

    def on_subscribe(client, obj, mid, granted_qos):
        print("Subscribed to Topic: " + 
        MQTT_SUBTOPIC + " with QoS: " + str(granted_qos))

    def on_disconnect(client, userdata, rc):
        client.connected_flag = False  # set flag
        # print("client disconnected ok")


    def on_publish(client, userdata, mid):
        print("In on_pub callback mid= ", mid)
        print("client is", client)


    def pub(client, device_type, device_mac, loop_delay):
        # set a default pub_topic
        pub_topic = "demo/"+device_type
        if device_mac == "0001":
            print("0001 device matched, you can put function here")
            pub_topic = "demo/"+"/"+device_type+"/"+deviceid
        
        if device_mac == "0002":
            print("0002 device matched, you can put function here")
            pub_topic = "demo/"+"/"+device_type+"/"+deviceid

        rmd_current = round(random.uniform(0.6, 50.0), 2)
        rmd_pressure = round(random.uniform(0.6, 50.0), 2)
        global init_time
        if time.time() - init_time >= 3600:
            rmd_mnc = round(random.uniform(5.0, 30.0), 2)
            rmd_sdc = round(random.random(), 2)
            rmd_mnp = round(random.uniform(5.0, 30.0), 2)
            rmd_sdp = round(random.random(), 2)

            client.publish(pub_topic,
                        '{"Current": "%s","Pressure": "%s","Str": "12341","Stp": "12340"}' % (rmd_current, rmd_pressure))
            client.publish(pub_topic,
                        '{"MnC": "%s", "SdC": "%s", "Str": "2554","Stp": "2554","MnP": "%s", "SdP": "%s"}' % (rmd_mnc, rmd_sdc, rmd_mnp, rmd_sdp))
            print("one hour reached, publish to %s done!" % pub_topic)
            init_time = time.time()
        else:
            client.publish(pub_topic, 
                        '{"Current": "%s","Pressure": "%s"}' % (rmd_current, rmd_pressure))
            print("publish to %s done!" % pub_topic)
        print(datetime.datetime.now())
        time.sleep(loop_delay)
        pass




    def Create_connections():
        for i in range(n_clients):
            cname = "client" + str(i)+"_"
            t = int(time.time())
            client_id = cname + str(t)  # create unique client_id
            client = mqtt.Client(client_id)  # create new instance
            clients[i]["client"] = client
            clients[i]["client_id"] = client_id
            clients[i]["cname"] = cname
            #clients[i]["index"] = i
            broker = clients[i]["broker"]
            port = clients[i]["port"]
            cacert = clients[i]["cacert"]
            certfile = clients[i]["certfile"]
            keyfile = clients[i]["keyfile"]
            device_name = clients[i]["device_name"]
            device_type = clients[i]["device_type"]
            device_mac = clients[i]["device_mac"]
            #token = clients[i]["token"]
            client.on_connect = on_connect
            client.on_disconnect = on_disconnect
            client.on_publish = on_publish
            client.on_message = on_message
            client.on_subscribe = on_subscribe
            t = threading.Thread(target=client_loop, args=(client, broker, port, cacert, certfile, keyfile, device_type, device_mac, pub, 300))
            threads.append(t)
            t.start()


    #Main function start here

    #multiple thread for each gateway device
    # read from database to form device list
    if __name__ == '__main__':
#    def __main__():        
        clients = []
        #each gateway/device defined as a clients object. ie clients[0].broker, clients[0].name ,etc
        for device in my_devices:
            device_info = {"broker": broker, "port": 8883, "cacert": cacert, "certfile": certfile, "keyfile": keyfile, "device_name": device["device_name"], "device_mac": device["device_mac"], "device_type": device["device_type"]}
            clients.append(device_info)
        # get gateway numbers
        n_clients = len(clients)

        mqtt.Client.connected_flag = False  # create flag in class
        mqtt.Client.bad_connection_flag = False  # create flag in class
        # each gateway/device connection clients have its own threads
        threads = []
        print("Creating Connections ")
        no_threads = threading.active_count()
        print("current threads =", no_threads)
        print("Publishing ")
        Create_connections()

        print("All clients connected ")
        no_threads = threading.active_count()
        print("current threads =", no_threads)
        print("starting main loop")
        # for 2 devices, expected threads been seen is 3.
        if no_threads > n_clients:
            max_no_threads = True

        try:
            while max_no_threads == True:           
                time.sleep(10)
                no_threads = threading.active_count()
                print("current threads now reach: ", no_threads)
                assert no_threads < too_many_threads
                for c in clients:
                    if not c["client"].connected_flag:
                        print("broker ", c["broker"], " is disconnected")

        except (KeyboardInterrupt,AssertionError):
            print("ending")
            for c in clients:
                c["client"].run_flag = False
        time.sleep(10)
    #*************

#client = mqttc.Client(clientID)
#client.on_connect = on_connect
#client.on_message = on_message
#client.tls_set(ca_certs=cacert, certfile=certfile, keyfile=keyfile, cert_reqs=ssl.CERT_REQUIRED, tls_version=ssl.PROTOCOL_TLSv1_2, ciphers=None)
#client.connect(broker, mqtt_port, keepalive)
"""