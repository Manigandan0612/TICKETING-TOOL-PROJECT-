from django.contrib import admin
from .models import EmailLog, Ticket, TicketAttachment

admin.site.register(Ticket)
admin.site.register(TicketAttachment)
admin.site.register(EmailLog)
