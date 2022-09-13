from django.shortcuts import render
from django.http import HttpResponseRedirect
from .forms import CustomerForm

# Create your views here.

def home(request):
    mapbox_access_token = 'pk.eyJ1IjoicGV5b290IiwiYSI6ImNsNXFxdnpwdzIwNnkzaXE5cXB5OGpjYzIifQ.a6yMgV25ozwagcciK7vDtA'
    return render(request,'index.html',{ 'mapbox_access_token': mapbox_access_token })

def comingsoon(request):
    return render(request,'comingsoon.html',{})

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


def bttest(request):
    return render(request,'bttest.html',{})