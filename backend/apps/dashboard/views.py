from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsAnyRole, get_user_role
from apps.tickets.models import Ticket


class DashboardSummaryView(APIView):
    permission_classes = [IsAnyRole]

    def get(self, request):
        role = get_user_role(request.user)

        if role == 'DEVELOPER':
            developer_queryset = Ticket.objects.filter(is_sent_to_developer=True)

            data = {
                'total': developer_queryset.count(),
                'open': developer_queryset.filter(
                    status__in=['Sent to Developer', 'Developer In Progress']
                ).count(),
                'reopened': developer_queryset.filter(status='Reopened').count(),
                'closed': developer_queryset.filter(status='Closed').count(),
            }
            return Response(data)

        qs = Ticket.objects.all()

        data = {
            'total': qs.count(),
            'open': qs.filter(status='Open').count(),
            'in_progress': qs.filter(status='In Progress').count(),
            'resolved_by_support': qs.filter(status='Resolved by Support').count(),
            'sent_to_developer': qs.filter(status='Sent to Developer').count(),
            'developer_in_progress': qs.filter(status='Developer In Progress').count(),
            'closed': qs.filter(status='Closed').count(),
            'reopened': qs.filter(status='Reopened').count(),
        }

        return Response(data)


class GroupedCountView(APIView):
    permission_classes = [IsAnyRole]
    field = ''

    def get_queryset(self, request):
        qs = Ticket.objects.select_related('module', 'submodule')
        role = get_user_role(request.user)

        if role == 'DEVELOPER':
            return qs.filter(is_sent_to_developer=True)

        return qs

    def get(self, request):
        qs = self.get_queryset(request)
        counts = qs.values(self.field).annotate(count=Count('id')).order_by('-count')
        return Response(list(counts))


class StatusWiseView(GroupedCountView):
    field = 'status'


class ModuleWiseView(GroupedCountView):
    field = 'module__module_name'


class SubmoduleWiseView(GroupedCountView):
    field = 'submodule__submodule_name'