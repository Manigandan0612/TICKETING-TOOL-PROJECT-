import { useEffect, useState } from 'react';
import api from '../../api/client';
import AppNavbar from '../../components/AppNavbar';
import TicketForm from '../../components/TicketForm';
import TicketList from '../../components/TicketList';
import ClosedTickets from '../../components/ClosedTickets';

export default function SupportDashboard() {
  const [summary, setSummary] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved_by_support: 0,
    sent_to_developer: 0,
    developer_in_progress: 0,
    closed: 0,
    reopened: 0,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary/');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [refreshKey]);

  const handleTicketCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <AppNavbar />
      <div className="container mt-4">
        <h2 className="mb-4">HelpDesk Dashboard</h2>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Total</h6>
                <h2>{summary.total || 0}</h2>
              </div>
            </div>
          </div>

  
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Resolved by HelpDesk</h6>
                <h2>{summary.resolved_by_support || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Sent to Level_2</h6>
                <h2>{summary.sent_to_developer || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Level_2 In Progress</h6>
                <h2>{summary.developer_in_progress || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Closed</h6>
                <h2>{summary.closed || 0}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6>Reopened</h6>
                <h2>{summary.reopened || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h4 className="mb-3">Create Ticket</h4>
            <TicketForm onSuccess={handleTicketCreated} />
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <h4 className="mb-3">Tickets</h4>
            <TicketList refreshKey={refreshKey} />
          </div>
        </div>

        <ClosedTickets />
      </div>
    </>
  );
}
