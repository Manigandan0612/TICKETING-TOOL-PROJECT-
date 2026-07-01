from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserProfile
from django.contrib.auth.models import User
from rest_framework import viewsets
from .serializers import UserAdminSerializer
from apps.accounts.permissions import IsAdminOnly


def get_user_role(user):
    if user.is_superuser:
        return 'ADMIN'
    profile = UserProfile.objects.filter(user=user).first()
    return profile.role if profile else None


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        role = get_user_role(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'role': role,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
            }
        })

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = get_user_role(user)

        return Response({
            'id': user.id,
            'username': user.username,
            'role': role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        })
    
class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminOnly]
