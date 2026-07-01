from django.core.mail import EmailMessage, get_connection
from apps.tickets.models import EmailLog


def send_ticket_email(ticket):
    config = ticket.email_config

    if not config:
        raise ValueError(
            'Email configuration is required to send ticket to development.'
        )

    cc_list = [
        email.strip()
        for email in (config.cc_emails or '').split(',')
        if email.strip()
    ]

    connection = get_connection(
        host=config.smtp_host,
        port=config.smtp_port,
        username=config.smtp_username,
        password=config.smtp_password,
        use_tls=config.use_tls,
        use_ssl=config.use_ssl,
    )

    # MAIL BODY
    mail_body = f"""
Description:
{ticket.description}

Department: {ticket.department.department_name}

Division: {ticket.division_name}

Module: {ticket.module.module_name}

Sub Module: {ticket.submodule.submodule_name}

Bug Type: {ticket.bug_type or ''}

Subject:
{ticket.subject}
"""

    # Show User ID only if available
    if ticket.user_id_value:
        mail_body += f"""

User ID:
{ticket.user_id_value}
"""

    # Show Password only if available
    if ticket.user_password:
        mail_body += f"""

Password:
{ticket.user_password}
"""

    email = EmailMessage(
        subject=ticket.subject,
        body=mail_body,
        from_email=config.from_email,
        to=[config.to_email],
        cc=cc_list,
        connection=connection,
    )

    # Attach files
    for attachment in ticket.attachments.all():
        if attachment.file and attachment.file.path:
            email.attach_file(attachment.file.path)

    try:
        email.send(fail_silently=False)

        EmailLog.objects.create(
            ticket=ticket,
            from_email=config.from_email,
            to_email=config.to_email,
            cc_emails=config.cc_emails,
            mail_subject=ticket.subject,
            department=ticket.department,
            mail_body=mail_body,
            send_status='SUCCESS',
        )

    except Exception as exc:
        EmailLog.objects.create(
            ticket=ticket,
            from_email=config.from_email,
            to_email=config.to_email,
            cc_emails=config.cc_emails,
            mail_subject=ticket.subject,
            department=ticket.department,
            mail_body=mail_body,
            send_status='FAILED',
            error_message=str(exc),
        )

        raise
