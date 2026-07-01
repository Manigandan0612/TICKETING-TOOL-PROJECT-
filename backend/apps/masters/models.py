from django.db import models


class Module(models.Model):
    module_name = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.module_name


class SubModule(models.Model):
    module = models.ForeignKey(Module, on_delete=models.RESTRICT, related_name='submodules')
    submodule_name = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('module', 'submodule_name')
        ordering = ['module__module_name', 'submodule_name']

    def __str__(self):
        return f'{self.module.module_name} - {self.submodule_name}'


class ReportedTo(models.Model):
    person_name = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.person_name


class EmailConfig(models.Model):
    config_name = models.CharField(max_length=100, unique=True)
    from_email = models.EmailField()
    to_email = models.EmailField()
    cc_emails = models.TextField(blank=True, null=True, help_text='Comma separated emails')
    smtp_host = models.CharField(max_length=255)
    smtp_port = models.IntegerField(default=587)
    smtp_username = models.CharField(max_length=255)
    smtp_password = models.CharField(max_length=255)
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.config_name
    
class Department(models.Model):
    department_name = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.department_name
    
class Division(models.Model):
    division_name = models.CharField(max_length=200, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.division_name
    
class ReportedInFormOf(models.Model):
    name = models.CharField(max_length=150)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
