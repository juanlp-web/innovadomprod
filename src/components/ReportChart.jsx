import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const CHART_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#EC4899', // pink-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#6366F1'  // indigo-500
]

export function ReportChart({ title, data, type = 'bar', height = 300, ...props }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft p-6" style={{ height }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-center">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height - 80}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={CHART_COLORS[0]} 
                strokeWidth={3}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: CHART_COLORS[0], strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = data.map((item, index) => ({
          ...item,
          color: CHART_COLORS[index % CHART_COLORS.length]
        }))

        return (
          <ResponsiveContainer width="100%" height={height - 80}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={Math.min(height - 120, 120)}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={height - 80}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
                interval={0}
                angle={data.length > 5 ? -45 : 0}
                textAnchor={data.length > 5 ? 'end' : 'middle'}
                height={data.length > 5 ? 80 : 30}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Bar 
                dataKey="value" 
                fill={CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group border border-gray-100" {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse group-hover:bg-purple-500 transition-colors duration-300"></div>
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-200">{data.length} elementos</span>
        </div>
      </div>
      <div className="w-full relative overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative">
          {renderChart()}
        </div>
      </div>
    </div>
  )
}
