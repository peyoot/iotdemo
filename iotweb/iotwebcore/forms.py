from django import forms
from django.forms import ModelForm
from .models import CustomerInquiry

# Create a customer inquiry form
class CustomerForm(ModelForm):
    class Meta:
        model = CustomerInquiry
        fields = ('company','name','email','phone','description')
        labels = {
            'company': '公司',
            'name': '姓名',
            'email': '电子邮件',
            'phone': '电话',
            'description': '内容',
        }

        widgets = {
            'company': forms.TextInput(attrs={'class':'form-control'}),
            'name': forms.TextInput(attrs={'class':'form-control'}),
            'email': forms.TextInput(attrs={'class':'form-control'}),
            'phone': forms.TextInput(attrs={'class':'form-control'}),
            'description': forms.TextInput(attrs={'class':'form-control'}),
        }
