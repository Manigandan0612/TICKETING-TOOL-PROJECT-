import AppNavbar from '../../components/AppNavbar';
import MasterCrudPage from '../../components/admin/MasterCrudPage';
import UsersAdminSection from '../../components/admin/UsersAdminSection';

export default function AdminDashboard() {
  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <h2 className="mb-4">Admin Dashboard</h2>

        <UsersAdminSection />

        <MasterCrudPage
          title="Departments"
          apiPath="/masters/departments-admin/"
          primaryField="Department Name"
          fields={[
            { name: 'department_name', label: 'Department Name' },
            { name: 'is_active', label: 'Is Active' },
          ]}
        />

        <MasterCrudPage
          title="Divisions"
          apiPath="/masters/divisions-admin/"
          primaryField="Division Name"
          fields={[
            { name: 'division_name', label: 'Division Name' },
            { name: 'is_active', label: 'Is Active' },
          ]}
        />

        <MasterCrudPage
          title="Modules"
          apiPath="/masters/modules-admin/"
          primaryField="Module Name"
          fields={[
            { name: 'module_name', label: 'Module Name' },
            { name: 'is_active', label: 'Is Active' },
          ]}
        />

        <MasterCrudPage
            title="Sub Modules"
            apiPath="/masters/submodules-admin/"
            primaryField="Submodule Name"
            displayField="submodule_name"
            fields={[
              {
                name: 'module',
                label: 'Module',
                displayName: 'module_name'
              },
              {
                name: 'submodule_name',
                label: 'Submodule Name'
              },
              {
                name: 'is_active',
                label: 'Is Active'
              },
            ]}
          />

        <MasterCrudPage
          title="Reported To"
          apiPath="/masters/reported-to-admin/"
          primaryField="Person Name"
          fields={[
            { name: 'person_name', label: 'Person Name' },
            { name: 'email', label: 'Email' },
            { name: 'is_active', label: 'Is Active' },
          ]}
        />

        <MasterCrudPage
          title="Email Configs"
          apiPath="/masters/email-configs-admin/"
          primaryField="Config Name"
          fields={[
            { name: 'config_name', label: 'Config Name' },
            { name: 'from_email', label: 'From Email' },
            { name: 'to_email', label: 'To Email' },
            { name: 'cc_emails', label: 'CC Emails' },
            { name: 'smtp_host', label: 'SMTP Host' },
            { name: 'smtp_port', label: 'SMTP Port' },
            { name: 'smtp_username', label: 'SMTP Username' },
            { name: 'smtp_password', label: 'SMTP Password' },
            { name: 'use_tls', label: 'Use TLS' },
            { name: 'use_ssl', label: 'Use SSL' },
            { name: 'is_active', label: 'Is Active' },
          ]}
        />

        <MasterCrudPage
            title="Reported In Form Of"
            apiPath="/masters/reported-in-form-of-admin/"
            primaryField="Name"
            fields={[
              { name: 'name', label: 'Name' },
              { name: 'is_active', label: 'Is Active' },
            ]}
          />
      </div>
    </>
  );
}