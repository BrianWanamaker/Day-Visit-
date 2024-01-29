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
    // Initialize an array to hold schedule strings
    let scheduleEntries = [];

    // Handle the first set of schedule data (without numeric suffix)
    let days = student["Day(s) of the Week"].split(',');
    let startTimes = student["Start Time"].split(',');
    let endTimes = student["End Time"].split(',');
    days.forEach((day, index) => {
        if (day.trim() && startTimes[index] && endTimes[index]) {
            let classAndProfessorInfo = student["Class Name and Section"] ? `${student["Class Name and Section"]}, ${student["Professor First and Last Name"]}` : '';
            scheduleEntries.push(`${day.trim()}: ${startTimes[index].trim()} - ${endTimes[index].trim()}, ${classAndProfessorInfo}`);
        }
    });

    // Repeat the process for the rest of the schedule data (with numeric suffixes)
    for (let i = 2; i <= 9; i++) {
        let dayKey = `Day(s) of the Week ${i}`;
        let startTimeKey = `Start Time ${i}`;
        let endTimeKey = `End Time ${i}`;
        let classNameKey = `Class Name and Section ${i}`;
        let professorNameKey = `Professor First and Last Name ${i}`;

        if (student[dayKey]) {
            let dayArray = student[dayKey].split(',');
            let startTimeArray = student[startTimeKey] ? student[startTimeKey].split(',') : [];
            let endTimeArray = student[endTimeKey] ? student[endTimeKey].split(',') : [];
            dayArray.forEach((day, index) => {
                if (day.trim() && startTimeArray[index] && endTimeArray[index]) {
                    let classAndProfessorInfo = student[classNameKey] ? `${student[classNameKey]}, ${student[professorNameKey]}` : '';
                    scheduleEntries.push(`${day.trim()}: ${startTimeArray[index].trim()} - ${endTimeArray[index].trim()}, ${classAndProfessorInfo}`);
                }
            });
        }
    }

    // Join the individual schedule entries with a line break
    return scheduleEntries.join('<br>') || 'No schedule info available';
}


// Add the event listener for the filter button and load data on DOMContentLoaded
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTable);
    fetchCsvDataAndInitialize();
});