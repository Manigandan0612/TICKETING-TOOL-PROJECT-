import { useEffect, useState } from 'react';
import api from '../../api/client';
import AppNavbar from '../../components/AppNavbar';
import ClosedTickets from '../../components/ClosedTickets';
import TicketList from '../../components/TicketList';
import { displayWorkflowText } from '../../utils/displayLabels';

function SentToDeveloperTable() {
  const [tickets, setTickets] = useState([]);
  const [ticketIdSearch, setTicketIdSearch] =
    useState('');
  const [departmentFilter, setDepartmentFilter] =
    useState('');
  const [divisionSearch, setDivisionSearch] =
    useState('');
  const [moduleFilter, setModuleFilter] =
    useState('');
  const [submoduleFilter, setSubmoduleFilter] =
    useState('');
  const [statusFilter, setStatusFilter] =
    useState('');
  const [bugTypeSearch, setBugTypeSearch] =
    useState('');
  const [createdDate, setCreatedDate] =
    useState('');
  const [departments, setDepartments] = useState([]);
  const [modules, setModules] = useState([]);
  const [submodules, setSubmodules] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] =
    useState(null);

  const filteredModules =
    !departmentFilter
      ? modules
      : modules.filter(
          (module) =>
            Number(
              module.department ||
                module.department_id
            ) === Number(departmentFilter)
        );

  const filteredSubmodules =
    !moduleFilter
      ? submodules
      : submodules.filter(
          (submodule) =>
            Number(submodule.module) ===
            Number(moduleFilter)
        );

  const buildParams = (pageNo = page) => ({
    page: pageNo,
    is_sent_to_developer: true,
    support_decision: 'Moved to Development',
    status: statusFilter || 'Sent to Developer',
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
    ...(createdDate && {
      created_from: createdDate,
    }),
  });

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
        deptRes.data.results || deptRes.data || []
      );
      setModules(
        moduleRes.data.results || moduleRes.data || []
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

  const loadTickets = async (pageNo = page) => {
    try {
      const res = await api.get('/tickets/', {
        params: buildParams(pageNo),
      });

      setTickets(res.data.results || []);
      setCount(res.data.count || 0);
      setNextPage(res.data.next);
      setPreviousPage(res.data.previous);
    } catch (err) {
      console.error(err);
      setTickets([]);
      setCount(0);
      setNextPage(null);
      setPreviousPage(null);
    }
  };

  const exportExcel = async () => {
    try {
      const res = await api.get('/tickets/export_excel/', {
        params: buildParams(1),
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        'sent_to_developer_tickets.xlsx'
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

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
    createdDate,
  ]);

  useEffect(() => {
    loadDropdowns();
  }, []);

  const handleReset = () => {
    setTicketIdSearch('');
    setDepartmentFilter('');
    setDivisionSearch('');
    setModuleFilter('');
    setSubmoduleFilter('');
    setStatusFilter('');
    setBugTypeSearch('');
    setCreatedDate('');
    setPage(1);
  };

  const totalPages = Math.ceil(count / 8);

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <h4>{displayWorkflowText('Sent to Developer')}</h4>
          <button
            className="btn btn-success"
            onClick={exportExcel}
          >
            Export Excel
          </button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ticket ID"
              value={ticketIdSearch}
              onChange={(e) => {
                setTicketIdSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setModuleFilter('');
                setSubmoduleFilter('');
                setPage(1);
              }}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Division"
              value={divisionSearch}
              onChange={(e) => {
                setDivisionSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setSubmoduleFilter('');
                setPage(1);
              }}
            >
              <option value="">All Modules</option>
              {filteredModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.module_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={submoduleFilter}
              onChange={(e) => {
                setSubmoduleFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Submodules</option>
              {filteredSubmodules.map((submodule) => (
                <option
                  key={submodule.id}
                  value={submodule.id}
                >
                  {submodule.submodule_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="Sent to Developer">
                {displayWorkflowText('Sent to Developer')}
              </option>
            </select>
          </div>

          <div className="col-md-2">
            <input
              type="text"
              className="form-control"
              placeholder="Bug Type"
              value={bugTypeSearch}
              onChange={(e) => {
                setBugTypeSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              value={createdDate}
              onChange={(e) => {
                setCreatedDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-secondary w-100"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
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
                <th>HelpDesk Remark</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.ticket_id}</td>
                    <td>{ticket.department_name || ''}</td>
                    <td>{ticket.division_name || ''}</td>
                    <td>{ticket.module_name || ''}</td>
                    <td>{ticket.submodule_name || ''}</td>
                    <td>{ticket.bug_type || ''}</td>
                    <td>{ticket.subject}</td>
                    <td>{displayWorkflowText(ticket.status)}</td>
                    <td>{ticket.support_remark || ''}</td>
                    <td>
                      {ticket.created_at
                        ? new Date(
                            ticket.created_at
                          ).toLocaleString()
                        : ''}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10">
                    No sent to Level_2 tickets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Total Sent to Level_2 Tickets:{' '}
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
  );
}

export default function GeneralDashboard() {
  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <h2 className="mb-4">General Dashboard</h2>

        <div className="card mb-4">
          <div className="card-body">
            <h4 className="mb-3">All Tickets</h4>
            <TicketList />
          </div>
        </div>

        <SentToDeveloperTable />

        <ClosedTickets />
      </div>
    </>
  );
}
