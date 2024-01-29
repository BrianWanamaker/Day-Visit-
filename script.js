let csvData = [];

const filters = {
    'nameFilter': 'First and Last Name',
    'pronounsFilter': 'What are your pronouns?',
    'majorFilter': 'Major(s)',
    'schoolFilter': 'Please select which school your major(s) is in.',
    'minorFilter': 'Minor(s) if applicable'
};

// Function to fetch and initialize CSV data
function fetchCsvDataAndInitialize() {
    fetch('responses_csv.csv')
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    csvData = results.data;
                    initializeDropdowns();
                    updateTable();
                }
            });
        })
        .catch(error => {
            console.error('Error loading CSV data:', error);
        });
}

// Function to initialize dropdowns based on data
function initializeDropdowns() {
    const fields = ['First and Last Name', 'What are your pronouns?', 'Major(s)', 'Please select which school your major(s) is in.', 'Minor(s) if applicable'];
    const dropdownIds = ['nameFilter', 'pronounsFilter', 'majorFilter', 'schoolFilter', 'minorFilter'];

    fields.forEach((field, index) => {
        updateDropdown(dropdownIds[index], field, csvData.map(item => item[field]));
    });

    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', updateTable);
    });
}

// Function to update a specific dropdown with unique values
function updateDropdown(dropdownId, field, values) {
    let dropdown = document.getElementById(dropdownId);
    let uniqueValues = [...new Set(values.filter(Boolean))]; // Remove empty, null, and duplicate values
    dropdown.innerHTML = ''; // Clear existing options

    // Add 'All' option
    dropdown.appendChild(new Option(`All ${field}`, 'All', true, true));

    // Add remaining unique options
    uniqueValues.forEach(value => {
        dropdown.appendChild(new Option(value, value));
    });
}

// Function to filter data based on current dropdown selections
function getFilteredData() {
    const filters = {
        'nameFilter': 'First and Last Name',
        'pronounsFilter': 'What are your pronouns?',
        'majorFilter': 'Major(s)',
        'schoolFilter': 'Please select which school your major(s) is in.',
        'minorFilter': 'Minor(s) if applicable'
    };

    return csvData.filter(item => {
        return Object.entries(filters).every(([dropdownId, field]) => {
            const filterValue = document.getElementById(dropdownId).value;
            return filterValue === 'All' || item[field] === filterValue;
        });
    });
}

// Function to update the table based on the filtered data
function updateTable() {
    const filteredData = getFilteredData();
    const tableBody = document.getElementById('tableData');
    tableBody.innerHTML = ''; // Clear existing table rows

    filteredData.forEach(item => {
        let row = tableBody.insertRow();
        Object.values(filters).forEach(field => {
            row.insertCell().textContent = item[field];
        });

        // Add a cell for the class schedule
        let scheduleCell = row.insertCell();
        scheduleCell.innerHTML = item['schedule'] || 'No schedule info available';
    });
}

// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});
function parseSchedule(student) {
    // Initialize an array to hold schedule strings
    let scheduleEntries = [];

    // Loop through each possible schedule set based on your CSV structure
    for (let i = 1; i <= 9; i++) {
        let dayKey = `Day(s) of the Week${i > 1 ? ' ' + i : ''}`;
        let startTimeKey = `Start Time${i > 1 ? ' ' + i : ''}`;
        let endTimeKey = `End Time${i > 1 ? ' ' + i : ''}`;
        let classNameKey = `Class Name and Section${i > 1 ? ' ' + i : ''}`;
        let professorNameKey = `Professor First and Last Name${i > 1 ? ' ' + i : ''}`;

        // Check if the student has data for this set of schedule
        if (student[dayKey] || student[startTimeKey] || student[endTimeKey]) {
            let days = student[dayKey] || 'N/A';
            let startTime = student[startTimeKey] || 'N/A';
            let endTime = student[endTimeKey] || 'N/A';
            let className = student[classNameKey] || 'N/A';
            let professorName = student[professorNameKey] || 'N/A';

            // Construct the schedule string for this set
            let scheduleStr = `${days}: ${startTime} - ${endTime}, ${className}, ${professorName}`;
            scheduleEntries.push(scheduleStr);
        }
    }

    // Join all the schedule strings with a break line
    return scheduleEntries.join('<br>') || 'No schedule info available';
}

// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});