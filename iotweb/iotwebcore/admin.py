from django.contrib import admin
from .models import CustomerInquiry
from .models import IoTSite
from .models import IoTDevice
from .models import NodeDevice

admin.site.register(CustomerInquiry)
admin.site.register(IoTSite)
admin.site.register(IoTDevice)
admin.site.register(NodeDevice)
# Register your models here.
