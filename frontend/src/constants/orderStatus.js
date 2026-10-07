export const ORDER_STATUS = {
  PENDING_APPROVAL: { label: 'Pending Approval', tone: 'warning' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, { label }]) => ({ value, label }));

export const APPROVAL_ACTION = {
  REQUESTED: { label: 'Approval requested', tone: 'warning' },
  APPROVED: { label: 'Approved', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export const MOVEMENT_TYPE = {
  IN: { label: 'Stock in', tone: 'success' },
  OUT: { label: 'Sold', tone: 'info' },
  ADJUSTMENT: { label: 'Adjustment', tone: 'warning' },
  RESERVE: { label: 'Reserved', tone: 'primary' },
  RELEASE: { label: 'Released', tone: 'neutral' },
};
