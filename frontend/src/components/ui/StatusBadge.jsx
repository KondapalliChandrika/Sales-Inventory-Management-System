import { ORDER_STATUS } from '@/constants/orderStatus';

import Badge from './Badge';

export default function StatusBadge({ status }) {
  const config = ORDER_STATUS[status] ?? { label: status, tone: 'neutral' };
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
