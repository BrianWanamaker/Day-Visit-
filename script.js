let jsonData = [];

function fetchJsonDataAndInitialize() {
    fetch("responses.json")
        .then(response => response.json())
        .then(data => {
            // First, parse the schedules for each student
            jsonData = data.map(student => ({
                ...student,
                schedule: parseSchedule(student)
            }));
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

    // Attach change event listeners to dropdowns
    document.getElementById('nameFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('pronounsFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('majorFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('schoolFilter').addEventListener('change', updateTableAndDropdowns);
    document.getElementById('minorFilter').addEventListener('change', updateTableAndDropdowns);
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

    // Normalize filters to ensure consistent comparison
    const normalize = text => text && text.toLowerCase().trim();

    return jsonData.filter(item => {
        const nameMatches = nameFilter === 'All' || normalize(item['First and Last Name']) === normalize(nameFilter);
        const pronounsMatches = pronounsFilter === 'All' || normalize(item['What are your pronouns?']) === normalize(pronounsFilter);
        const majorMatches = majorFilter === 'All' || normalize(item['Major(s)']) === normalize(majorFilter);
        const schoolMatches = schoolFilter === 'All' || normalize(item['Please select which school your major(s) is in.']) === normalize(schoolFilter);
        const minorMatches = minorFilter === 'All' || normalize(item['Minor(s) if applicable']) === normalize(minorFilter);

        return nameMatches && pronounsMatches && majorMatches && schoolMatches && minorMatches;
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
    table.innerHTML = '';

    items.forEach(item => {
        let row = table.insertRow();
        row.insertCell().textContent = item['First and Last Name'];
        row.insertCell().textContent = item['What are your pronouns?'];
        row.insertCell().textContent = item['Major(s)'];
        row.insertCell().textContent = item['Please select which school your major(s) is in.'];
        row.insertCell().textContent = item['Minor(s) if applicable'];
        // Add a cell for the class schedule
        let scheduleCell = row.insertCell();
        scheduleCell.innerHTML = formatSchedule(item.schedule || []);
    });
}

function formatSchedule(schedule) {
    if (!schedule || schedule.length === 0) {
        return "No schedule info available";
    }

    let scheduleByDay = {};
    schedule.forEach(s => {
        if (!scheduleByDay[s.day]) {
            scheduleByDay[s.day] = [];
        }
        scheduleByDay[s.day].push(`${formatTime(s.startTime)} - ${formatTime(s.endTime)}`);
    });

    let formattedSchedule = [];
    for (let day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]) {
        if (scheduleByDay[day]) {
            formattedSchedule.push(`<strong>${day}</strong>: ${scheduleByDay[day].join(', ')}`);
        }
    }

    return formattedSchedule.join('<br>');
}


function formatTime(time) {
    if (!time || time.includes('NaN') || time.includes('Undefined')) {
        return 'Invalid time';
    }

    // Validate the time format (e.g., '10:00:00 AM')
    const timePattern = /^(1[0-2]|0?[1-9]):[0-5][0-9]:[0-5][0-9] (AM|PM)$/;
    if (!timePattern.test(time)) {
        return 'Invalid time';
    }

    // Extract hours, minutes, and AM/PM from the time string
    let [timePart, ampm] = time.split(' ');
    let [hours, minutes] = timePart.split(':');

    // Return time in 'HH:MM AM/PM' format
    return `${hours}:${minutes} ${ampm}`;
}

// Add the event listener for the filter button
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTableAndDropdowns);
    fetchJsonDataAndInitialize(); // Call this function directly, no need for window.onload
}); function parseSchedule(student) {
    // Helper function to convert time string to a number for comparison
    const timeToNumber = (timeStr) => {
        if (!timeStr || timeStr.trim() === '') return null;
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    };

    // Convert all start times to numbers for comparison
    let startTimes = student["Start Time"].map(timeToNumber);
    let endTimes = student["End Time"];  // Use as is for now, we'll handle empty entries later
    let individualEndTime = student["End time"] ? student["End time"].trim() : null;
    let individualEndTimeNumber = individualEndTime ? timeToNumber(individualEndTime) : null;

    // Insert/update the individualEndTime in the correct slot if it exists
    if (individualEndTimeNumber !== null) {
        let inserted = false;
        for (let i = 0; i < startTimes.length; i++) {
            if (startTimes[i] !== null && startTimes[i] < individualEndTimeNumber &&
                (i === startTimes.length - 1 || startTimes[i + 1] > individualEndTimeNumber)) {
                if (!endTimes[i] || timeToNumber(endTimes[i]) > individualEndTimeNumber) {
                    endTimes[i] = individualEndTime;  // Insert or update the individualEndTime
                    inserted = true;
                    break;
                }
            }
        }

        // If it wasn't inserted and is earlier than all start times, add at the start
        if (!inserted) {
            startTimes.unshift(individualEndTimeNumber);
            endTimes.unshift(individualEndTime);
        }
    }

    // Build the schedule combining days with start times and end times, handle empty end times
    let schedule = student["Day(s) of the Week"].flatMap((days, index) => {
        if (!days) return [];  // Skip if no days

        return days.split(',').map(day => ({
            day: day.trim(),
            startTime: student["Start Time"][index] || "",  // Use empty string if no start time
            endTime: endTimes[index] || individualEndTime || ""  // Use end time if available, individual end time if not, otherwise empty
        }));
    });

    return schedule;
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


