from django.shortcuts import render,redirect
from django.http import HttpResponseRedirect,JsonResponse
from django.template.response import TemplateResponse
from .forms import CustomerForm
from iotwebcore.models import IoTSite,SiteConfig
import json
# from json import dumps

PARAM_FARM_ID = "id"
PARAM_FARM_NAME = "farm_name"
# Create your views here.
ID_ERROR = "error"
ID_ERROR_TITLE = "error_title"
ID_ERROR_MSG = "error_msg"
ID_ERROR_GUIDE = "error_guide"
NO_FARMS_TITLE = "No solar farms found."
NO_FARMS_MSG = "No solar farms have been added to your DRM account. "
SETUP_MODULES_GUIDE = "Please, verify with your account"

def home(request):
    siteconfig = SiteConfig.objects.get()
    #siteconfig =  list(SiteConfig.objects.filter(id=1).values('name','mapbox_access_token'))
    #for m in range(len(siteconfig)):
    #    contexts_info = {'name':siteconfig[m]['name'],'token':siteconfig[m]['mapbox_access_token']}
    #contexts.append(contexts_info)
    #mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    #return render(request,'index.html',{ 'mapbox_access_token': mapbox_access_token })
    if request.user.is_authenticated:
        if request.method == "GET":
            return TemplateResponse(request, 'map-portal.html',{ 'mapbox_access_token': siteconfig.mapbox_access_token})
    else:
        return render(request,'index.html',{ 'mapbox_access_token': siteconfig.mapbox_access_token})
 
def comingsoon(request):
    return render(request,'comingsoon.html',{})

def testws(request):
    return render(request,'testwebsocket.html',{})

def get_solar_farms(request):
    userid = request.session.get('_auth_user_id', None)
    username = request.user.get_username()
    authentication = request.user.is_authenticated
    solar_farms = []
    """
    if request.user.is_authenticated:
        if not request.is_ajax or request.method != "POST":
            return JsonResponse(
                {"error": "AJAX request must be sent using POST"},
                status=400)
    else:
        return redirect('/')
    """

    solar_farms = list(IoTSite.objects.filter(user=userid).all().values())

#    for n in range(len(result)):
#        iotsite_info = {'id':n, 'name': result[n]['name'],'longitude': result[n]['longitude'],'latitude':result[n]['latitude']}
#        solar_farms.append(iotsite_info)
    
    #siteconfig =  list(SiteConfig.objects.filter(id=1).values('name','mapbox_access_token'))
    #for m in range(len(siteconfig)):
    #    contexts_info = {'name':siteconfig[m]['name'],'token':siteconfig[m]['mapbox_access_token'],'iotsites':iotsites}
    #contexts.append(contexts_info)
    #print(contexts)

    #return TemplateResponse(request, 'temp.html',
    #                            {'contexts': contexts})
    #test1 = json.dumps(solar_farms)
    if len(solar_farms) > 0:
        #return JsonResponse({"farms": solar_farms},status=200)
        #for solar_farm in solar_farms:
        #    test_json = json.dumps(solar_farm)
        #test_dict={"farms": [solar_farm for solar_farm in solar_farms]}
        return JsonResponse({"farms": [solar_farm for solar_farm in solar_farms]},status=200)
    else:
        return JsonResponse({ID_ERROR_TITLE: NO_FARMS_TITLE,
                             ID_ERROR_MSG: NO_FARMS_MSG,
                             ID_ERROR_GUIDE: SETUP_MODULES_GUIDE})

    



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


def dashboard(request):
    if not request_has_params(request):
        return redirect("/")


    if request.user.is_authenticated:
        if request.method == "GET":
            return TemplateResponse(request, 'dashboard.html',
                                    get_request_data(request))
    else:
        return redirect("members/login_user")


def get_request_data(request):
    """
    Gets the request data and saves it in a dictionary to be distributed as
    context variables.

    Args:
        request (:class:`.WSGIRequest`): The request to get the data from.

    Returns:
        dic: A dictionary containing the context variables.
    """
    data = {}
    if request_has_id(request):
        data[PARAM_FARM_ID] = request.GET[PARAM_FARM_ID]
    if request_has_name(request):
        data[PARAM_FARM_NAME] = request.GET[PARAM_FARM_NAME]
    return data

def request_has_id(request):
    """
    Returns whether the request has the 'controller_id' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (PARAM_FARM_ID in request.GET
            and request.GET[PARAM_FARM_ID] is not None)


def request_has_name(request):
    """
    Returns whether the request has the 'farm_name' parameter.

    Returns:
        `True` if the request has the parameter, `False` otherwise.
    """
    return (PARAM_FARM_NAME in request.GET
            and request.GET[PARAM_FARM_NAME] is not None)


def request_has_params(request):
    """
    Returns whether the request has the required parameters.

    Returns:
        `True` if the request has the required parameters, `False` otherwise.
    """
    return request_has_id(request) and request_has_name(request)
