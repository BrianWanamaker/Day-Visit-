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
            // Split CSV text by new lines to get an array of rows
            const rows = csvText.split('\n').map(row => row.split(',')); // Simple CSV parsing

            // Convert rows to an array of objects
            const headers = rows[0];
            csvData = rows.slice(1).map(row => {
                let rowData = {};
                row.forEach((value, index) => {
                    rowData[headers[index]] = value;
                });
                return rowData;
            });

            initializeDropdowns();
            updateTable();
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

        // Add a cell for the class schedule, using the parseSchedule function to generate the content
        let scheduleCell = row.insertCell();
        scheduleCell.innerHTML = parseSchedule(item); // Call parseSchedule here to get the schedule HTML
    });
}

// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});
function parseSchedule(student) {
    let scheduleEntries = [];

    // Loop through the schedule fields based on a predefined pattern
    for (let i = 0; i <= 9; i++) {
        // Define column headers with the appropriate suffix
        let suffix = i === 0 ? '' : ` ${i}`;
        let dayKey = `Day(s) of the Week${suffix}`;
        let startTimeKey = `Start Time${suffix}`;
        let endTimeKey = `End Time${suffix}`;
        let classNameKey = `Class Name and Section${suffix}`;
        let professorNameKey = `Professor First and Last Name${suffix}`;

        // Process each day of the week separately
        let days = student[dayKey] ? student[dayKey].split(',') : [];
        days.forEach(day => {
            // Skip if the day is an empty string or only contains quotes
            if (day.replace(/['"]+/g, '').trim()) {
                let startTime = student[startTimeKey] ? student[startTimeKey].replace(/['"]+/g, '').trim() : 'TBD';
                let endTime = student[endTimeKey] ? student[endTimeKey].replace(/['"]+/g, '').trim() : 'TBD';
                let className = student[classNameKey] ? student[classNameKey].replace(/['"]+/g, '').trim() : 'Class not set';
                let professorName = student[professorNameKey] ? student[professorNameKey].replace(/['"]+/g, '').trim() : 'Professor not set';
                let scheduleStr = `${day.trim()}: ${startTime} - ${endTime}, ${className}, ${professorName}`;
                scheduleEntries.push(scheduleStr);
            }
        });
    }

    // Combine all schedule entries into one string separated by HTML line breaks
    return scheduleEntries.length > 0 ? scheduleEntries.join('<br>') : 'No schedule info available';
}


// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});