
document.addEventListener('DOMContentLoaded', (event) => {
    let jsonData = [];

    function fetchJsonDataAndInitialize() {
        fetch("responses.json")
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                initializeDropdowns(); // Initialize dropdowns with 'All' option
                loadTableData(jsonData);
            })
            .catch(error => console.error('Error loading JSON data:', error));
    }

    // On window load
    window.onload = fetchJsonDataAndInitialize;

    // Function to initialize dropdowns with only 'All' option
    function initializeDropdowns() {
        const dropdownIds = ['nameFilter', 'pronounsFilter', 'majorFilter', 'schoolFilter', 'minorFilter', 'phoneFilter'];
        dropdownIds.forEach(dropdownId => {
            populateDropdown(dropdownId, new Set(['All']));
            document.getElementById(dropdownId).addEventListener('change', updateTableAndDropdowns);
        });
    }

    // Function to populate a dropdown
    function populateDropdown(dropdownId, options) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clear existing options
        options.forEach(option => {
            dropdown.options.add(new Option(option, option));
        });
    }

    // Function to update the table and other dropdowns based on the current selection
    function updateTableAndDropdowns() {
        const filteredData = getFilteredData();
        loadTableData(filteredData);
        updateDropdowns(filteredData);
    }

    // Function to get filtered data based on current dropdown selections
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

    // Function to update dropdowns based on filtered data
    function updateDropdowns(filteredData) {
        populateDropdown('nameFilter', new Set(['All'].concat(filteredData.map(item => item['First and Last Name']))));
        populateDropdown('pronounsFilter', new Set(['All'].concat(filteredData.map(item => item['What are your pronouns?']))));
        populateDropdown('majorFilter', new Set(['All'].concat(filteredData.map(item => item['Major(s)']))));
        populateDropdown('schoolFilter', new Set(['All'].concat(filteredData.map(item => item['Please select which school your major(s) is in.']))));
        populateDropdown('minorFilter', new Set(['All'].concat(filteredData.map(item => item['Minor(s) if applicable']))));
        populateDropdown('phoneFilter', new Set(['All'].concat(filteredData.map(item => item['Cell Phone Number']))));
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

            let schoolCell = row.insertCell();
            schoolCell.textContent = item['Please select which school your major(s) is in.'];

            let minorCell = row.insertCell();
            minorCell.textContent = item['Minor(s) if applicable'];

            let phoneCell = row.insertCell();
            phoneCell.textContent = item['Cell Phone Number'];

            // Add additional cells for any other data columns you have
        });
    }
});