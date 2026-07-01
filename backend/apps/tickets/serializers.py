from rest_framework import serializers
from .models import Ticket, TicketAttachment


class TicketAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TicketAttachment
        fields = [
            'id',
            'original_file_name',
            'file_url',
            'uploaded_at'
        ]

    def get_file_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                obj.file.url
            )
        return obj.file.url


class TicketSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.department_name',
        read_only=True
    )

    module_name = serializers.CharField(
        source='module.module_name',
        read_only=True
    )

    submodule_name = serializers.CharField(
        source='submodule.submodule_name',
        read_only=True
    )

    reported_to_name = serializers.CharField(
        source='reported_to.person_name',
        read_only=True
    )

    attachments = TicketAttachmentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['ticket_id']
        