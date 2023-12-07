
function fetchJsonDataAndInitialize() {
    fetch("responses.json")
        .then(response => response.json())
        .then(data => {
            // Now jsonData contains your JSON data
            const jsonData = data;
            populateDropdowns(jsonData);
            loadTableData(jsonData);
        })
        .catch(error => console.error('Error loading JSON data:', error));
}

// On window load
window.onload = fetchJsonDataAndInitialize;

// Function to populate dropdowns
function populateDropdowns(data) {
    populateDropdown('nameFilter', new Set(data.map(item => item['First and Last Name'])));
    populateDropdown('pronounsFilter', new Set(data.map(item => item['What are your pronouns?'])));
    populateDropdown('majorFilter', new Set(data.map(item => item['Major(s)'])));
    // Add more dropdowns as needed
}

// Helper function to populate a dropdown
function populateDropdown(dropdownId, options) {
    const dropdown = document.getElementById(dropdownId);
    options.forEach(option => {
        if (option) { // Check if the option is not empty
            dropdown.options.add(new Option(option, option));
        }
    });
}

// Function to filter and display results
function filterResults() {
    const nameFilter = document.getElementById('nameFilter').value;
    const pronounsFilter = document.getElementById('pronounsFilter').value;
    const majorFilter = document.getElementById('majorFilter').value;
    // Add more filters as needed

    const filteredData = jsonData.filter(item =>
        (item['First and Last Name'] === nameFilter || nameFilter === 'All') &&
        (item['What are your pronouns?'] === pronounsFilter || pronounsFilter === 'All') &&
        (item['Major(s)'] === majorFilter || majorFilter === 'All')
        // Add more conditions for additional filters
    );

    loadTableData(filteredData);
}

// Function to load data into the table
function loadTableData(items) {
    const table = document.getElementById('tableData');
    table.innerHTML = ''; // Clear the table first

    items.forEach(item => {
        let row = table.insertRow();
        let nameCell = row.insertCell();
        nameCell.textContent = item['First and Last Name'];

        let pronounsCell = row.insertCell();
        pronounsCell.textContent = item['What are your pronouns?'];

        let majorCell = row.insertCell();
        majorCell.textContent = item['Major(s)'];

        // Add more cells for additional data columns
    });
}
