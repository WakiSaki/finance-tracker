import { LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function ExpenseChart({ data }) {

    // Convert the date into a formatted string
    const formatDate = (dateString) => {
        const [year, monthNumber, day] = dateString.split("-");

        const date = new Date(year, monthNumber - 1, day);

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
        });
    };

    // Converts total data into data for chart
    const chartData = data.map(entry => ({
        formattedDate: formatDate(entry.date),
        total: Number(entry.total)
    }));

    return (
        <div className="w-1/2 h-75">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" 
                                   vertical={false}
                    />
                    <XAxis dataKey="formattedDate" 
                           tickLine={false}
                           axisLine={false}
                           tickMargin={10}
                    />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`}
                           tickLine={false}
                           axisLine={false}
                    />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, "Spent"]}
                             cursor={false}
                    />
                    <Line dataKey="total"
                          type="monotone"
                          stroke="#E56650"
                          strokeWidth={3}
                          dot={{ r:5 }}
                          activeDot={{ r:8 }}
                    >
                    </Line>
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default ExpenseChart;