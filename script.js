class TimeSlot {
  constructor(day, startTime, endTime, className, professor) {
    this.day = day;
    this.dayIndex = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].indexOf(day);
    this.startTime = startTime;
    this.endTime = endTime;
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
    const schedule = {};

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
            day,
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
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    let scheduleStr = "";

    // Sort the days based on the predefined order
    const sortedDays = Object.keys(this.schedule).sort(
      (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );

    sortedDays.forEach((day) => {
      let timeSlotsStr = this.schedule[day]
        .map(
          (timeSlot) =>
            `${timeSlot.startTime}-${timeSlot.endTime}: ${timeSlot.className}`
        )
        .join(", ");
      scheduleStr += `${day}: ${timeSlotsStr}<br>`;
    });

    return `
      <tr>
        <td>${this.name}</td>
        <td>${this.pronouns}</td>
        <td>${this.major}</td>
        <td>${this.school}</td>
        <td>${this.minor || "N/A"}</td>
        <td>${scheduleStr}</td>
      </tr>
    `;
  }
}

let students = [];

function populateFilters(students) {
  const names = new Set(students.map((student) => student.name));
  const pronouns = new Set(students.map((student) => student.pronouns));
  const majors = new Set(students.map((student) => student.major));
  const schools = new Set(students.map((student) => student.school));
  const minors = new Set(
    students.flatMap((student) => (student.minor ? [student.minor] : []))
  );

  populateSelect("nameFilter", Array.from(names), "All Names");
  populateSelect("pronounsFilter", Array.from(pronouns), "All Pronouns");
  populateSelect("majorFilter", Array.from(majors), "All Majors");
  populateSelect("schoolFilter", Array.from(schools), "All Schools");
  populateSelect("minorFilter", Array.from(minors), "All Minors");
}

function populateSelect(id, options, allText = "All") {
  const select = document.getElementById(id);
  select.innerHTML = ""; // Clear existing options first
  // Add 'All' option with descriptive text
  const allOptionElement = document.createElement("option");
  allOptionElement.value = "All";
  allOptionElement.text = allText;
  select.appendChild(allOptionElement);

  // Add other options
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.text = option;
    select.appendChild(optionElement);
  });
}

function filterStudents(students, filters) {
  return students.filter((student) => {
    return (
      (filters.name === "All" || student.name === filters.name) &&
      (filters.pronouns === "All" || student.pronouns === filters.pronouns) &&
      (filters.major === "All" || student.major === filters.major) &&
      (filters.school === "All" || student.school === filters.school) &&
      (filters.minor === "All" || student.minor === filters.minor)
    );
  });
}

function applyFilters() {
  const filters = {
    name: document.getElementById("nameFilter").value,
    pronouns: document.getElementById("pronounsFilter").value,
    major: document.getElementById("majorFilter").value,
    school: document.getElementById("schoolFilter").value,
    minor: document.getElementById("minorFilter").value,
  };

  const filteredStudents = filterStudents(students, filters);
  displayData(filteredStudents);
}

function displayData(students) {
  const tableBody = document.querySelector("#tableData");
  tableBody.innerHTML = "";
  students.forEach((student) => {
    tableBody.innerHTML += student.toTableRow();
  });
}

fetch("Host_responses.json")
  .then((response) => response.json())
  .then((data) => {
    students = data.map((row) => new Student(row));
    displayData(students);
    populateFilters(students);
  })
  .catch((error) => console.error("Error:", error));

document.getElementById("filterButton").addEventListener("click", applyFilters);
