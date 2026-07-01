import { useEffect, useState } from 'react';
import api from '../api/client';
import { displayWorkflowText } from '../utils/displayLabels';

export default function ClosedTickets() {
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const loadClosedTickets = async (pageNo = page) => {
    try {
      const res = await api.get('/tickets/', {
        params: { status: 'Closed', page: pageNo }
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

  const handleExport = async () => {
    try {
      const res = await api.get('/tickets/export_excel/', {
        params: { status: 'Closed' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'closed_tickets.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClosedTickets(page);
  }, [page]);

  const totalPages = Math.ceil(count / 8);

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <h4>Closed Tickets</h4>
          <button className="btn btn-success" onClick={handleExport}>
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
                <th>Closed Date</th>
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
                    <td>{ticket.closed_at ? new Date(ticket.closed_at).toLocaleString() : ''}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9">No closed tickets available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            Total Closed Tickets: <strong>{count}</strong>
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
