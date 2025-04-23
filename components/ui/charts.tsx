"use client"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

// Cores padrão para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#8DD1E1"]

// Componente BarChart
export function BarChart({
  data,
  index,
  categories,
  colors = COLORS,
  valueFormatter = (value) => `${value}`,
  yAxisWidth = 40,
  showLegend = true,
  showGridLines = true,
  showAnimation = true,
  customTooltip,
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        <XAxis dataKey={index} />
        <YAxis width={yAxisWidth} tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} content={customTooltip} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} isAnimationActive={showAnimation} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Componente LineChart
export function LineChart({
  data,
  index,
  categories,
  colors = COLORS,
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showGridLines = true,
  showAnimation = true,
  customTooltip,
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={valueFormatter} content={customTooltip} />
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            isAnimationActive={showAnimation}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// Componente PieChart
export function PieChart({
  data,
  index,
  category,
  colors = COLORS,
  valueFormatter = (value) => `${value}`,
  showTooltip = true,
  showLegend = true,
  showAnimation = true,
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          nameKey={index}
          dataKey={category}
          cx="50%"
          cy="50%"
          outerRadius={80}
          isAnimationActive={showAnimation}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        {showLegend && <Legend />}
        {showTooltip && <Tooltip formatter={valueFormatter} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

// Componente DonutChart (uma variação do PieChart)
export function DonutChart({
  data,
  index,
  category,
  colors = COLORS,
  valueFormatter = (value) => `${value}`,
  showTooltip = true,
  showLegend = true,
  showAnimation = true,
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          nameKey={index}
          dataKey={category}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          isAnimationActive={showAnimation}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        {showLegend && <Legend />}
        {showTooltip && <Tooltip formatter={valueFormatter} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
