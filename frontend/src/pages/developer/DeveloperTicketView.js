import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import AppNavbar from '../../components/AppNavbar';
import { displayWorkflowText } from '../../utils/displayLabels';

export default function DeveloperTicketView() {
  const { ticketId } = useParams();

  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}/`);
      setTicket(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load ticket details');
    }
  };

  const handleViewFile = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadFile = (url) => {
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  if (error) {
    return (
      <>
        <AppNavbar />
        <div className="container mt-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <AppNavbar />
        <div className="container mt-4">Loading...</div>
      </>
    );
  }

  const attachments = Array.isArray(ticket.attachments)
    ? ticket.attachments
    : [];

  return (
    <>
      <AppNavbar />

      <div className="container mt-4">
        <h3 className="mb-4">Ticket Details</h3>

        <div className="card">
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Ticket ID:</strong> {ticket.ticket_id}
              </div>
              <div className="col-md-6">
                <strong>Status:</strong> {displayWorkflowText(ticket.status)}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Department:</strong> {ticket.department_name || ''}
              </div>
              <div className="col-md-6">
                <strong>Division:</strong> {ticket.division_name || ''}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Module:</strong> {ticket.module_name || ''}
              </div>
              <div className="col-md-6">
                <strong>Submodule:</strong> {ticket.submodule_name || ''}
              </div>
            </div>

            <div className="mb-3">
              <strong>Subject:</strong>
              <div>{ticket.subject}</div>
            </div>

            <div className="mb-3">
              <strong>Description:</strong>
              <div>{ticket.description}</div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <strong>User ID:</strong> {ticket.user_id_value || ''}
              </div>
              <div className="col-md-6">
                <strong>Password:</strong> {ticket.user_password || ''}
              </div>
            </div>

            <div className="mb-3">
              <strong>Reported To:</strong> {ticket.reported_to_name || ''}
            </div>

            <div className="mb-3">
              <strong>HelpDesk Remark:</strong>
              <div>{ticket.support_remark || ''}</div>
            </div>

            <div className="mb-3">
              <strong>Level_2 Remark:</strong>
              <div>{ticket.developer_remark || ''}</div>
            </div>

            <div className="mb-3">
              <strong>Attachments</strong>

              {attachments.length > 0 ? (
                <ul className="list-group mt-2">
                  {attachments.map((file) => (
                    <li
                      key={file.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>{file.original_file_name}</span>

                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewFile(file.file_url)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleDownloadFile(file.file_url)}
                        >
                          Download
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2">No attachments</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
