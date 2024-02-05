let students = [];
$(document).ready(function () {
  // Define the Student class
  class Student {
    constructor(data) {
      this.name = data["First and Last Name"];
      this.pronouns = data["What are your pronouns?"];
      this.major = data["Major(s)"];
      this.school = data["Please select which school your major(s) is in."];
      this.minor = data["Minor(s) if applicable"];
      this.unavailableTimes = this.extractUnavailableTimes(data);
      // ... extract other fields as needed
    }

    // Method to extract unavailable times from the data
    // Method to extract class schedules from the data
    extractClasses(data) {
      const classes = [];
      for (let i = 1; i <= 8; i++) {
        // Adjust the number based on how many sets of class data you have
        if (
          data[`Day(s) of the Week ${i}`] &&
          data[`Start Time ${i}`] &&
          data[`End Time ${i}`]
        ) {
          classes.push({
            days: data[`Day(s) of the Week ${i}`]
              .split(", ")
              .map((day) => day.trim()),
            startTime: data[`Start Time ${i}`],
            endTime: data[`End Time ${i}`],
            className: data[`Class Name and Section ${i}`],
            professor: data[`Professor First and Last Name ${i}`],
          });
        }
      }
      return classes;
    }

    // Method to extract unavailable times from the data
    extractUnavailableTimes(data) {
      const unavailableTimes = [];
      // Assuming your CSV has specific fields for unavailable times
      for (let i = 9; i <= 17; i++) {
        // Adjust based on your actual time slots
        if (
          data[
            `Please list times you are UNAVAILABLE to host (meetings, work, other commitments) [${i}:00am-${
              i + 1
            }:00am]`
          ]
        ) {
          unavailableTimes.push({
            time: `${i}:00am-${i + 1}:00am`,
            reason:
              data[
                `Please list times you are UNAVAILABLE to host (meetings, work, other commitments) [${i}:00am-${
                  i + 1
                }:00am]`
              ],
          });
        }
      }
      return unavailableTimes;
    }

    // Method to render this student as a table row
    toTableRow() {
      return `
                <tr>
                    <td>${this.name}</td>
                    <td>${this.pronouns}</td>
                    <td>${this.major}</td>
                    <td>${this.school}</td>
                    <td>${this.minor}</td>
                    <td>${this.unavailableTimes}</td>
                </tr>
            `;
    }

    // Method to check if this student matches the current filters
    matchesFilters(filters) {
      return (
        (filters.name === "All" || this.name === filters.name) &&
        (filters.pronouns === "All" || this.pronouns === filters.pronouns) &&
        (filters.major === "All" || this.major === filters.major) &&
        (filters.school === "All" || this.school === filters.school) &&
        (filters.minor === "All" || this.minor === filters.minor) &&
        // Add more conditions for each filter. For time filters, you'll need to compare times.
        // This is a placeholder, you'll need to implement your logic for day and time comparison
        (filters.day === "All" || this.unavailableTimes.includes(filters.day))
      );
    }
  }

  // Initialize a default filters object
  const defaultFilters = {
    name: "All",
    pronouns: "All",
    major: "All",
    school: "All",
    minor: "All",
    day: "All",
    startTime: "All",
    endTime: "All",
  };

  // Function to read the CSV file and parse it
  function loadData() {
    $.ajax({
      url: "responses_csv.csv",
      dataType: "text",
    }).done(successFunction);
  }

  function successFunction(data) {
    const parsedData = $.csv.toObjects(data);
    const students = parsedData.map((row) => new Student(row));
    displayData(students, defaultFilters); // Pass the default filters here
  }

  // Function to display the data in the table
  function displayData(students, filters) {
    const tableBody = $("#tableData");
    tableBody.empty();
    students.forEach((student) => {
      if (student.matchesFilters(filters)) {
        tableBody.append(student.toTableRow());
      }
    });
  }

  // Function to apply filters
  function applyFilters() {
    const filters = {
      name: $("#nameFilter").val(),
      pronouns: $("#pronounsFilter").val(),
      major: $("#majorFilter").val(),
      school: $("#schoolFilter").val(),
      minor: $("#minorFilter").val(),
      day: $("#dayFilter").val(),
      startTime: $("#startTimeFilter").val(),
      endTime: $("#endTimeFilter").val(),
    };
    displayData(students, filters);
  }

  // Load the data when the document is ready
  loadData();
});
