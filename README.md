<<<<<<< HEAD
# WAMIS Ticketing Tool

Starter implementation for the Tamil Nadu WAMIS internal ticketing workflow.

## Included
- Django + DRF backend
- PostgreSQL-ready settings
- React + Bootstrap frontend
- Roles: Admin, Department Admin, Support, Developer, Client, General
- Mandatory support decision: `Solved by Support` or `Moved to Development`
- Module/Submodule masters
- Multiple attachments
- Email escalation to development
- Excel export

## Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

## Main API routes
- `/api/auth/login/`
- `/api/auth/logout/`
- `/api/auth/me/`
- `/api/masters/modules/`
- `/api/masters/submodules/`
- `/api/masters/reported-to/`
- `/api/masters/email-configs/`
- `/api/tickets/`
- `/api/tickets/export_excel/`
- `/api/dashboard/summary/`

## Notes
- Developer role sees only tickets moved to development.
- Client role uses the read-only dashboard.
- Department Admin role uses the admin dashboard.
- General role is read-only and can see all tickets.
- Support ticket submission requires a support decision.
- If support decision is `Moved to Development`, an email config is required.
- Email body uses ticket description and subject uses ticket subject.
=======
c
>>>>>>> 3ecf8c179fef11610f89433013a90929ae75e382
