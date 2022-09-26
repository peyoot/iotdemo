from django.test import TestCase
from django.forms.models import model_to_dict
from iotwebcore.models import IoTSite
from django.contrib import auth
from members.models import SiteUser

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
"""

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
    
#    print("now is",n,"longitude",longitude,"latitude",latitude)
