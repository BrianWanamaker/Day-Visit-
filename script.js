class TimeSlot {
  constructor(start, end, className, professor) {
    this.start = start;
    this.end = end;
    this.className = className;
    this.professor = professor;
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
    const schedule = [];

    for (let i = 0; i < data["Day(s) of the Week"].length; i++) {
      if (
        data["Day(s) of the Week"][i] &&
        data["Start Time"][i] &&
        data["End Time"][i]
      ) {
        const days = data["Day(s) of the Week"][i].split(", ");
        const startTime = data["Start Time"][i];
        const endTime = data["End Time"][i];
        const className = data["Class Name and Section"][i];
        const professor = data["Professor First and Last Name"][i];

        days.forEach((day) => {
          const timeSlot = new TimeSlot(
            startTime,
            endTime,
            className,
            professor
          );
          if (!schedule[day]) {
            schedule[day] = [];
          }
          schedule[day].push(timeSlot);
        });
      }
    }

    return schedule;
  }

  toTableRow() {
    let scheduleStr = "";
    for (const day in this.schedule) {
      let timeSlotsStr = this.schedule[day]
        .map(
          (timeSlot) =>
            `${timeSlot.start}-${timeSlot.end}: ${timeSlot.className}`
        )
        .join(", ");
      scheduleStr += `${day}: ${timeSlotsStr}<br>`;
    }

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
}

let students = [];

function populateFilters(students) {
  const majors = new Set();
  const schools = new Set();
  const minors = new Set();

  students.forEach((student) => {
    majors.add(student.major);
    schools.add(student.school);
    if (student.minor) {
      minors.add(student.minor);
    }
  });

  populateSelect("majorFilter", Array.from(majors));
  populateSelect("schoolFilter", Array.from(schools));
  populateSelect("minorFilter", Array.from(minors));
}

function populateSelect(id, options) {
  const select = document.getElementById(id);
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    select.appendChild(optionElement);
  });
}

function filterStudents(students, filters) {
  return students.filter((student) => {
    console.log(`Student: ${JSON.stringify(student)}`);
    return (
      (!filters.major || student.major === filters.major) &&
      (!filters.school || student.school === filters.school) &&
      (!filters.minor || student.minor === filters.minor)
    );
  });
}

function displayData(students) {
  console.log(`Displaying ${students.length} students`);
  const tableBody = document.querySelector("#tableData");
  tableBody.innerHTML = "";
  students.forEach((student) => {
    tableBody.innerHTML += student.toTableRow();
  });
}

fetch("responses.json")
  .then((response) => response.json())
  .then((data) => {
    students = data.map((row) => new Student(row));
    displayData(students);
    populateFilters(students);
  })
  .catch((error) => console.error("Error:", error));

document.getElementById("majorFilter").addEventListener("change", function () {
  const filters = {
    major: this.value,
    school: document.getElementById("schoolFilter").value,
    minor: document.getElementById("minorFilter").value,
  };
  const filteredStudents = filterStudents(students, filters);
  displayData(filteredStudents);
});

document.getElementById("schoolFilter").addEventListener("change", function () {
  const filters = {
    major: document.getElementById("majorFilter").value,
    school: this.value,
    minor: document.getElementById("minorFilter").value,
  };
  const filteredStudents = filterStudents(students, filters);
  displayData(filteredStudents);
});

document.getElementById("minorFilter").addEventListener("change", function () {
  const filters = {
    major: document.getElementById("majorFilter").value,
    school: document.getElementById("schoolFilter").value,
    minor: this.value,
  };
  const filteredStudents = filterStudents(students, filters);
  displayData(filteredStudents);
});

function applyFilters() {
  // Get the selected filter values from the dropdowns
  const nameFilter = document.getElementById("nameFilter").value;
  const pronounsFilter = document.getElementById("pronounsFilter").value;
  const majorFilter = document.getElementById("majorFilter").value;
  const schoolFilter = document.getElementById("schoolFilter").value;
  const minorFilter = document.getElementById("minorFilter").value;

  // Filter the students based on the selected filter values
  const filteredStudents = filterStudents(
    students,
    nameFilter,
    pronounsFilter,
    majorFilter,
    schoolFilter,
    minorFilter
  );

  // Display the filtered students
  displayStudents(filteredStudents);
}

function filterStudents(
  students,
  nameFilter,
  pronounsFilter,
  majorFilter,
  schoolFilter,
  minorFilter
) {
  // Return the students that match the selected filters
  return students.filter((student) => {
    const nameMatch =
      nameFilter === "All" || student["First and Last Name"] === nameFilter;
    const pronounsMatch =
      pronounsFilter === "All" ||
      student["What are your pronouns?"] === pronounsFilter;
    const majorMatch =
      majorFilter === "All" || student["Major(s)"] === majorFilter;
    const schoolMatch =
      schoolFilter === "All" ||
      student["Please select which school your major(s) is in."] ===
        schoolFilter;
    const minorMatch =
      minorFilter === "All" ||
      student["Minor(s) if applicable"] === minorFilter;
    return (
      nameMatch && pronounsMatch && majorMatch && schoolMatch && minorMatch
    );
  });
}

function displayStudents(students) {
  // Clear the existing student list
  const studentTable = document.getElementById("tableData");
  studentTable.innerHTML = "";

  // Add each student to the student list
  students.forEach((student) => {
    const studentRow = document.createElement("tr");
    studentRow.innerHTML = `
      <td>${student["First and Last Name"]}</td>
      <td>${student["What are your pronouns?"]}</td>
      <td>${student["Major(s)"]}</td>
      <td>${student["Please select which school your major(s) is in."]}</td>
      <td>${student["Minor(s) if applicable"]}</td>
      <td>${student["Unavailable Times"]}</td>
    `;
    studentTable.appendChild(studentRow);
  });
}
