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
    }

    // Update a specific dropdown with unique values
    function updateDropdown(dropdownId, category, values) {
        let dropdown = document.getElementById(dropdownId);
        let uniqueValues = [...new Set(values.filter(Boolean))]; // Remove empty, null, and duplicate values
        dropdown.innerHTML = ''; // Clear existing options
        dropdown.appendChild(new Option(`All ${category}`, 'All')); // Add 'All' option

        uniqueValues.forEach(value => {
            dropdown.appendChild(new Option(value, value));
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

    return jsonData.filter(item =>
        (nameFilter === 'All' || item['First and Last Name'] === nameFilter) &&
        (pronounsFilter === 'All' || item['What are your pronouns?'] === pronounsFilter) &&
        (majorFilter === 'All' || item['Major(s)'] === majorFilter) &&
        (schoolFilter === 'All' || item['Please select which school your major(s) is in.'] === schoolFilter) &&
        (minorFilter === 'All' || item['Minor(s) if applicable'] === minorFilter) &&
        (phoneFilter === 'All' || item['Cell Phone Number'] === phoneFilter)
    );
}

// Function to update the table based on the filtered data
function updateTableAndDropdowns() {
    const filteredData = getFilteredData();
    loadTableData(filteredData);
    // Reinitialize dropdowns with filtered data while keeping the selected option at the top
    initializeDropdowns();
}

// Function to load data into the table
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
        // Add additional cells for any other data columns you have
    });
}

// Add the event listener for the filter button
document.querySelector('button').addEventListener('click', updateTableAndDropdowns);
window.onload = fetchJsonDataAndInitialize;
// Add the event listener for the filter button
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('button').addEventListener('click', updateTableAndDropdowns);
    fetchJsonDataAndInitialize(); // Call this function directly, no need for window.onload
});
