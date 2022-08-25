from django.urls import path
from . import views

urlpatterns = [
    path('',views.home,name='home'),
    path('about',views.about,name='about'),
    path('comingsoon',views.comingsoon,name='comingsoon'),
    path('test2',views.test2,name='test2'),
    path('bttest',views.bttest,name='bttest'),
]
