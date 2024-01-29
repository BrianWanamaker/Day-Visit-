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

    // Initialize the dayFilter dropdown
    const dayDropdown = document.getElementById('dayFilter');
    dayDropdown.addEventListener('change', updateTable);

    // Initialize time filters
    const startTimeFilter = document.getElementById('startTimeFilter');
    const endTimeFilter = document.getElementById('endTimeFilter');
    startTimeFilter.addEventListener('change', updateTable);
    endTimeFilter.addEventListener('change', updateTable);
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
    // Get day and time filter values
    const dayFilterValue = document.getElementById('dayFilter').value;
    const startTimeFilterValue = document.getElementById('startTimeFilter').value;
    const endTimeFilterValue = document.getElementById('endTimeFilter').value;

    return csvData.filter(item => {
        return Object.entries(filters).every(([dropdownId, field]) => {
            const filterValue = document.getElementById(dropdownId).value;
            return filterValue === 'All' || item[field] === filterValue;
        }) && (dayFilterValue === 'All' || (item['Day(s) of the Week'] && item['Day(s) of the Week'].includes(dayFilterValue)))
            && (!startTimeFilterValue || (item['Start Time'] && item['Start Time'] >= startTimeFilterValue))
            && (!endTimeFilterValue || (item['End Time'] && item['End Time'] <= endTimeFilterValue));
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
function parseSchedule(student) {
    let scheduleEntries = [];

    // Loop through the schedule fields based on a predefined pattern
    for (let i = 0; i <= 9; i++) {
        let suffix = i === 0 ? '' : ` ${i}`;
        let dayKey = `Day(s) of the Week${suffix}`;
        let startTimeKey = `Start Time${suffix}`;
        let endTimeKey = `End Time${suffix}`;
        let classNameKey = `Class Name and Section${suffix}`;
        let professorNameKey = `Professor First and Last Name${suffix}`;

        if (student[dayKey] && student[startTimeKey] && student[classNameKey]) {
            // Assuming the day field contains multiple days separated by commas
            let days = student[dayKey].split(',');
            days.forEach(day => {
                // Ensure the day string is valid
                if (day.replace(/['"]+/g, '').trim()) {
                    let startTime = student[startTimeKey].replace(/['"]+/g, '').trim();
                    let endTime = student[endTimeKey] ? student[endTimeKey].replace(/['"]+/g, '').trim() : 'TBD';
                    let className = student[classNameKey].replace(/['"]+/g, '').trim();
                    let professorName = student[professorNameKey] ? student[professorNameKey].replace(/['"]+/g, '').trim() : 'Professor not set';
                    let scheduleStr = `${day.trim()}: ${className} with ${professorName} from ${startTime} to ${endTime}`;
                    scheduleEntries.push(scheduleStr);
                }
            });
        }
    }

    // Combine all schedule entries into one string separated by HTML line breaks
    return scheduleEntries.length > 0 ? scheduleEntries.join('<br>') : '';
}


// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});
