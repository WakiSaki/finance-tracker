import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

function DashboardPieChart({ data, total }) {
    const COLORS = [
        "#3b82f6",
        "#22c55e",
        "#ef4444",
        "#eab308",
        "#a855f7"
    ];

    // Converts category amount total into chart data
    const pieChartData = data.map( entry => ({
        category: entry.category,
        total: Number(entry.total)
    }));

    return (
        <div className="w-1/2 h-96">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={pieChartData}
                         dataKey="total"
                         nameKey="category"
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={120}
                         label={({ category, percent }) =>
                            `${category} ${(percent * 100).toFixed(0)}%`
                         }
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <text x="50%"
                          y="45%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="font-bold"
                    >
                        ${total.toFixed(2)}
                    </text>
                    <text
                        x="50%"
                        y="52%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                    >
                        Total Spent
                    </text>
                    <Tooltip
                        formatter={(value) => `$${value.toFixed(2)}`}
                        contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid black"
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default DashboardPieChart;