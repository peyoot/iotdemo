from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class SiteUser(AbstractUser):
    '''
    用户表
    '''
    phone_numbers = models.CharField(verbose_name='Mobile', unique=True,max_length=11, default='')
    company = models.CharField(verbose_name='Company',max_length=30,default='')
    def __str__(self):
        return self.username
