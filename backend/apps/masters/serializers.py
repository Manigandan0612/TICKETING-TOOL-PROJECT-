from rest_framework import serializers
from .models import Department, Division, Module, SubModule, ReportedTo, EmailConfig, ReportedInFormOf


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class DivisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Division
        fields = '__all__'


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = '__all__'


class SubModuleSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(
        source='module.module_name',
        read_only=True
    )

    class Meta:
        model = SubModule
        fields = '__all__'


class ReportedToSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportedTo
        fields = '__all__'


class EmailConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailConfig
        exclude = ['smtp_password']


class EmailConfigWriteSerializer(serializers.ModelSerializer):
    smtp_password = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = EmailConfig
        fields = '__all__'

    def update(self, instance, validated_data):
        smtp_password = validated_data.pop('smtp_password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if smtp_password:
            instance.smtp_password = smtp_password

        instance.save()
        return instance
    

class ReportedInFormOfSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportedInFormOf
        fields = '__all__'