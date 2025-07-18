from django.urls import path
from authentication import views

urlpatterns = [
    path("auth/login/", views.notion_login, name="notion_login"),
    path("auth/callback/", views.notion_callback, name="notion_callback"),
]
