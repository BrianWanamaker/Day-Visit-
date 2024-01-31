$(document).ready(function () {
    let csvData = [];
    const filters = {
        'nameFilter': 'First and Last Name',
        'pronounsFilter': 'What are your pronouns?',
        'majorFilter': 'Major(s)',
        'schoolFilter': 'Please select which school your major(s) is in.',
        'minorFilter': 'Minor(s) if applicable'
    };

    function fetchCsvDataAndInitialize() {
        $.ajax({
            url: 'responses_csv.csv',
            dataType: 'text',
            success: function (data) {
                // Convert the CSV data to objects
                csvData = $.csv.toObjects(data);
                initializeDropdowns();
                updateTable();
            }
        });
    }

    function initializeDropdowns() {
        // Populate dropdowns based on CSV data
        Object.keys(filters).forEach(function (filter) {
            updateDropdown(filter, filters[filter], csvData.map(item => item[filters[filter]]));
        });
    }

    function updateDropdown(dropdownId, fieldName, values) {
        let uniqueValues = [...new Set(values)];
        let dropdown = $(`#${dropdownId}`);
        dropdown.empty();
        dropdown.append(new Option(`All ${fieldName}`, 'All', true, true));
        uniqueValues.forEach(function (value) {
            if (value) { // Avoid adding empty values
                dropdown.append(new Option(value, value));
            }
        });
    }

    function getFilteredData() {
        return csvData.filter(function (item) {
            return Object.entries(filters).every(function ([key, value]) {
                let filterValue = $(`#${key}`).val();
                return filterValue === 'All' || item[value] === filterValue;
            });
        });
    }

    function updateTable() {
        const filteredData = getFilteredData();
        const tableBody = $('#tableData');
        tableBody.empty();

        filteredData.forEach(function (item) {
            if (item['First and Last Name'] && item['First and Last Name'].trim()) {
                let row = $('<tr></tr>');
                Object.values(filters).forEach(function (fieldName) {
                    let cellValue = item[fieldName] && typeof item[fieldName] === 'string' ? item[fieldName].trim() : '';
                    row.append($('<td></td>').text(cellValue));
                });

                let scheduleContent = parseSchedule(item);
                row.append($('<td></td>').html(scheduleContent ? scheduleContent : ''));
                tableBody.append(row);
            }
        });
    }

    function parseSchedule(student) {
        let scheduleEntries = [];
    
        // Loop through the possible schedule slots (up to 9 based on your CSV structure)
        for (let i = 0; i <= 9; i++) {
            let suffix = i === 0 ? '' : ` ${i}`;
            let dayKey = `Day(s) of the Week${suffix}`;
            let startTimeKey = `Start Time${suffix}`;
            let endTimeKey = `End Time${suffix}`;
            let classNameKey = `Class Name and Section${suffix}`;
            let professorNameKey = `Professor First and Last Name${suffix}`;
    
            // Check if the day of the week is defined for the current slot
            if (student[dayKey]) {
                // Assume days are comma-separated and split them
                let days = student[dayKey].split(',');
                days.forEach(day => {
                    // Trim each day and build the schedule string
                    day = day.trim();
                    let startTime = student[startTimeKey] ? student[startTimeKey].trim() : 'TBD';
                    let endTime = student[endTimeKey] ? student[endTimeKey].trim() : 'TBD';
                    let className = student[classNameKey] ? student[classNameKey].trim() : 'No class name';
                    let professorName = student[professorNameKey] ? student[professorNameKey].trim() : 'No professor';
    
                    let scheduleStr = `${day}: ${className} with ${professorName} from ${startTime} to ${endTime}`;
                    scheduleEntries.push(scheduleStr);
                });
            }
        }
    
        // Combine all schedule entries into one string with line breaks
        return scheduleEntries.join('<br>');
    }
    

    // Event listeners
    $('select').on('change', updateTable);
    $('button').on('click', updateTable);

    // Initial data load
    fetchCsvDataAndInitialize();
});