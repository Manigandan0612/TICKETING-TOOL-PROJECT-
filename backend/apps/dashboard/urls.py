from django.urls import path
from .views import DashboardSummaryView, ModuleWiseView, StatusWiseView, SubmoduleWiseView

urlpatterns = [
    path('summary/', DashboardSummaryView.as_view()),
    path('status-wise/', StatusWiseView.as_view()),
    path('module-wise/', ModuleWiseView.as_view()),
    path('submodule-wise/', SubmoduleWiseView.as_view()),
]
