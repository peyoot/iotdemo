from django.contrib import admin
from solo.admin import SingletonModelAdmin
from .models import SiteConfig
from .models import CustomerInquiry
from .models import SiteConfig
from .models import IoTSite
from .models import IoTDevice
from .models import NodeDevice

admin.site.register(CustomerInquiry)
#admin.site.register(SiteConfig)
admin.site.register(SiteConfig, SingletonModelAdmin)
admin.site.register(IoTSite)
admin.site.register(IoTDevice)
admin.site.register(NodeDevice)
# Register your models here.
