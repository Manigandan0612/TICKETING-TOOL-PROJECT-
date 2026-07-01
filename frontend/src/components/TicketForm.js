import { useEffect, useState } from 'react';
import api from '../api/client';
import { displayWorkflowText } from '../utils/displayLabels';

export default function TicketForm({ onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [reportedToList, setReportedToList] = useState([]);
  const [reportedInForms, setReportedInForms] = useState([]);
  const [emailConfigs, setEmailConfigs] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
 

  const [form, setForm] = useState({
    department: '',
    division_name: '',
    module: '',
    submodule: '',
    reported_to: '',
    reported_in_form_of: '',
    subject: '',
    description: '',
    user_id_value: '',
    user_password: '',
    bug_type: '',
    priority: 'Medium',
    support_decision: 'Solved by Support',
    email_config: '',
    support_remark: '',
  });

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const [
        deptRes,
        moduleRes,
        submoduleRes,
        reportedRes,
        reportedInFormRes,
        emailRes,
      ] = await Promise.all([
        api.get('/masters/departments/'),
        api.get('/masters/modules/'),
        api.get('/masters/submodules/'),
        api.get('/masters/reported-to/'),
        api.get('/masters/reported-in-form-of/'),
        api.get('/masters/email-configs/'),
      ]);

      setDepartments(deptRes.data.results || deptRes.data || []);
      setModules(moduleRes.data.results || moduleRes.data || []);
      setSubmodules(submoduleRes.data.results || submoduleRes.data || []);
      setReportedToList(reportedRes.data.results || reportedRes.data || []);
      setReportedInForms(
        reportedInFormRes.data.results || reportedInFormRes.data || []
      );
      setEmailConfigs(emailRes.data.results || emailRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load master data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'module' ? { submodule: '' } : {}),
    }));
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files || []));
  };

  const filteredSubmodules = Array.isArray(submodules)
    ? submodules.filter((s) => String(s.module) === String(form.module))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = new FormData();

      payload.append('department', form.department);
      payload.append('division_name', form.division_name);
      payload.append('module', form.module);
      payload.append('submodule', form.submodule);
      payload.append('reported_to', form.reported_to);
      payload.append('reported_in_form_of', form.reported_in_form_of);
      payload.append('subject', form.subject);
      payload.append('description', form.description);
      payload.append('user_id_value', form.user_id_value || '');
      payload.append('user_password', form.user_password || '');
      payload.append('bug_type',form.bug_type || '');
      payload.append('priority', form.priority);
      payload.append('support_decision', form.support_decision);
      payload.append('support_remark', form.support_remark || '');

      if (form.email_config) {
        payload.append('email_config', form.email_config);
      }

      const ticketRes = await api.post('/tickets/', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const ticket = ticketRes.data;

      if (attachments.length > 0) {
        const attachPayload = new FormData();
        attachPayload.append('department', form.department);

        attachments.forEach((file) => {
          attachPayload.append('files', file);
        });

        await api.post(`/tickets/${ticket.id}/add_attachment/`, attachPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (form.support_decision === 'Moved to Development') {
        await api.post(`/tickets/${ticket.id}/send_to_developer/`, {
          email_config: form.email_config || null,
          support_remark: form.support_remark || '',
        });
      }

      setForm({
        department: '',
        division_name: '',
        module: '',
        submodule: '',
        reported_to: '',
        reported_in_form_of: '',
        subject: '',
        description: '',
        user_id_value: '',
        user_password: '',
        bug_type: '',
        priority: 'Medium',
        support_decision: 'Solved by Support',
        email_config: '',
        support_remark: '',
      });

      setAttachments([]);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);

      const data = err?.response?.data;

      if (typeof data === 'string') {
        setError(data);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError(JSON.stringify(data || { detail: 'Submit failed' }, null, 2));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Row 1 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Department</label>
          <select
            className="form-select"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.department_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Division Name</label>
          <input
            type="text"
            className="form-control"
            name="division_name"
            value={form.division_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Module</label>
          <select
            className="form-select"
            name="module"
            value={form.module}
            onChange={handleChange}
            required
          >
            <option value="">Select Module</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.module_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Submodule</label>
          <select
            className="form-select"
            name="submodule"
            value={form.submodule}
            onChange={handleChange}
            required
          >
            <option value="">Select Submodule</option>
            {filteredSubmodules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.submodule_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3 */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Reported To</label>
          <select
            className="form-select"
            name="reported_to"
            value={form.reported_to}
            onChange={handleChange}
            required
          >
            <option value="">Select Reported To</option>
            {reportedToList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.person_name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Reported In Form Of</label>
          <select
            className="form-select"
            name="reported_in_form_of"
            value={form.reported_in_form_of}
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            {reportedInForms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Subject</label>
        <input
          className="form-control"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="4"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="row g-3 mb-3">

      <div className="col-md-4">
        <label className="form-label">
          User ID
        </label>

        <input
          className="form-control"
          name="user_id_value"
          value={form.user_id_value}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">
          Password
        </label>

        <input
          className="form-control"
          name="user_password"
          value={form.user_password}
          onChange={handleChange}
        />
      </div>

      <div className="col-md-4">
        <label className="form-label">
          Bug Type
        </label>

        <input
          type="text"
          className="form-control"
          name="bug_type"
          placeholder="Enter Bug Type"
          value={form.bug_type}
          onChange={handleChange}
        />
      </div>

    </div>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">HelpDesk Decision</label>
          <select
            className="form-select"
            name="support_decision"
            value={form.support_decision}
            onChange={handleChange}
          >
            <option value="Solved by Support">
              {displayWorkflowText('Solved by Support')}
            </option>
            <option value="Moved to Development">
              {displayWorkflowText('Moved to Development')}
            </option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Email Config</label>
          <select
            className="form-select"
            name="email_config"
            value={form.email_config}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {emailConfigs.map((e) => (
              <option key={e.id} value={e.id}>
                {e.config_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">HelpDesk Remark</label>
        <textarea
          className="form-control"
          rows="3"
          name="support_remark"
          value={form.support_remark}
          onChange={handleChange}
        />
      </div>

     <div className="mb-3">
  <label className="form-label">Attachments</label>

  <input
    type="file"
    multiple
    className="form-control"
    onChange={(e) => {
      const newFiles = Array.from(e.target.files || []);

      setAttachments((prev) => [...prev, ...newFiles]);

      // reset input
      e.target.value = null;
    }}
  />

  {attachments.length > 0 && (
    <div className="mt-3">
      {attachments.map((file, index) => (
        <div
          key={index}
          className="d-flex justify-content-between align-items-center border rounded p-2 mb-2"
        >
          <div>📎 {file.name}</div>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => {
              setAttachments((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>

      <button type="submit" className="btn btn-primary">
        Submit Ticket
      </button>
    </form>
  );
}
