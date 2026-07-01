from django.contrib import admin
from .models import Division, Department, Module, SubModule, ReportedTo, EmailConfig

admin.site.register(Division)
admin.site.register(Department)
admin.site.register(Module)
admin.site.register(SubModule)
admin.site.register(ReportedTo)
admin.site.register(EmailConfig)
