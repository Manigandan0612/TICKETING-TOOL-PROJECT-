from django.urls import path

from .views import (
    DepartmentListView,
    DivisionListView,
    ModuleListView,
    SubModuleListView,
    ReportedToListView,
    EmailConfigListView,
    ReportedInFormOfListView,

    DepartmentViewSet,
    DivisionViewSet,
    ModuleViewSet,
    SubModuleViewSet,
    ReportedToViewSet,
    ReportedInFormOfViewSet,
    EmailConfigViewSet,
)

urlpatterns = [

    # ============================
    # USER APIs
    # ============================

    path('departments/', DepartmentListView.as_view()),
    path('divisions/', DivisionListView.as_view()),
    path('modules/', ModuleListView.as_view()),
    path('submodules/', SubModuleListView.as_view()),
    path('reported-to/', ReportedToListView.as_view()),
    path('reported-in-form-of/', ReportedInFormOfListView.as_view()),
    path('email-configs/', EmailConfigListView.as_view()),


    # ============================
    # DEPARTMENTS ADMIN
    # ============================

    path(
        'departments-admin/',
        DepartmentViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'departments-admin/<int:pk>/',
        DepartmentViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # DIVISIONS ADMIN
    # ============================

    path(
        'divisions-admin/',
        DivisionViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'divisions-admin/<int:pk>/',
        DivisionViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # MODULES ADMIN
    # ============================

    path(
        'modules-admin/',
        ModuleViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'modules-admin/<int:pk>/',
        ModuleViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # SUBMODULES ADMIN
    # ============================

    path(
        'submodules-admin/',
        SubModuleViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'submodules-admin/<int:pk>/',
        SubModuleViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # REPORTED TO ADMIN
    # ============================

    path(
        'reported-to-admin/',
        ReportedToViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'reported-to-admin/<int:pk>/',
        ReportedToViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # REPORTED IN FORM OF ADMIN
    # ============================

    path(
        'reported-in-form-of-admin/',
        ReportedInFormOfViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'reported-in-form-of-admin/<int:pk>/',
        ReportedInFormOfViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),


    # ============================
    # EMAIL CONFIG ADMIN
    # ============================

    path(
        'email-configs-admin/',
        EmailConfigViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })
    ),

    path(
        'email-configs-admin/<int:pk>/',
        EmailConfigViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })
    ),
]