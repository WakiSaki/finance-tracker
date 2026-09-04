
function FilterOptions({ categories, categoryFilter, setCategoryFilter, sortOption, setSortOption, setSelectedExpense }) {
    return (
        <div className="bg-white max-w-fit justify-self-center px-4
                            rounded-lg border border-black flex gap-4
                            items-center
                            sm:flex-col lg:flex-row"
            >
                {/* Category Selector */}
                <span className="flex flex-col justify-self-center gap-2 py-2 h-full">
                    <label>Category:</label>
                    <select value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setSelectedExpense(null);
                            }}
                            className="bg-indigo-50 rounded-lg border border-black"
                    >
                        <option className="text-right" value="All">All</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.name}
                                    className="text-right"
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </span>
                {/* Sorting Options */}
                <span className="flex flex-col gap-2 py-2 justify-self-center h-full">
                    <label>Sort by:</label>
                    <select value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="bg-indigo-50 rounded-lg border border-black"
                    >
                        <option className="text-end" value="amount high">Amount (High to Low)</option>
                        <option className="text-end" value="amount low">Amount: (Low to High)</option>
                        <option className="text-end" value="date recent">Date (Most Recent)</option>
                        <option className="text-end" value="date oldest">Date (Oldest)</option>
                        <option className="text-end" value="a-z">Alphabetical (A-Z)</option>
                        <option className="text-end" value="z-a">Alphabetical (Z-A)</option>
                    </select>
                </span>
            </div>
    );
}

export default FilterOptions;