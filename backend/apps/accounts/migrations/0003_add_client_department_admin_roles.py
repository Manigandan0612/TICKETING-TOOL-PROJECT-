from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_alter_userprofile_role_alter_userprofile_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='role',
            field=models.CharField(
                choices=[
                    ('ADMIN', 'ADMIN'),
                    ('DEPARTMENT_ADMIN', 'DEPARTMENT ADMIN'),
                    ('SUPPORT', 'SUPPORT'),
                    ('DEVELOPER', 'DEVELOPER'),
                    ('CLIENT', 'CLIENT'),
                    ('GENERAL', 'GENERAL'),
                ],
                max_length=20,
            ),
        ),
    ]
