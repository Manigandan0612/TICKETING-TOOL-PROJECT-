from django.db import models
from apps.masters.models import (
    EmailConfig,
    Module,
    ReportedTo,
    SubModule
)


class Ticket(models.Model):

    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Resolved by Support', 'Resolved by Support'),
        ('Sent to Developer', 'Sent to Developer'),
        ('Developer In Progress', 'Developer In Progress'),
        ('Closed', 'Closed'),
        ('Reopened', 'Reopened'),
    ]

    SUPPORT_DECISION_CHOICES = [
        ('Solved by Support', 'Solved by Support'),
        ('Moved to Development', 'Moved to Development'),
    ]

    ticket_id = models.CharField(
        max_length=30,
        unique=True,
        blank=True
    )

    department = models.ForeignKey(
        'masters.Department',
        on_delete=models.RESTRICT
    )

    division_name = models.CharField(max_length=200)

    module = models.ForeignKey(
        Module,
        on_delete=models.RESTRICT
    )

    submodule = models.ForeignKey(
        SubModule,
        on_delete=models.RESTRICT
    )

    subject = models.CharField(max_length=300)

    description = models.TextField()

    user_id_value = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    user_password = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    bug_type = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    reported_to = models.ForeignKey(
        ReportedTo,
        on_delete=models.RESTRICT
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='Medium'
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='Open'
    )

    support_decision = models.CharField(
        max_length=30,
        choices=SUPPORT_DECISION_CHOICES
    )

    is_sent_to_developer = models.BooleanField(default=False)

    email_config = models.ForeignKey(
        EmailConfig,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    support_remark = models.TextField(
        blank=True,
        null=True
    )

    developer_remark = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    closed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):

        if not self.ticket_id:

            from datetime import datetime

            last_ticket = Ticket.objects.order_by('-id').first()

            next_number = 1

            if last_ticket:
                next_number = last_ticket.id + 1

            self.ticket_id = (
                f"WAMIS-{datetime.now().strftime('%Y%m%d')}-{next_number:03d}"
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.ticket_id


class TicketAttachment(models.Model):

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='attachments'
    )

    department = models.ForeignKey(
        'masters.Department',
        on_delete=models.RESTRICT
    )

    file = models.FileField(upload_to='ticket_attachments/')

    original_file_name = models.CharField(max_length=500)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.original_file_name


class EmailLog(models.Model):

    SEND_STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='email_logs'
    )

    from_email = models.EmailField()

    to_email = models.EmailField()

    cc_emails = models.TextField(
        blank=True,
        null=True
    )

    mail_subject = models.CharField(max_length=300)

    mail_body = models.TextField()

    send_status = models.CharField(
        max_length=20,
        choices=SEND_STATUS_CHOICES
    )

    error_message = models.TextField(
        blank=True,
        null=True
    )

    sent_at = models.DateTimeField(auto_now_add=True)

    department = models.ForeignKey(
        'masters.Department',
        on_delete=models.RESTRICT
    )


class Division(models.Model):

    division_name = models.CharField(
        max_length=200,
        unique=True
    )

    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.division_name