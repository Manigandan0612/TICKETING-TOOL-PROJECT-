import { useEffect, useState } from 'react';
import api from '../api/client';
import { displayWorkflowText } from '../utils/displayLabels';

export default function TicketList({
  refreshKey = 0,
}) {
  const [tickets, setTickets] =
    useState([]);

  const [
    ticketIdSearch,
    setTicketIdSearch,
  ] = useState('');

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState('');

  const [
    divisionFilter,
    setDivisionFilter,
  ] = useState('');

  const [
    moduleFilter,
    setModuleFilter,
  ] = useState('');

  const [
    submoduleFilter,
    setSubmoduleFilter,
  ] = useState('');

  const [
    bugTypeSearch,
    setBugTypeSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('');

  // ONLY 2 DATE FILTERS
  const [
    createdDate,
    setCreatedDate,
  ] = useState('');

  const [
    closedDate,
    setClosedDate,
  ] = useState('');

  const [departments, setDepartments] =
    useState([]);

  const [modules, setModules] =
    useState([]);

  const [submodules, setSubmodules] =
    useState([]);

  const [page, setPage] =
    useState(1);

  const [count, setCount] =
    useState(0);

  const [nextPage, setNextPage] =
    useState(null);

  const [
    previousPage,
    setPreviousPage,
  ] = useState(null);

  const [error, setError] =
    useState('');

  // LOAD DROPDOWNS
  const loadDropdowns =
    async () => {
      try {
        const [
          deptRes,
          moduleRes,
          submoduleRes,
        ] = await Promise.all([
          api.get(
            '/masters/departments/'
          ),
          api.get(
            '/masters/modules/'
          ),
          api.get(
            '/masters/submodules/'
          ),
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

  // FILTER MODULES
  const filteredModules =
    !departmentFilter
      ? modules
      : modules.filter(
          (module) =>
            Number(
              module.department ||
                module.department_id
            ) ===
            Number(
              departmentFilter
            )
        );

  // FILTER SUBMODULES
  const filteredSubmodules =
    !moduleFilter
      ? submodules
      : submodules.filter(
          (submodule) =>
            Number(
              submodule.module
            ) ===
            Number(
              moduleFilter
            )
        );

  // LOAD TICKETS
  const buildTicketParams =
    (pageNo = page) => {
      const params = {
        page: pageNo,
      };

      if (ticketIdSearch) {
        params.ticket_id =
          ticketIdSearch;
      }

      if (
        departmentFilter
      ) {
        params.department =
          departmentFilter;
      }

      if (divisionFilter) {
        params.division =
          divisionFilter;
      }

      if (moduleFilter) {
        params.module =
          moduleFilter;
      }

      if (
        submoduleFilter
      ) {
        params.submodule =
          submoduleFilter;
      }

      if (bugTypeSearch) {
        params.bug_type =
          bugTypeSearch;
      }

      if (statusFilter) {
        params.status =
          statusFilter;
      }

      if (createdDate) {
        params.created_from =
          createdDate;
      }

      if (closedDate) {
        params.closed_from =
          closedDate;
      }

      return params;
    };

  const loadTickets =
    async (pageNo = page) => {
      try {
        const res =
          await api.get(
            '/tickets/',
            {
              params:
                buildTicketParams(
                  pageNo
                ),
            }
          );

        const data =
          res.data;

        setTickets(
          data.results || []
        );

        setCount(
          data.count || 0
        );

        setNextPage(
          data.next
        );

        setPreviousPage(
          data.previous
        );

        setError('');
      } catch (err) {
        console.error(
          'Ticket load failed:',
          err
        );
        setTickets([]);
        setCount(0);
        setNextPage(null);
        setPreviousPage(null);
        setError(
          'Failed to load tickets'
        );
      }
    };

  // EXPORT EXCEL
  const exportExcel =
    async () => {
      try {
        const response =
          await api.get(
            '/tickets/export_excel/',
            {
              params:
                buildTicketParams(1),
              responseType:
                'blob',
            }
          );

        const blob =
          new Blob([
            response.data,
          ]);

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href = url;
        link.download =
          'tickets.xlsx';

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();
      } catch (err) {
        console.error(
          'Export failed',
          err
        );
      }
    };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    loadTickets(page);
  }, [
    refreshKey,
    page,
    ticketIdSearch,
    departmentFilter,
    divisionFilter,
    moduleFilter,
    submoduleFilter,
    bugTypeSearch,
    statusFilter,
    createdDate,
    closedDate,
  ]);

  // RESET FILTERS
  const handleResetFilters =
    () => {
      setTicketIdSearch('');
      setDepartmentFilter('');
      setDivisionFilter('');
      setModuleFilter('');
      setSubmoduleFilter('');
      setBugTypeSearch('');
      setStatusFilter('');
      setCreatedDate('');
      setClosedDate('');
      setPage(1);
    };

  const totalPages =
    Math.ceil(count / 8);

  return (
    <div>
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="row mb-3 g-2">

        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Ticket ID"
            value={ticketIdSearch}
            onChange={(e) =>
              {
                setTicketIdSearch(
                  e.target.value
                );
                setPage(1);
              }
            }
          />
        </div>

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

        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Division"
            value={divisionFilter}
            onChange={(e) =>
              {
                setDivisionFilter(
                  e.target.value
                );
                setPage(1);
              }
            }
          />
        </div>

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

        <div className="col-md-2">
          <select
            className="form-select"
            value={submoduleFilter}
            onChange={(e) =>
              {
                setSubmoduleFilter(
                  e.target.value
                );
                setPage(1);
              }
            }
          >
            <option value="">
              All Submodules
            </option>

            {filteredSubmodules.map(
              (submodule) => (
                <option
                  key={submodule.id}
                  value={submodule.id}
                >
                  {
                    submodule.submodule_name
                  }
                </option>
              )
            )}
          </select>
        </div>

        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Bug Type"
            value={bugTypeSearch}
            onChange={(e) =>
              {
                setBugTypeSearch(
                  e.target.value
                );
                setPage(1);
              }
            }
          />
        </div>

        <div className="col-md-2">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) =>
              {
                setStatusFilter(
                  e.target.value
                );
                setPage(1);
              }
            }
          >
            <option value="">
              All Status
            </option>
            <option value="Open">
              Open
            </option>
            <option value="In Progress">
              In Progress
            </option>
            <option value="Resolved by Support">
              {displayWorkflowText('Resolved by Support')}
            </option>
            <option value="Sent to Developer">
              {displayWorkflowText('Sent to Developer')}
            </option>
            <option value="Developer In Progress">
              {displayWorkflowText('Developer In Progress')}
            </option>
            <option value="Closed">
              Closed
            </option>
            <option value="Reopened">
              Reopened
            </option>
          </select>
        </div>

        <div className="col-md-2">
          <label className="form-label">
            Created Date
          </label>
          <input
            type="date"
            className="form-control"
            value={createdDate}
            onChange={(e) =>
              {
                setCreatedDate(
                  e.target.value
                );
                setPage(1);
              }
            }
          />
        </div>

        <div className="col-md-2">
          <label className="form-label">
            To Date / Closed Date
          </label>
          <input
            type="date"
            className="form-control"
            value={closedDate}
            onChange={(e) =>
              {
                setClosedDate(
                  e.target.value
                );
                setPage(1);
              }
            }
          />
        </div>
      </div>

      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-secondary"
          onClick={
            handleResetFilters
          }
        >
          Reset
        </button>

        <button
          className="btn btn-success"
          onClick={exportExcel}
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
              <th>HelpDesk Decision</th>
              <th>HelpDesk Remark</th>
              <th>Created Date</th>
              <th>Closed Date</th>
            </tr>
          </thead>

          <tbody>
            {tickets.length ? (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.ticket_id}</td>
                  <td>
                    {ticket.department_name || ''}
                  </td>
                  <td>
                    {ticket.division_name || ''}
                  </td>
                  <td>{ticket.module_name || ''}</td>
                  <td>
                    {ticket.submodule_name || ''}
                  </td>
                  <td>{ticket.bug_type || ''}</td>
                  <td>{ticket.subject}</td>
                  <td>{displayWorkflowText(ticket.status)}</td>
                  <td>
                    {displayWorkflowText(ticket.support_decision)}
                  </td>
                  <td>
                    {ticket.support_remark || ''}
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
                <td colSpan="12">
                  No tickets available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
  );
}
