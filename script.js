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
    this.timeSlots.push(timeSlot);
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

    for (let i = 9; i <= 17; i++) {
      const timeField = `Please list times you are UNAVAILABLE to host (meetings, work, other commitments) [${i}:00am-${
        i + 1
      }:00am]`;
      const className = data[timeField];
      if (className) {
        const timeSlot = new TimeSlot(`${i}:00am`, `${i + 1}:00am`, className);
        for (let scheduleDay of schedule) {
          scheduleDay.addTimeSlot(timeSlot);
        }
      }
    }

    return schedule;
  }

  toTableRow() {
    let scheduleStr = this.schedule
      .map((scheduleDay) =>
        scheduleDay.timeSlots
          .map(
            (timeSlot) =>
              `${scheduleDay.day} ${timeSlot.start}-${timeSlot.end}: ${timeSlot.className}`
          )
          .join(", ")
      )
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
    displayData(students, defaultFilters);
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

  function applyFilters() {
    const filters = {
      name: $("#nameFilter").val(),
      pronouns: $("#pronounsFilter").val(),
      major: $("#majorFilter").val(),
      school: $("#schoolFilter").val(),
      minor: $("#minorFilter").val(),
    };
    displayData(students, filters);
  }

  loadData();
});
