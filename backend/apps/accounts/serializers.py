from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserAdminSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(write_only=True, required=False)
    profile_role = serializers.CharField(source='userprofile.role', read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'is_active',
            'profile_role',
            'role',
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = data.pop('profile_role', None)
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'GENERAL')
        password = validated_data.pop('password', None)

        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_password('123456')
        user.save()

        UserProfile.objects.create(user=user, role=role)
        return user

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        profile, _ = UserProfile.objects.get_or_create(user=instance)
        if role:
            profile.role = role
            profile.save()

        return instance