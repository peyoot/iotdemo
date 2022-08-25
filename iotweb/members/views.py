from django.shortcuts import render,redirect
from django.contrib.auth import authenticate,login,logout,get_user_model
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from .forms import RegisterUserForm

User = get_user_model()

# Create your views here.
def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request,username=username,password=password)
        if user is not None:
            login(request,user)
            return redirect('home')
            
        else:
            messages.success(request,("There's an error,Try again"))
            return redirect('login')


    return render(request,'authenticate/login.html',{})

def logout_user(request):
    logout(request)
    messages.success(request,("You were logged out"))
    return redirect('home')

def register_user(request):
    if request.method == "POST":
        form = RegisterUserForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']  
            password = form.cleaned_data['password1']
            user = authenticate(username=username,password=password)
            login(request,user)
            messages.success(request,("注册成功！"))
            return redirect('home')
    else:
        form = RegisterUserForm()
    return render(request,'authenticate/register_user.html',{'form':form,})