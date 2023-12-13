let jsonData = []; // This should be at the top level of your script, outside any function

function fetchJsonDataAndInitialize() {
    fetch("responses.json")
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            initializeDropdowns();
            updateTableAndDropdowns();
        })
        .catch(error => {
            console.error('Error loading JSON data:', error);
        });
}

// Initialize dropdowns with 'All' options
function initializeDropdowns() {
    updateDropdown('nameFilter', 'Names', jsonData.map(item => item['First and Last Name']));
    updateDropdown('pronounsFilter', 'Pronouns', jsonData.map(item => item['What are your pronouns?']));
    updateDropdown('majorFilter', 'Majors', jsonData.map(item => item['Major(s)']));
    updateDropdown('schoolFilter', 'School', jsonData.map(item => item['Please select which school your major(s) is in.']));
    updateDropdown('minorFilter', 'Minors', jsonData.map(item => item['Minor(s) if applicable']));
    updateDropdown('phoneFilter', 'Phone Numbers', jsonData.map(item => item['Cell Phone Number']));

    // Attach change event listeners to dropdowns
    document.getElementById('nameFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('pronounsFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('majorFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('schoolFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('minorFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('phoneFilter').addEventListener('change', updateTableAndDropdowns);
}


// Update a specific dropdown with unique values
function updateDropdown(dropdownId, category, values) {
    let dropdown = document.getElementById(dropdownId);
    let selectedValue = dropdown.value; // Get the currently selected value
    let uniqueValues = [...new Set(values.filter(Boolean))]; // Remove empty, null, and duplicate values
    dropdown.innerHTML = ''; // Clear existing options

    // Add the currently selected option first if it's not 'All'
    if (selectedValue !== 'All' && uniqueValues.includes(selectedValue)) {
        dropdown.appendChild(new Option(selectedValue, selectedValue, true, true));
    }

    // Add 'All' option
    dropdown.appendChild(new Option(`All ${category}`, 'All', selectedValue === 'All'));

    // Add remaining unique options
    uniqueValues.forEach(value => {
        if (value !== selectedValue) {
            dropdown.appendChild(new Option(value, value));
        }
    });
}


window.onload = fetchJsonDataAndInitialize;

// Function to filter data based on current dropdown selections
function getFilteredData() {
    const nameFilter = document.getElementById('nameFilter').value;
    const pronounsFilter = document.getElementById('pronounsFilter').value;
    const majorFilter = document.getElementById('majorFilter').value;
    const schoolFilter = document.getElementById('schoolFilter').value;
    const minorFilter = document.getElementById('minorFilter').value;
    const phoneFilter = document.getElementById('phoneFilter').value;

    // Normalize filters to ensure consistent comparison
    const normalize = text => text && text.toLowerCase().trim();

    return jsonData.filter(item => {
        const nameMatches = nameFilter === 'All' || normalize(item['First and Last Name']) === normalize(nameFilter);
        const pronounsMatches = pronounsFilter === 'All' || normalize(item['What are your pronouns?']) === normalize(pronounsFilter);
        const majorMatches = majorFilter === 'All' || normalize(item['Major(s)']) === normalize(majorFilter);
        const schoolMatches = schoolFilter === 'All' || normalize(item['Please select which school your major(s) is in.']) === normalize(schoolFilter);
        const minorMatches = minorFilter === 'All' || normalize(item['Minor(s) if applicable']) === normalize(minorFilter);
        const phoneMatches = phoneFilter === 'All' || normalize(item['Cell Phone Number']) === normalize(phoneFilter);

        return nameMatches && pronounsMatches && majorMatches && schoolMatches && minorMatches && phoneMatches;
    });
}


// Function to update the table based on the filtered data
function updateTableAndDropdowns() {
    const filteredData = getFilteredData();
    loadTableData(filteredData);
    // Reinitialize dropdowns with filtered data while keeping the selected option at the top
    initializeDropdowns();
}

function loadTableData(items) {
    const table = document.getElementById('tableData');
    table.innerHTML = ''; // Clear the table first

    items.forEach(item => {
        let row = table.insertRow();
        row.insertCell().textContent = item['First and Last Name'];
        row.insertCell().textContent = item['What are your pronouns?'];
        row.insertCell().textContent = item['Major(s)'];
        row.insertCell().textContent = item['Please select which school your major(s) is in.'];
        row.insertCell().textContent = item['Minor(s) if applicable'];
        row.insertCell().textContent = item['Cell Phone Number'];
        row.insertCell().textContent = item['QU Email Address'];

        // Add a cell for the class schedule
        let scheduleCell = row.insertCell();
        scheduleCell.textContent = formatSchedule(item.schedule || []);
    });
}

function formatSchedule(schedule) {
    if (!schedule || schedule.length === 0) {
        return "No schedule info available";
    }
    return schedule.map(s => `${s.day}: ${s.startTime} - ${s.endTime}`).join(', ');
}


// Add the event listener for the filter button
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTableAndDropdowns);
    fetchJsonDataAndInitialize(); // Call this function directly, no need for window.onload
});

function parseSchedule(student) {
    return student["Day(s) of the Week"].map((days, index) => {
        if (days) {
            return days.split(',').map(day => ({
                day: day.trim(),
                startTime: student["Start Time"][index],
                endTime: student["End Time"][index]
            }));
        }
        return [];
    }).flat();
}

// Example usage:
let students = jsonData.map(student => ({
    ...student,
    schedule: parseSchedule(student)
}));

function isAvailable(schedule, day, startTime, endTime) {
    // Convert times to a comparable format (e.g., minutes since midnight)
    const convertTime = time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const start = convertTime(startTime);
    const end = convertTime(endTime);

    return schedule.every(classSession => {
        if (classSession.day !== day) return true;

        const classStart = convertTime(classSession.startTime);
        const classEnd = convertTime(classSession.endTime);

        // Check if the time range overlaps with class time
        return end <= classStart || start >= classEnd;
    });
}
function applyFilters() {
    const day = document.getElementById('dayFilter').value;
    const startTime = document.getElementById('startTimeFilter').value;
    const endTime = document.getElementById('endTimeFilter').value;

    const availableStudents = students.filter(student =>
        isAvailable(student.schedule, day, startTime, endTime)
    );

    // Update the table with availableStudents
    loadTableData(availableStudents);
}


