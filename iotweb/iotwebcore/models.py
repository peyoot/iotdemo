from django.db import models
#from django.contrib.auth.models import User
from members.models import SiteUser
#from django.forms import ValidationError
from solo.models import SingletonModel

# Create your models here.
class SiteConfig(SingletonModel):
    name = models.CharField('Name',max_length=120)
    mapbox_access_token = models.CharField('Mapbox Token',max_length=100)
    class Meta:
        verbose_name = 'Site Config'
        
    def __str__(self):
        return self.name

#    def has_add_permission(self, request):
#        return False if self.model.objects.count() > 0 else super().has_add_permission(request)


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
# when enable_autolist, the webapp will receive devicelist topic and add it to gateway list

DEFAULT_LOCATION = (110, 37)  #ningxia province
DEFAULT_TYPE = ('SolarFarm','solarfarm')

IOT_TYPE = (
            ('SolarFarm','Solar Farm'),
            ('Factory','Factory')
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
    """capacity for solarfarm is capacity, for other site is gateway number
    """
    name = models.CharField('Site Name', default='demo', max_length=100)
    iot_type = models.CharField(choices=IOT_TYPE,max_length=10)
    user = models.ForeignKey(SiteUser, on_delete=models.CASCADE, blank=True, null=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    capacity = models.IntegerField()
    enable_autolist = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        managed = True
        verbose_name = 'IoT Site'
        verbose_name_plural = 'IoT Sites'


class IoTDevice(models.Model):
    device_name = models.CharField('device_name',max_length=100)
    device_type = models.CharField(choices=DEVICE_TYPE,max_length=10)
    device_mac = models.CharField('device_mac',max_length=100)
    site_name = models.ForeignKey(IoTSite, on_delete=models.CASCADE, verbose_name='IoT Site')
    row = models.IntegerField(default=1,verbose_name="row")
    col = models.IntegerField(default=1,verbose_name="column")
    Lat_offset = models.IntegerField(default=0)
    lon_offset = models.IntegerField(default=0)

    def __str__(self):
        return self.device_name

    
    class Meta:
        managed = True
        verbose_name = 'IoT Gateway'
        verbose_name_plural = 'IoT Gateways'

class NodeDevice(models.Model):
    node_name = models.CharField('device_name',max_length=100)
    node_type = models.CharField(choices=NODE_TYPE,max_length=10)
    gateway_mac = models.ForeignKey(IoTDevice, on_delete=models.CASCADE,verbose_name='gateway')
    row = models.IntegerField(default=1,verbose_name="row")
    col = models.IntegerField(default=1,verbose_name="column")
    Lat_offset = models.IntegerField(default=0)
    lon_offset = models.IntegerField(default=0)


    def __str__(self):
        return self.node_name

    class Meta:
        managed = True
        verbose_name = 'Node Device'
        verbose_name_plural = 'Node Devices'

# col,row,offset are to set the array display place on map, col/row*0.001, offset*0.0001