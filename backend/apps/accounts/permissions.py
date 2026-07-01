from rest_framework.permissions import BasePermission
from .models import UserProfile


def get_user_role(user):
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser:
        return 'ADMIN'
    profile = UserProfile.objects.filter(user=user).first()
    return profile.role if profile else None


class IsAnyRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminOrSupport(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ['ADMIN', 'DEPARTMENT_ADMIN', 'SUPPORT']


class IsAdminSupportDeveloper(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ['ADMIN', 'DEPARTMENT_ADMIN', 'SUPPORT', 'DEVELOPER']


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ['ADMIN', 'DEPARTMENT_ADMIN']
