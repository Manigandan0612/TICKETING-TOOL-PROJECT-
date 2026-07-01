import { Card, Col, Row } from 'react-bootstrap';
import { displayWorkflowText } from '../utils/displayLabels';

export default function DashboardCards({ summary }) {
  const items = [
    ['Total', summary.total],
    ['Open', summary.open],
    ['In Progress', summary.in_progress],
    ['Resolved by Support', summary.resolved_by_support],
    ['Sent to Developer', summary.sent_to_developer],
    ['Developer In Progress', summary.developer_in_progress],
    ['Closed', summary.closed],
    ['Reopened', summary.reopened],
  ];
  return (
    <Row className="g-3 mb-4">
      {items.map(([label, value]) => (
        <Col md={3} key={label}>
          <Card><Card.Body><div className="text-muted">{displayWorkflowText(label)}</div><div className="fs-3 fw-bold">{value ?? 0}</div></Card.Body></Card>
        </Col>
      ))}
    </Row>
  );
}
