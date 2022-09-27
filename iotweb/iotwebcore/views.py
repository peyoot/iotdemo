from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from .forms import CustomerForm
from iotwebcore.models import IoTSite,SiteConfig
from json import dumps

# Create your views here.

def home(request):
    mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    return render(request,'index.html',{ 'mapbox_access_token': mapbox_access_token })

def comingsoon(request):
    return render(request,'comingsoon.html',{})

def testws(request):
    return render(request,'testwebsocket.html',{})

def temp(request):
    userid = request.session.get('_auth_user_id', None)
    username = request.user
    
    iotsites = []
    contexts = []
    result = list(IoTSite.objects.filter(user=1).all().values())
    #print("full list")
    for n in range(len(result)):
        iotsite_info = {'id':n, 'name': result[n]['name'],'longitude': result[n]['longitude'],'latitude':result[n]['latitude']}
        iotsites.append(iotsite_info)

    #print(iotsites)
    siteconfig =  list(SiteConfig.objects.filter(id=1).values('name','mapbox_access_token'))
    for m in range(len(siteconfig)):
        contexts_info = {'name':siteconfig[m]['name'],'token':siteconfig[m]['mapbox_access_token'],'iotsites':iotsites}
    contexts.append(contexts_info)
    #print(contexts)

    return TemplateResponse(request, 'temp.html',
                                {'contexts': contexts})

"""
    mylist = []
    result = list(IoTSite.objects.filter(user=1).all().values())
    #print("full list")
    for n in range(len(result)):
        site_info = {"name": result[n]['name'],"longitude": result[n]['longitude'],"latitude": result[n]['latitude']}
        mylist.append(site_info)
    return render(request,'temp.html',{'sitelist': mylist})
#    Just pass these as an entry of the dictionary in above, and then render it in template
#    return render(request,'temp.html',{'iotsite': site_info})
#    return render(request,'temp.html',{'user': {'uname': username, 'id': userid}})
"""

def about(request):
    submitted = False
    if request.method == "POST":
        form = CustomerForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect('about?submitted=True')
    else:
        form = CustomerForm
        if 'submitted' in request.GET:
            submitted = True

    return render(request,'about.html',{'form':form,'submitted':submitted})

def test2(request):
    mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    return render(request,'test2.html',{ 'mapbox_access_token': mapbox_access_token })

def map(request):
    mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    return render(request,'map.html',{ 'mapbox_access_token': mapbox_access_token })

def bttest(request):
    mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    return render(request,'bttest.html',{ 'mapbox_access_token': mapbox_access_token })
