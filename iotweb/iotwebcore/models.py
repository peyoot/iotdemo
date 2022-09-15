from django.db import models
#from django.contrib.auth.models import User
from members.models import SiteUser


# Create your models here.
# web inquery
class CustomerInquiry(models.Model):
    company = models.CharField('公司',max_length=30)
    name = models.CharField('姓名',max_length=20)
    email = models.EmailField('Email')
    phone = models.CharField('电话',max_length=15)
    description = models.TextField('内容',blank=True)

    def __str__(self):
        return self.company
    
# iotsite,each iotsite have at least a gateway or iotdevice with network capability to do mqtt stuff
# prefix are reserved for DRM, not implement at this time
#SOLAR_FARM_PREFIX = "solar-"

DEFAULT_LOCATION = (110, 37)  #ningxia province

IOT_TYPE = (
            ('SolarFarm','solarfarm'),
            ('Factory','factory')
            )
DEVICE_TYPE = (
            ('GATEWAY','gateway'),
            ('DEVICE','device'),
            ('NODE','Node')
            )

NODE_TYPE = (
            ('XBEE','xbee'),
            ('SERIAL','serial')
            )

class IoTSite(models.Model):
    name = models.CharField('site_name',max_length=100)
    iot_type = models.CharField(choices=IOT_TYPE,max_length=10)
    user = models.ForeignKey(SiteUser, on_delete=models.CASCADE, blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()


    def __init__(self, name):
        """
        Class constructor. Instantiates a new ``SolarFarm``.

        Args:
            name (String): The name of the solar farm.
        """
        self._name = name
        self._user = user
        self._location = (latitude,longitude)
        self._iottype = iot_type
        self._devices = []

    @property
    def name(self):
        """
        Returns the name of the smart farm.

        Returns:
             String: The name of the smart farm.
        """
        return self._name

    @property
    def location(self):
        """
        Returns the geo-location of the smart farm.

        Returns:
             Tuple: Tuple containing the latitude and longitude coordinates of
                the smart farm.
        """
        return self._location

    @location.setter
    def location(self, location):
        """
        Sets the location of the smart farm.

        Args:
            location (Tuple): Tuple containing the latitude and longitude
                coordinates of the smart farm.
        """
        self._location = location

    @property
    def iottype(self):
        """
        Returns the iot type

        Returns:
            charfield
        """
        return self._iottype

    @iottype.setter
    def iottype(self, iot_type):
        """
       
        Returns the iot type

        Returns:
            charfield
        """
        self._iottype = iot_type

    @property
    def devices(self):
        """
        Returns the list of devices (XBee Gateways or smart devices) that are part of the iot site.

        Returns:
            List : List of :class:`.Device` that are part of the iot site.
        """
        return self._devices

    @devices.setter
    def devices(self, devices):
        """
        Sets the list of devices that are part of the iot site.

        Args:
            devices (List): List of device IDs that are part of the iot site.
        """
        self._devices = devices

    def add_device(self, device):
        """
        Adds the given device to the list of devices of the iot site.

        Args:
            device (String): The device ID to add to the list.
        """
        if self._devices is None:
            self._devices = []
        self._devices.append(device)

class IoTDevice(models.Model):
    device_name = models.CharField('device_name',max_length=100)
    device_type = models.CharField(choices=DEVICE_TYPE,max_length=10)
    device_mac = models.CharField('device_mac',max_length=100)
    site_name = models.ForeignKey(IoTSite, on_delete=models.CASCADE, verbose_name='IoT Site')
    row = models.IntegerField(default=1,verbose_name="row")
    col = models.IntegerField(default=1,verbose_name="column")
    Lat_offset = models.IntegerField(default=0)
    lon_offset = models.IntegerField(default=0)


    def __init__(self, device_name):
        """
        Class constructor. Instantiates a new ``IotDevice``.

        Args:
            name (String): The name of the IoTDevice.
        """
        self._name = device_name
        self._type = device_type
        self._mac = device_mac
        self._main_controller = None
        self._online = False

class NodeDevice(models.Model):
    node_name = models.CharField('device_name',max_length=100)
    node_type = models.CharField(choices=NODE_TYPE,max_length=10)
    gateway_mac = models.ForeignKey(IoTDevice, on_delete=models.CASCADE,verbose_name='gateway')
    row = models.IntegerField(default=1,verbose_name="row")
    col = models.IntegerField(default=1,verbose_name="column")
    Lat_offset = models.IntegerField(default=0)
    lon_offset = models.IntegerField(default=0)


    def __init__(self, node_name):
        """
        Class constructor. Instantiates a new ``Node Device``.

        Args:
            name (String): The name of the Node Device.
        """
        self._name = node_name
        self._type = node_type
        self._gateway = gateway_mac
        self._mac = node_mac
        self._online = False


# col,row,offset are to set the array display place on map, col/row*0.001, offset*0.0001