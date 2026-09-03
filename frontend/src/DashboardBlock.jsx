
function DashboardBlock({ title, amount, subtitle }) {
    return (
        <span className="w-full border border-black bg-blue-200
                         p-2 rounded-lg shadow-lg shadow-block"
        >
            <h2 className="font-bold text-xs">
                {title}
            </h2>
            <p className="text-2xl max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {amount}
            </p>
            <p className="font-bold text-xs text-end max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {subtitle}
            </p>
        </span>
    );
}

export default DashboardBlock;