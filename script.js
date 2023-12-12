document.addEventListener('DOMContentLoaded', (event) => {
    let jsonData = [];

    function fetchJsonDataAndInitialize() {
        fetch("responses.json")
            .then(response => response.json())
            .then(data => {
                jsonData = data;
                console.log("JSON Data Loaded:", jsonData); // Log to verify data
                initializeDropdowns();
                updateTableAndDropdowns();
            })
            .catch(error => {
                console.error('Error loading JSON data:', error);
                console.error('Make sure responses.json is in the correct location and properly formatted.');
            });
    }

    // On window load
    window.onload = fetchJsonDataAndInitialize;

    // Function to initialize dropdowns with only 'All' option
    function initializeDropdowns() {
        const dropdownIds = ['nameFilter', 'pronounsFilter', 'majorFilter', 'schoolFilter', 'minorFilter', 'phoneFilter'];
        dropdownIds.forEach(dropdownId => {
            populateDropdown(dropdownId, ['All'], 'All');
            document.getElementById(dropdownId).addEventListener('change', updateTableAndDropdowns);
        });
    }

    // Function to populate a dropdown and set the current selection
    function populateDropdown(dropdownId, options, currentValue) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.innerHTML = ''; // Clear existing options

        options.forEach(option => {
            let optionElement = new Option(option, option);
            optionElement.selected = (option === currentValue); // Set the selected attribute based on currentValue
            dropdown.appendChild(optionElement);
        });
    }


    // Function to update the table and dropdowns based on the current selection
    function updateTableAndDropdowns() {
        const filteredData = getFilteredData();
        loadTableData(filteredData);

        populateDropdown('nameFilter', ['All'].concat(filteredData.map(item => item['First and Last Name'])), document.getElementById('nameFilter').value);
        populateDropdown('pronounsFilter', ['All'].concat(filteredData.map(item => item['What are your pronouns?'])), document.getElementById('pronounsFilter').value);
        populateDropdown('majorFilter', ['All'].concat(filteredData.map(item => item['Major(s)'])), document.getElementById('majorFilter').value);
        populateDropdown('schoolFilter', ['All'].concat(filteredData.map(item => item['Please select which school your major(s) is in.'])), document.getElementById('schoolFilter').value);
        populateDropdown('minorFilter', ['All'].concat(filteredData.map(item => item['Minor(s) if applicable'])), document.getElementById('minorFilter').value);
        populateDropdown('phoneFilter', ['All'].concat(filteredData.map(item => item['Cell Phone Number'])), document.getElementById('phoneFilter').value);
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
        populateDropdown('nameFilter', getUniqueValidOptions(filteredData, 'First and Last Name'), document.getElementById('nameFilter').value);
        populateDropdown('pronounsFilter', getUniqueValidOptions(filteredData, 'What are your pronouns?'), document.getElementById('pronounsFilter').value);
        populateDropdown('majorFilter', getUniqueValidOptions(filteredData, 'Major(s)'), document.getElementById('majorFilter').value);
        populateDropdown('schoolFilter', getUniqueValidOptions(filteredData, 'Please select which school your major(s) is in.'), document.getElementById('schoolFilter').value);
        populateDropdown('minorFilter', getUniqueValidOptions(filteredData, 'Minor(s) if applicable'), document.getElementById('minorFilter').value);
        populateDropdown('phoneFilter', getUniqueValidOptions(filteredData, 'Cell Phone Number'), document.getElementById('phoneFilter').value);
    }
    
    // Helper function to get unique and valid options (non-empty and non-undefined) for a dropdown
    function getUniqueValidOptions(data, key) {
        let options = new Set();
        options.add('All'); // Add 'All' as the first option
        data.forEach(item => {
            let value = item[key];
            if (value && value.trim() !== '') { // Check for non-empty and non-undefined values
                options.add(value);
            }
        });
        return Array.from(options);
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
