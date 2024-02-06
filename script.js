class TimeSlot {
  constructor(start, end, className) {
    this.start = start;
    this.end = end;
    this.className = className;
  }
}

class Schedule {
  constructor(day) {
    this.day = day;
    this.timeSlots = [];
  }

  addTimeSlot(timeSlot) {
    // Only add the timeSlot if it doesn't already exist in this.timeSlots
    if (
      !this.timeSlots.some(
        (existingSlot) =>
          existingSlot.start === timeSlot.start &&
          existingSlot.end === timeSlot.end
      )
    ) {
      this.timeSlots.push(timeSlot);
    }
  }
}

class Student {
  constructor(data) {
    this.name = data["First and Last Name"];
    this.pronouns = data["What are your pronouns?"];
    this.major = data["Major(s)"];
    this.school = data["Please select which school your major(s) is in."];
    this.minor = data["Minor(s) if applicable"];
    this.schedule = this.extractSchedule(data);
  }

  extractSchedule(data) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const schedule = days.map((day) => new Schedule(day));

    // Extract class schedule
    for (let i = 1; i <= 3; i++) {
      const dayField = `Day(s) of the week [Class ${i}]`;
      const startTimeField = `Start Time [Class ${i}]`;
      const endTimeField = `End Time [Class ${i}]`;
      const classNameField = `Course Name [Class ${i}]`;

      const days = data[dayField] ? data[dayField].split(", ") : [];
      const startTime = data[startTimeField];
      const endTime = data[endTimeField];
      const className = data[classNameField];

      if (days.length && startTime && endTime && className) {
        const timeSlot = new TimeSlot(startTime, endTime, className);
        days.forEach((day) => {
          const scheduleDay = schedule.find((s) => s.day === day);
          if (scheduleDay) {
            scheduleDay.addTimeSlot(timeSlot);
          }
        });
      }
    }

    return schedule;
  }

  toTableRow() {
    let scheduleStr = this.schedule
      .map((scheduleDay) => {
        let timeSlotsStr = scheduleDay.timeSlots
          .map(
            (timeSlot) =>
              `${timeSlot.start}-${timeSlot.end}: ${timeSlot.className}`
          )
          .join(", ");
        return `${scheduleDay.day}: ${timeSlotsStr}`;
      })
      .join(", ");

    return `
      <tr>
        <td>${this.name}</td>
        <td>${this.pronouns}</td>
        <td>${this.major}</td>
        <td>${this.school}</td>
        <td>${this.minor}</td>
        <td>${scheduleStr}</td>
      </tr>
    `;
  }

  matchesFilters(filters) {
    return (
      (filters.name === "All" || this.name === filters.name) &&
      (filters.pronouns === "All" || this.pronouns === filters.pronouns) &&
      (filters.major === "All" || this.major === filters.major) &&
      (filters.school === "All" || this.school === filters.school) &&
      (filters.minor === "All" || this.minor === filters.minor)
    );
  }
}

let students = [];
let applyFilters;

$(document).ready(function () {
  const defaultFilters = {
    name: "All",
    pronouns: "All",
    major: "All",
    school: "All",
    minor: "All",
  };

  function loadData() {
    $.ajax({
      url: "responses_csv.csv",
      dataType: "text",
    }).done(successFunction);
  }

  function successFunction(data) {
    const parsedData = $.csv.toObjects(data);
    students = parsedData.map((row) => new Student(row));
    populateFilters(students);
    displayData(students, defaultFilters);
  }

  function populateFilters(students) {
    const names = new Set(students.map((student) => student.name));
    const pronouns = new Set(students.map((student) => student.pronouns));
    const majors = new Set(students.map((student) => student.major));
    const schools = new Set(students.map((student) => student.school));
    const minors = new Set(students.map((student) => student.minor));

    populateDropdown("#nameFilter", names);
    populateDropdown("#pronounsFilter", pronouns);
    populateDropdown("#majorFilter", majors);
    populateDropdown("#schoolFilter", schools);
    populateDropdown("#minorFilter", minors);
  }

  function populateDropdown(dropdownId, options) {
    const dropdown = $(dropdownId);
    options.forEach((option) => {
      dropdown.append(new Option(option, option));
    });
  }

  function displayData(students, filters) {
    const tableBody = $("#tableData");
    tableBody.empty();
    students.forEach((student) => {
      if (student.matchesFilters(filters)) {
        tableBody.append(student.toTableRow());
      }
    });
  }

  applyFilters = function () {
    const filters = {
      name: $("#nameFilter").val(),
      pronouns: $("#pronounsFilter").val(),
      major: $("#majorFilter").val(),
      school: $("#schoolFilter").val(),
      minor: $("#minorFilter").val(),
    };
    displayData(students, filters);
  };

  loadData();
});

window.applyFilters = applyFilters;
