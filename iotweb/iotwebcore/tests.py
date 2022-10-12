import json
from unittest import result
from django.test import TestCase
from django.forms.models import model_to_dict
from iotwebcore.models import IoTSite, SiteConfig, IoTDevice
from django.contrib import auth
from members.models import SiteUser
from json import dumps
from django.http import HttpResponseRedirect,JsonResponse


#can use annotate or simple counts

# without annotate
#counts=IoTSite.objects.count()
"""
counts=IoTSite.objects.filter(user=2).count()
print("total records",counts)
print("all records here:")
for index in range(counts):
#read a single record
    num=index+1
    o=IoTSite.objects.get(id=num)
    record = model_to_dict(o)
    print(record)
"""
from django.db.models import Count
from django.core import serializers

#index = IoTSite.objects.annotate(Count('id'))
#print(index[0].name)
#print(index[0].id__count)

#result = SiteUser.objects.values('username').annotate(num_count=Count('username'))
"""
result = list(IoTSite.objects.filter(user=1).all().values())
print(result)
#print(result[0]['name'])
print("full list")
for n in range(len(result)):
    print(result[n]['name'],result[n]['longitude'],result[n]['latitude'])



mylist = []
result = list(IoTSite.objects.filter(user=1).all().values())
print(result)
print("full list")
for n in range(len(result)):
    site_info = {"name": result[n]['name'],"longitude": result[n]['longitude'],"latitude": result[n]['latitude']}
    mylist.append(site_info)
print(mylist)


sitelist = []
geometry = {}
properties = {}
coordinates = []    
result = list(IoTSite.objects.filter(user=1).all().values())
print(result)
print("sitelist is:")
for n in range(len(result)):
    site_info = {'id':n, 'name': result[n]['name'],'longitude': result[n]['longitude'],'latitude':result[n]['latitude']}
    sitelist.append(site_info)
print(sitelist)
    
print("site config is")
result = list(SiteConfig.objects.filter(id=1).values('name','mapbox_access_token'))
#result = SiteConfig.objects.get(id=1)
print(result)



iotsites = []
contexts = []
result = list(IoTSite.objects.filter(user=1).all().values())
#print("full list")
for n in range(len(result)):
    iotsite_info = {'id':n, 'name': result[n]['name'],'longitude': result[n]['longitude'],'latitude':result[n]['latitude']}
    iotsites.append(iotsite_info)

print(iotsites)
siteconfig =  list(SiteConfig.objects.filter(id=1).values('name','mapbox_access_token'))
for m in range(len(siteconfig)):
    contexts_info = {'name':siteconfig[m]['name'],'token':siteconfig[m]['mapbox_access_token'],'iotsites':iotsites}
contexts.append(contexts_info)
print(contexts)
#    return render(request,'temp.html',{ 'mapbox_access_token': mapbox_access_token, 'sitelist': sitelist })
#return TemplateResponse(request, 'temp.html',
#                            {'contexts': contexts})
dataJSON = dumps(contexts)
print("dumps in here:")
print (dataJSON)
"""

"""
config = SiteConfig.objects.get()

print(config.name)
print(config.mapbox_access_token)



solar_farms = []
result = list(IoTSite.objects.filter(user=1).all().values())

for n in range(len(result)):
    iotsite_info = {'id':n, 'name': result[n]['name'],'longitude': result[n]['longitude'],'latitude':result[n]['latitude']}
    solar_farms.append(iotsite_info)

print(solar_farms)
jsf = JsonResponse({"farms": solar_farms},
                            status=200)
print("jsonresponse:")
print(jsf)

if len(solar_farms) > 0:
        return JsonResponse({"farms": [solar_farm.to_json() for solar_farm
                                       in solar_farms]},
                            status=200)
    else:
        return JsonResponse({ID_ERROR_TITLE: NO_FARMS_TITLE,
                             ID_ERROR_MSG: NO_FARMS_MSG,
                             ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})
"""
PARAM_FARM_NAME = "Digi Solar Farm"
#solar_farm = IoTSite.objects().get('Site Name' == PARAM_FARM_NAME)
#gateways = list(IoTDevice.objects.filter(site_name = PARAM_FARM_NAME))
gateways = list(IoTDevice.objects.all().values())
print(gateways)

temp = json.dumps(gateways, ensure_ascii=False)   
print('json.dumps')  
print(temp) 
      