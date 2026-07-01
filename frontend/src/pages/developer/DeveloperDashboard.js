import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AppNavbar from '../../components/AppNavbar';
import { displayWorkflowText } from '../../utils/displayLabels';

export default function DeveloperDashboard() {
  const navigate = useNavigate();

  // Filters
  const [ticketIdSearch, setTicketIdSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [divisionSearch, setDivisionSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [submoduleFilter, setSubmoduleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departments, setDepartments] = useState([]);
const [modules, setModules] = useState([]);
const [submodules, setSubmodules] = useState([]);

const [createdFromDate, setCreatedFromDate] = useState('');

const [bugTypeSearch, setBugTypeSearch] = useState('');

  // Data
  const [tickets, setTickets] = useState([]);
  const [closedTickets, setClosedTickets] =
    useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    reopened: 0,
    closed: 0,
  });

  const filteredModules =
  !departmentFilter
    ? modules
    : modules.filter(
        (module) =>
          Number(
            module.department ||
            module.department_id
          ) ===
          Number(departmentFilter)
      );

const filteredSubmodules =
  !moduleFilter
    ? submodules
    : submodules.filter(
        (submodule) =>
          Number(
            submodule.module
          ) ===
          Number(moduleFilter)
      );

  // Pagination
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [closedPage, setClosedPage] = useState(1);
  const [closedCount, setClosedCount] = useState(0);
  const [closedNextPage, setClosedNextPage] =
    useState(null);
  const [
    closedPreviousPage,
    setClosedPreviousPage,
  ] = useState(null);

  const [error, setError] = useState('');

  const loadDropdowns = async () => {
  try {
    const [
      deptRes,
      moduleRes,
      submoduleRes,
    ] = await Promise.all([
      api.get('/masters/departments/'),
      api.get('/masters/modules/'),
      api.get('/masters/submodules/'),
    ]);

    setDepartments(
      deptRes.data.results ||
      deptRes.data ||
      []
    );

    setModules(
      moduleRes.data.results ||
      moduleRes.data ||
      []
    );

    setSubmodules(
      submoduleRes.data.results ||
      submoduleRes.data ||
      []
    );
  } catch (err) {
    console.error(err);
  }
};

  // Load Summary
  const loadSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary/');

      setSummary({
        total: res.data.total || 0,
        open: res.data.open || 0,
        reopened: res.data.reopened || 0,
        closed: res.data.closed || 0,
      });
    } catch (err) {
      console.error('Failed to load summary', err);
    }
  };

  const buildTicketParams = (pageNo = page) => ({
    page: pageNo,
    is_sent_to_developer: true,
    support_decision: 'Moved to Development',
    status: 'Sent to Developer',
    ...(ticketIdSearch && {
      ticket_id: ticketIdSearch,
    }),
    ...(departmentFilter && {
      department: departmentFilter,
    }),
    ...(divisionSearch && {
      division: divisionSearch,
    }),
    ...(moduleFilter && {
      module: moduleFilter,
    }),
    ...(submoduleFilter && {
      submodule: submoduleFilter,
    }),
    ...(bugTypeSearch && {
      bug_type: bugTypeSearch,
    }),
    ...(createdFromDate && {
      created_from: createdFromDate,
    }),
  });

  const buildClosedTicketParams = (
    pageNo = closedPage
  ) => ({
    page: pageNo,
    is_sent_to_developer: true,
    support_decision: 'Moved to Development',
    status: 'Closed',
  });

  // Load Tickets
  const loadTickets = async (pageNo = page) => {
    try {
      const res = await api.get('/tickets/', {
        params: buildTicketParams(pageNo),
      });

      setTickets(res.data.results || []);
      setCount(res.data.count || 0);
      setNextPage(res.data.next);
      setPreviousPage(res.data.previous);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load developer tickets');
      setTickets([]);
    }
  };

  const exportExcel = async () => {
    try {
      const res = await api.get('/tickets/export_excel/', {
        params: buildTicketParams(1),
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        'developer_tickets.xlsx'
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const loadClosedTickets = async (
    pageNo = closedPage
  ) => {
    try {
      const res = await api.get('/tickets/', {
        params:
          buildClosedTicketParams(pageNo),
      });

      setClosedTickets(res.data.results || []);
      setClosedCount(res.data.count || 0);
      setClosedNextPage(res.data.next);
      setClosedPreviousPage(res.data.previous);
    } catch (err) {
      console.error(err);
      setClosedTickets([]);
      setClosedCount(0);
      setClosedNextPage(null);
      setClosedPreviousPage(null);
    }
  };

  const exportClosedExcel = async () => {
    try {
      const res = await api.get('/tickets/export_excel/', {
        params: {
          is_sent_to_developer: true,
          support_decision: 'Moved to Development',
          status: 'Closed',
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        'developer_closed_tickets.xlsx'
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  useEffect(() => {
    loadSummary();
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadTickets(page);
  }, [
    page,
    ticketIdSearch,
    departmentFilter,
    divisionSearch,
    moduleFilter,
    submoduleFilter,
    statusFilter,
    bugTypeSearch,
    createdFromDate,
  ]);

  useEffect(() => {
    loadClosedTickets(closedPage);
  }, [closedPage]);

  // Update Ticket
  const handleUpdate = async (ticketId, status, developerRemark) => {
    try {
      await api.post(`/tickets/${ticketId}/developer_update/`, {
        status,
        developer_remark: developerRemark,
      });

      loadSummary();
      loadTickets(page);
      loadClosedTickets(closedPage);
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket');
    }
  };

  // View Ticket
  const handleView = (ticketId) => {
    navigate(`/developer/ticket/${ticketId}`);
  };

  const handleResetFilters = () => {
    setTicketIdSearch('');
    setDepartmentFilter('');
    setDivisionSearch('');
    setModuleFilter('');
    setSubmoduleFilter('');
    setStatusFilter('');
    setBugTypeSearch('');
    setCreatedFromDate('');
    setPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(count / 8);
  const totalClosedPages =
    Math.ceil(closedCount / 8);

  return (
    <>
      <AppNavbar />

      <div className="container mt-4">
        <h2 className="mb-4">Level_2 Dashboard</h2>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="row mb-4">

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Total Tickets</h5>
                <h2>{summary.total}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Open Tickets</h5>
                <h2>{summary.open}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Reopened</h5>
                <h2>{summary.reopened}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card">
              <div className="card-body">
                <h5>Closed</h5>
                <h2>{summary.closed}</h2>
              </div>
            </div>
          </div>

        </div>

        {/* Ticket Table */}
        <div className="card mb-4">
          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                Tickets Sent to Level_2
              </h4>

              <button
                className="btn btn-success"
                onClick={exportExcel}
              >
                Export Excel
              </button>
            </div>

            {/* Filters */}
            <div className="row g-2 mb-3">

              {/* Ticket ID */}
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ticket ID"
                  value={ticketIdSearch}
                  onChange={(e) => {
                    setTicketIdSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                />
              </div>

              {/* Department */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(
                      e.target.value
                    );
                    setModuleFilter('');
                    setSubmoduleFilter('');
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Departments
                  </option>

                  {departments.map(
                    (dept) => (
                      <option
                        key={dept.id}
                        value={dept.id}
                      >
                        {dept.department_name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Division */}
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Division"
                  value={divisionSearch}
                  onChange={(e) => {
                    setDivisionSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                />
              </div>

              {/* Module */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={moduleFilter}
                  onChange={(e) => {
                    setModuleFilter(
                      e.target.value
                    );
                    setSubmoduleFilter('');
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Modules
                  </option>

                  {filteredModules.map(
                    (module) => (
                      <option
                        key={module.id}
                        value={module.id}
                      >
                        {module.module_name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Submodule */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={submoduleFilter}
                  onChange={(e) => {
                    setSubmoduleFilter(
                      e.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Submodules
                  </option>

                  {filteredSubmodules.map(
                    (sub) => (
                      <option
                        key={sub.id}
                        value={sub.id}
                      >
                        {sub.submodule_name}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Status */}
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(
                      e.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Status
                  </option>

                  <option value="Sent to Developer">
                    {displayWorkflowText('Sent to Developer')}
                  </option>
                </select>
              </div>

              {/* Bug Type */}
              <div className="col-md-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bug Type"
                  value={bugTypeSearch}
                  onChange={(e) => {
                    setBugTypeSearch(
                      e.target.value
                    );
                    setPage(1);
                  }}
                />
              </div>

              {/* Created Date */}
              <div className="col-md-2">
                <input
                  type="date"
                  className="form-control"
                  value={createdFromDate}
                  onChange={(e) => {
                    setCreatedFromDate(
                      e.target.value
                    );
                    setPage(1);
                  }}
                />
              </div>

              <div className="col-md-2">
                <button
                  className="btn btn-secondary w-100"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">

              <table className="table table-bordered table-striped">

                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Department</th>
                    <th>Division</th>
                    <th>Module</th>
                    <th>Submodule</th>
                    <th>Bug Type</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>HelpDesk Remark</th>
                    <th>View</th>
                    <th>Level_2 Remark</th>
                    <th>Created Date</th>
                    <th>Update</th>
                  </tr>
                </thead>

                <tbody>

                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (

                      <tr key={ticket.id}>

                        <td>{ticket.ticket_id}</td>

                        <td>
                          {ticket.department_name || ''}
                        </td>

                        <td>
                          {ticket.division_name || ''}
                        </td>

                        <td>
                          {ticket.module_name || ''}
                        </td>

                        <td>
                          {ticket.submodule_name || ''}
                        </td>

                        <td>
                          {ticket.bug_type || ''}
                        </td>

                        <td>{ticket.subject}</td>

                        <td>{displayWorkflowText(ticket.status)}</td>

                        <td>
                          {ticket.support_remark || ''}
                        </td>

                        {/* View */}
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              handleView(ticket.id)
                            }
                          >
                            👁
                          </button>
                        </td>

                        {/* Level_2 Remark */}
                        <td>
                          <textarea
                            className="form-control"
                            rows="2"
                            defaultValue={
                              ticket.developer_remark || ''
                            }
                            id={`remark-${ticket.id}`}
                          />
                        </td>

                        <td>
                          {ticket.created_at
                            ? new Date(
                                ticket.created_at
                              ).toLocaleString()
                            : ''}
                        </td>

                        {/* Update */}
                        <td>

                          <select
                            className="form-select mb-2"
                            defaultValue={ticket.status}
                            id={`status-${ticket.id}`}
                          >
                            <option value="Sent to Developer">
                              {displayWorkflowText('Sent to Developer')}
                            </option>

                            <option value="Developer In Progress">
                              {displayWorkflowText('Developer In Progress')}
                            </option>

                            <option value="Reopened">
                              Reopened
                            </option>

                            <option value="Closed">
                              Closed
                            </option>

                          </select>

                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              handleUpdate(
                                ticket.id,
                                document.getElementById(
                                  `status-${ticket.id}`
                                ).value,
                                document.getElementById(
                                  `remark-${ticket.id}`
                                ).value
                              )
                            }
                          >
                            Update
                          </button>

                        </td>

                      </tr>

                    ))
                  ) : (
                    <tr>
                      <td colSpan="13">
                        No matching tickets found
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">

              <div>
                Total Tickets:{' '}
                <strong>{count}</strong>
              </div>

              <div className="d-flex align-items-center gap-2">

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
                  Page <strong>{page}</strong> of{' '}
                  <strong>{totalPages || 1}</strong>
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

        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">
                Closed Tickets
              </h4>

              <button
                className="btn btn-success"
                onClick={exportClosedExcel}
              >
                Export Excel
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Department</th>
                    <th>Division</th>
                    <th>Module</th>
                    <th>Submodule</th>
                    <th>Bug Type</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Level_2 Remark</th>
                    <th>Created Date</th>
                    <th>Closed Date</th>
                  </tr>
                </thead>

                <tbody>
                  {closedTickets.length > 0 ? (
                    closedTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.ticket_id}</td>
                        <td>
                          {ticket.department_name || ''}
                        </td>
                        <td>
                          {ticket.division_name || ''}
                        </td>
                        <td>
                          {ticket.module_name || ''}
                        </td>
                        <td>
                          {ticket.submodule_name || ''}
                        </td>
                        <td>
                          {ticket.bug_type || ''}
                        </td>
                        <td>{ticket.subject}</td>
                        <td>{displayWorkflowText(ticket.status)}</td>
                        <td>
                          {ticket.developer_remark || ''}
                        </td>
                        <td>
                          {ticket.created_at
                            ? new Date(
                                ticket.created_at
                              ).toLocaleString()
                            : ''}
                        </td>
                        <td>
                          {ticket.closed_at
                            ? new Date(
                                ticket.closed_at
                              ).toLocaleString()
                            : ''}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11">
                        No closed tickets available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Total Closed Tickets:{' '}
                <strong>{closedCount}</strong>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-outline-secondary"
                  disabled={!closedPreviousPage}
                  onClick={() =>
                    setClosedPage((prev) => prev - 1)
                  }
                >
                  Previous
                </button>

                <span>
                  Page{' '}
                  <strong>{closedPage}</strong> of{' '}
                  <strong>
                    {totalClosedPages || 1}
                  </strong>
                </span>

                <button
                  className="btn btn-outline-secondary"
                  disabled={!closedNextPage}
                  onClick={() =>
                    setClosedPage((prev) => prev + 1)
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
