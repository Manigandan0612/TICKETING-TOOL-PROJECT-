from django.http import HttpResponse
from openpyxl import Workbook

from rest_framework import status, viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from apps.notifications.services import send_ticket_email
from apps.accounts.permissions import (
    IsAnyRole,
    IsAdminOrSupport,
    IsAdminSupportDeveloper,
    get_user_role,
)

from .models import Ticket, TicketAttachment
from .serializers import (
    TicketSerializer,
    TicketAttachmentSerializer
)
from .utils import generate_ticket_id


@method_decorator(csrf_exempt, name='dispatch')
class TicketViewSet(viewsets.ModelViewSet):

    serializer_class = TicketSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    filterset_fields = [
        'department',
        'module',
        'submodule',
        'status',
        'support_decision',
        'reported_to',
        'is_sent_to_developer'
    ]

    search_fields = [
        'ticket_id',
        'subject',
        'description',
        'user_id_value',
        'division_name',
        'status',
        'bug_type',
        'module__module_name',
        'submodule__submodule_name',
        'department__department_name'
    ]

    ordering_fields = [
        'created_at',
        'updated_at',
        'ticket_id',
        'status'
    ]

    # --------------------------------
    # PERMISSIONS
    # --------------------------------
    def get_permissions(self):

        if self.action in [
            'create',
            'update',
            'partial_update',
            'resolve_support',
            'send_to_developer',
            'add_attachment'
        ]:
            return [IsAdminOrSupport()]

        if self.action in [
            'developer_update'
        ]:
            return [IsAdminSupportDeveloper()]

        return [IsAnyRole()]

    # --------------------------------
    # QUERYSET + FILTERS
    # --------------------------------
    def get_queryset(self):

        qs = Ticket.objects.select_related(
            'department',
            'module',
            'submodule',
            'reported_to',
            'email_config'
        ).prefetch_related(
            'attachments',
            'email_logs'
        )

        role = get_user_role(
            self.request.user
        )

        if role == 'DEVELOPER':
            qs = qs.filter(
                is_sent_to_developer=True
            )

        # -----------------------------
        # QUERY PARAMS
        # -----------------------------
        ticket_id = self.request.query_params.get(
            'ticket_id'
        )

        department_param = self.request.query_params.get(
            'department'
        )

        division_param = self.request.query_params.get(
            'division'
        )

        module_param = self.request.query_params.get(
            'module'
        )

        submodule_param = self.request.query_params.get(
            'submodule'
        )

        subject = self.request.query_params.get(
            'subject'
        )

        status_search = self.request.query_params.get(
            'status'
        )

        bug_type = self.request.query_params.get(
            'bug_type'
        )

        created_from = self.request.query_params.get(
            'created_from'
        )

        closed_from = self.request.query_params.get(
            'closed_from'
        )

        # --------------------------------
        # FILTERS
        # --------------------------------

        # Ticket ID
        if ticket_id:
            qs = qs.filter(
                ticket_id__icontains=ticket_id
            )

        # Department
        if department_param:
            qs = qs.filter(
                department_id=department_param
            )

        # Division
        if division_param:
            qs = qs.filter(
                division_name__icontains=division_param
            )

        # Module
        if module_param:
            qs = qs.filter(
                module_id=module_param
            )

        # Submodule
        if submodule_param:
            qs = qs.filter(
                submodule_id=submodule_param
            )

        # Subject
        if subject:
            qs = qs.filter(
                subject__icontains=subject
            )

        # Status
        if status_search:
            qs = qs.filter(
                status=status_search
            )

        # Bug Type
        if bug_type:
            qs = qs.filter(
                bug_type__icontains=bug_type
            )

        # -----------------------------
        # DATE FILTERS
        # ONLY 2 DATES
        # -----------------------------

        # If both dates are provided, treat them as a created-date range.
        if created_from and closed_from:
            qs = qs.filter(
                created_at__date__range=[
                    created_from,
                    closed_from
                ]
            )

        # If only first date is provided, filter by created date.
        elif created_from:
            qs = qs.filter(
                created_at__date=created_from
            )

        # If only second date is provided, filter by closed date.
        elif closed_from:
            qs = qs.filter(
                closed_at__date=closed_from
            )

        return qs.order_by('-id')

    # --------------------------------
    # CREATE TICKET
    # --------------------------------
    def perform_create(
        self,
        serializer
    ):

        support_decision = (
            serializer.validated_data.get(
                'support_decision'
            )
        )

        if support_decision == (
            'Solved by Support'
        ):

            ticket = serializer.save(
                ticket_id=generate_ticket_id(),
                status='Resolved by Support',
                is_sent_to_developer=False
            )

        elif support_decision == (
            'Moved to Development'
        ):

            ticket = serializer.save(
                ticket_id=generate_ticket_id(),
                status='Sent to Developer',
                is_sent_to_developer=True
            )

        else:
            ticket = serializer.save(
                ticket_id=generate_ticket_id(),
                status='Open',
                is_sent_to_developer=False
            )

        files = self.request.FILES.getlist(
            'attachments'
        )

        for upload in files:
            TicketAttachment.objects.create(
                ticket=ticket,
                department=ticket.department,
                file=upload,
                original_file_name=upload.name
            )

    # --------------------------------
    # RESOLVE SUPPORT
    # --------------------------------
    @action(
        detail=True,
        methods=['post']
    )
    def resolve_support(
        self,
        request,
        pk=None
    ):

        ticket = self.get_object()

        ticket.support_decision = (
            'Solved by Support'
        )

        ticket.status = (
            'Resolved by Support'
        )

        ticket.is_sent_to_developer = False

        ticket.support_remark = (
            request.data.get(
                'support_remark',
                ticket.support_remark
            )
        )

        ticket.save()

        return Response(
            self.get_serializer(
                ticket
            ).data
        )

    # --------------------------------
    # SEND TO DEVELOPER
    # --------------------------------
    @action(
        detail=True,
        methods=['post']
    )
    def send_to_developer(
        self,
        request,
        pk=None
    ):

        ticket = self.get_object()

        if request.data.get(
            'email_config'
        ):
            ticket.email_config_id = (
                request.data[
                    'email_config'
                ]
            )

        if not ticket.email_config:
            return Response(
                {
                    'detail':
                    'Email configuration is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.support_decision = (
            'Moved to Development'
        )

        ticket.status = (
            'Sent to Developer'
        )

        ticket.is_sent_to_developer = True

        ticket.support_remark = (
            request.data.get(
                'support_remark',
                ticket.support_remark
            )
        )

        ticket.save()

        try:
            send_ticket_email(ticket)

        except Exception as e:
            print(
                'Email sending failed:',
                e
            )

        return Response(
            self.get_serializer(
                ticket
            ).data
        )

    # --------------------------------
    # DEVELOPER UPDATE
    # --------------------------------
    @action(
        detail=True,
        methods=['post']
    )
    def developer_update(
        self,
        request,
        pk=None
    ):

        ticket = self.get_object()

        role = get_user_role(
            request.user
        )

        if role not in [
            'ADMIN',
            'DEVELOPER'
        ]:
            return Response(
                {
                    'detail':
                    'Not allowed.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = (
            request.data.get(
                'status',
                ticket.status
            )
        )

        ticket.developer_remark = (
            request.data.get(
                'developer_remark',
                ticket.developer_remark
            )
        )

        ticket.status = new_status

        if new_status == 'Closed':
            ticket.closed_at = (
                timezone.now()
            )
        else:
            ticket.closed_at = None

        ticket.save()

        return Response(
            self.get_serializer(
                ticket
            ).data
        )

    # --------------------------------
    # ADD ATTACHMENT
    # --------------------------------
    @action(
        detail=True,
        methods=['post']
    )
    def add_attachment(
        self,
        request,
        pk=None
    ):

        ticket = self.get_object()

        files = request.FILES.getlist(
            'files'
        )

        created = []

        for upload in files:

            attachment = (
                TicketAttachment.objects.create(
                    ticket=ticket,
                    department=ticket.department,
                    file=upload,
                    original_file_name=upload.name
                )
            )

            created.append(
                attachment
            )

        serializer = (
            TicketAttachmentSerializer(
                created,
                many=True,
                context={
                    'request':
                    request
                }
            )
        )

        return Response(
            serializer.data
        )

    # --------------------------------
    # EXPORT EXCEL
    # --------------------------------
    @action(
        detail=False,
        methods=['get']
    )
    def export_excel(
        self,
        request
    ):

        queryset = (
            self.filter_queryset(
                self.get_queryset()
            )
        )

        wb = Workbook()
        ws = wb.active
        ws.title = 'Tickets'

        headers = [
            'Ticket ID',
            'Department',
            'Division',
            'Module',
            'Submodule',
            'Bug Type',
            'Subject',
            'Status',
            'Created At',
            'Closed At'
        ]

        ws.append(headers)

        for ticket in queryset:

            ws.append([
                ticket.ticket_id,

                ticket.department.department_name
                if ticket.department
                else '',

                ticket.division_name or '',

                ticket.module.module_name
                if ticket.module
                else '',

                ticket.submodule.submodule_name
                if ticket.submodule
                else '',

                ticket.bug_type or '',

                ticket.subject,

                ticket.status,

                ticket.created_at.strftime(
                    '%d-%m-%Y'
                )
                if ticket.created_at
                else '',

                ticket.closed_at.strftime(
                    '%d-%m-%Y'
                )
                if ticket.closed_at
                else '',
            ])

        response = HttpResponse(
            content_type=(
                'application/'
                'vnd.openxmlformats-'
                'officedocument.'
                'spreadsheetml.sheet'
            )
        )

        response[
            'Content-Disposition'
        ] = (
            'attachment; '
            'filename="tickets.xlsx"'
        )

        wb.save(response)

        return response
