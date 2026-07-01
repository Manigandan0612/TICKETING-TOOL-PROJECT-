import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MasterCrudPage({
  title,
  apiPath,
  fields,
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);

  // PAGINATION
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // LOAD ITEMS
  const loadItems = async (pageNo = page) => {
    try {
      const res = await api.get(apiPath, {
        params: {
          page: pageNo,
        },
      });

      const data = res.data;

      setItems(
        Array.isArray(data)
          ? data
          : data.results || []
      );

      setCount(data.count || 0);
      setNextPage(data.next);
      setPreviousPage(data.previous);

    } catch (err) {
      console.error(`Failed to load ${title}`, err);
    }
  };

  useEffect(() => {
    const initial = {};

    fields.forEach((f) => {
      initial[f.name] = '';
    });

    setForm(initial);
    loadItems(1);
  }, [apiPath]);

  useEffect(() => {
    loadItems(page);
  }, [page]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const normalizePayload = () => {
    const payload = { ...form };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') {
        payload[key] = null;
      }
    });

    ['is_active', 'use_tls', 'use_ssl'].forEach((key) => {
      if (key in payload) {
        payload[key] =
          payload[key] === 'true' ||
          payload[key] === true;
      }
    });

    ['module', 'smtp_port'].forEach((key) => {
      if (
        key in payload &&
        payload[key] !== null
      ) {
        payload[key] = Number(payload[key]);
      }
    });

    if (
      editingId &&
      title === 'Email Configs' &&
      !payload.smtp_password
    ) {
      delete payload.smtp_password;
    }

    return payload;
  };

  // SAVE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = normalizePayload();

      if (editingId) {
        await api.put(
          `${apiPath}${editingId}/`,
          payload
        );
      } else {
        await api.post(apiPath, payload);
      }

      setEditingId(null);

      const reset = {};

      fields.forEach((f) => {
        reset[f.name] = '';
      });

      setForm(reset);

      loadItems(page);

    } catch (err) {
      console.error(`Failed to save ${title}`, err);
      alert(`Failed to save ${title}`);
    }
  };

  // EDIT
  const handleEdit = (item) => {
    setEditingId(item.id);

    const updated = {};

    fields.forEach((f) => {
      updated[f.name] =
        item[f.name] ?? '';
    });

    setForm(updated);
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`${apiPath}${id}/`);

      loadItems(page);

    } catch (err) {
      console.error(`Failed to delete ${title}`, err);
      alert(`Failed to delete ${title}`);
    }
  };

  // INPUTS
  const renderInput = (field) => {
    if (
      field.name === 'is_active' ||
      field.name === 'use_tls' ||
      field.name === 'use_ssl'
    ) {
      return (
        <select
          className="form-select"
          name={field.name}
          value={form[field.name] ?? ''}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    return (
      <input
        className="form-control"
        name={field.name}
        value={form[field.name] ?? ''}
        onChange={handleChange}
      />
    );
  };

  const totalPages =
    Math.ceil(count / 8);

  return (
    <div className="card mb-4">
      <div className="card-body">

        <h4 className="mb-3">
          {title}
        </h4>

        {/* FORM */}
        <form
          className="row g-3 mb-4"
          onSubmit={handleSubmit}
        >
          {fields.map((field) => (
            <div
              className="col-md-4"
              key={field.name}
            >
              <label className="form-label">
                {field.label}
              </label>

              {renderInput(field)}
            </div>
          ))}

          <div className="col-12">
            <button
              className="btn btn-primary me-2"
              type="submit"
            >
              {editingId
                ? 'Update'
                : 'Add'}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEditingId(null);

                const reset = {};

                fields.forEach((f) => {
                  reset[f.name] = '';
                });

                setForm(reset);
              }}
            >
              Clear
            </button>
          </div>
        </form>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID</th>

                {fields.map((field) => (
                  <th key={field.name}>
                    {field.label}
                  </th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>

                    {fields.map((field) => (
                      <td key={field.name}>
                        {item[field.name]?.toString() || ''}
                      </td>
                    ))}

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() =>
                          handleEdit(item)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      fields.length + 2
                    }
                    className="text-center"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="d-flex justify-content-between align-items-center mt-3">

          <div>
            Total Records:{' '}
            <strong>{count}</strong>
          </div>

          <div className="d-flex gap-2 align-items-center">

            <button
              className="btn btn-outline-secondary"
              disabled={!previousPage}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
            >
              Previous
            </button>

            <span>
              Page{' '}
              <strong>{page}</strong>{' '}
              of{' '}
              <strong>
                {totalPages || 1}
              </strong>
            </span>

            <button
              className="btn btn-outline-secondary"
              disabled={!nextPage}
              onClick={() =>
                setPage((prev) => prev + 1)
              }
            >
              Next
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}