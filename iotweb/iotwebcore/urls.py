from django.urls import path
from . import views

urlpatterns = [
    path('',views.home,name='home'),
    path('testws',views.testws,name='testws'),
    path('about',views.about,name='about'),
    path('comingsoon',views.comingsoon,name='comingsoon'),
    path('test2',views.test2,name='test2'),
    path('map',views.map,name='map'),
    path('bttest',views.bttest,name='bttest'),
    path('ajax/get_solar_farms', views.get_solar_farms, name='get_solar_farms'),
]
