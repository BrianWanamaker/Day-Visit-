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

        let allText = `All ${dropdownId.replace('Filter', '')}`;
        if (dropdownId === 'phoneFilter') allText = 'All Phone Numbers';
        dropdown.options.add(new Option(allText, 'All', currentValue === 'All'));

        options.forEach(option => {
            if (option !== 'All') {
                dropdown.options.add(new Option(option, option, option === currentValue));
            }
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

    // Helper function to get unique options (non-empty and non-undefined) for a dropdown
    function getUniqueOptions(data, key) {
        let options = new Set();
        data.forEach(item => {
            let value = item[key];
            if (value && value.trim() !== '') {
                options.add(value);
            }
        });
        return Array.from(options);
    }

    // Function to update dropdowns based on filtered data
    function updateDropdowns(filteredData) {
        populateDropdown('nameFilter', getUniqueOptions(filteredData, 'First and Last Name'), document.getElementById('nameFilter').value);
        populateDropdown('pronounsFilter', getUniqueOptions(filteredData, 'What are your pronouns?'), document.getElementById('pronounsFilter').value);
        populateDropdown('majorFilter', getUniqueOptions(filteredData, 'Major(s)'), document.getElementById('majorFilter').value);
        populateDropdown('schoolFilter', getUniqueOptions(filteredData, 'Please select which school your major(s) is in.'), document.getElementById('schoolFilter').value);
        populateDropdown('minorFilter', getUniqueOptions(filteredData, 'Minor(s) if applicable'), document.getElementById('minorFilter').value);
        populateDropdown('phoneFilter', getUniqueOptions(filteredData, 'Cell Phone Number'), document.getElementById('phoneFilter').value);
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
