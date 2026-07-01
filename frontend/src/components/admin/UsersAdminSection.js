import { useEffect, useState } from 'react';
import api from '../../api/client';
import { displayRole } from '../../utils/displayLabels';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 'GENERAL',
  is_active: true,
};

export default function UsersAdminSection() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const loadUsers = async (pageNo = page) => {
    try {
      const res = await api.get('/auth/users-admin/', {
        params: { page: pageNo },
      });

      setUsers(res.data.results || []);
      setCount(res.data.count || 0);
      setNextPage(res.data.next);
      setPreviousPage(res.data.previous);
    } catch (err) {
      console.error('Failed to load users', err);
      setUsers([]);
      setCount(0);
      setNextPage(null);
      setPreviousPage(null);
    }
  };

  useEffect(() => {
    loadUsers(page);
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'is_active' ? value === 'true' : value,
    }));
  };

  const handleAddClick = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      confirm_password: '',
      role: user.role || 'GENERAL',
      is_active: user.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/users-admin/${id}/`);
      loadUsers(page);
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && form.password !== form.confirm_password) {
      alert('Password and Confirm Password do not match');
      return;
    }

    const payload = {
      username: form.username,
      email: form.email,
      role: form.role,
      is_active: form.is_active,
    };

    if (form.password) {
      payload.password = form.password;
    }

    try {
      if (editingId) {
        await api.put(`/auth/users-admin/${editingId}/`, payload);
      } else {
        await api.post('/auth/users-admin/', payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      loadUsers(page);
    } catch (err) {
      console.error('Failed to save user', err);
      console.error('Response data:', err?.response?.data);
      alert(JSON.stringify(err?.response?.data || { detail: 'Failed to save user' }));
    }
  };

  const totalPages = Math.ceil(count / 8);

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Users</h4>
          <button className="btn btn-primary" onClick={handleAddClick}>
            Add User
          </button>
        </div>

        {showForm && (
          <form className="row g-3 mb-4" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="DEPARTMENT_ADMIN">DEPARTMENT ADMIN</option>
                <option value="SUPPORT">{displayRole('SUPPORT')}</option>
                <option value="DEVELOPER">{displayRole('DEVELOPER')}</option>
                <option value="CLIENT">CLIENT</option>
                <option value="GENERAL">GENERAL</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required={!editingId}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-control"
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required={!editingId}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Is Active</label>
              <select
                className="form-select"
                name="is_active"
                value={String(form.is_active)}
                onChange={handleChange}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>

            <div className="col-12">
              <button className="btn btn-success me-2" type="submit">
                {editingId ? 'Update User' : 'Save User'}
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{displayRole(user.role)}</td>
                    <td>{user.is_active ? 'Yes' : 'No'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Total Users: <strong>{count}</strong>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary"
              disabled={!previousPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </button>
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
            </span>
            <button
              className="btn btn-outline-secondary"
              disabled={!nextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
