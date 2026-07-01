from django.utils import timezone
from .models import Ticket


def generate_ticket_id():
    today = timezone.localdate()
    prefix = f'WAMIS-{today.strftime("%Y%m%d")}-'
    count = Ticket.objects.filter(ticket_id__startswith=prefix).count() + 1
    return f'{prefix}{count:03d}'
