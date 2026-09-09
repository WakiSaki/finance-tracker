
function getDateInterval(dateOption) {
    const intervals = {
        "30days": "30 days",
        "3months": "3 months",
        "6months": "6 months",
        "1year": "1 year",
        "2years": "2 years"
    };

    return intervals[dateOption] || null;
}

module.exports = { getDateInterval };