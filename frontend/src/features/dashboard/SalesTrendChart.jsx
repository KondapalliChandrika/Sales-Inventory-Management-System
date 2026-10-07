import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { chartColors, colors } from '@/theme';
import { formatCompactCurrency, formatCurrency, formatShortDate } from '@/utils/format';

const tooltipStyle = {
  background: colors.background[50],
  border: `1px solid ${colors.border[200]}`,
  borderRadius: 8,
  fontSize: 12,
};

export default function SalesTrendChart({ data = [] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.sales} stopOpacity={0.25} />
              <stop offset="100%" stopColor={chartColors.sales} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartColors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={formatCompactCurrency}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={formatShortDate}
            formatter={(value, name) => (name === 'sales' ? [formatCurrency(value), 'Sales'] : [value, 'Orders'])}
          />
          <Area type="monotone" dataKey="sales" stroke={chartColors.sales} strokeWidth={2} fill="url(#salesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
