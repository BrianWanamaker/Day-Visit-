$(document).ready(function () {

    const filters = {
        'nameFilter': 'First and Last Name',
        'pronounsFilter': 'What are your pronouns?',
        'majorFilter': 'Major(s)',
        'schoolFilter': 'Please select which school your major(s) is in.',
        'minorFilter': 'Minor(s) if applicable'
    };
    
    const csvFileUrl = 'responses_csv.csv';
    var data = $.csv.toObjects(csvFileUrl);
    console.log(data);

    function fetchCsvDataAndInitialize() {
        $.ajax({
            url: csvFileUrl,
            dataType: 'text',
            success: function (data) {
                const csvData = $.csv.toObjects(data);
                initializeDropdowns(csvData);
                updateTable(csvData);
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

    function updateTable(csvData) {
        const filteredData = getFilteredData(csvData);
        const tableBody = $('#tableData');
        tableBody.empty();

        filteredData.forEach(function (item) {
            const row = $('<tr></tr>');
            // Add cells for each column...
            const unavailableTimes = compileSchedule(item);
            row.append($('<td></td>').html(unavailableTimes));
            tableBody.append(row);
        });
    }

    function compileSchedule(student) {
        let scheduleEntries = [];

        // Loop through the possible schedule slots
        for (let i = 0; i <= 9; i++) {
            let suffix = i === 0 ? '' : ` ${i}`;
            let dayKey = `Day(s) of the Week${suffix}`;
            let startTimeKey = `Start Time${suffix}`;
            let endTimeKey = `End Time${suffix}`;
            let classNameKey = `Class Name and Section${suffix}`;
            let professorNameKey = `Professor First and Last Name${suffix}`;
            console.log(suffix);
            console.log(dayKey);
            console.log(startTimeKey);
            console.log(endTimeKey);
            console.log(classNameKey);
            console.log(professorNameKey);
            // Assuming that each student could have classes on multiple days, split the days
            let days = student[dayKey] ? student[dayKey].split(',') : [];

            days.forEach(day => {
                day = day.trim(); // Trim each day of any whitespace
                if (day) { // If there is a day listed
                    let startTime = student[startTimeKey] ? student[startTimeKey].trim() : 'TBD';
                    let endTime = student[endTimeKey] ? student[endTimeKey].trim() : 'TBD';
                    let className = student[classNameKey] ? student[classNameKey].trim() : 'No class name';
                    let professorName = student[professorNameKey] ? student[professorNameKey].trim() : 'No professor';

                    // Format the string as "Day: StartTime - EndTime, ClassName with ProfessorName"
                    let scheduleStr = `${day}: ${startTime} - ${endTime}, ${className} with ${professorName}`;
                    scheduleEntries.push(scheduleStr);
                }
            });
        }

        // Combine all schedule entries into one string separated by HTML line breaks
        return scheduleEntries.join('<br>');
    }


    // Event listeners
    $('select').on('change', updateTable);
    $('button').on('click', updateTable);

    // Initial data load
    fetchCsvDataAndInitialize();
});
