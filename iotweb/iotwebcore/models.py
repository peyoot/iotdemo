from django.db import models
from django.contrib.auth.models import User


# Create your models here.
class CustomerInquiry(models.Model):
    company = models.CharField('公司',max_length=30)
    name = models.CharField('姓名',max_length=20)
    email = models.EmailField('Email')
    phone = models.CharField('电话',max_length=15)
    description = models.TextField('内容',blank=True)

    def __str__(self):
        return self.company