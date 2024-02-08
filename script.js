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

fetch("responses.json")
  .then((response) => response.json())
  .then((data) => {
    students = data.map((row) => new Student(row));
    displayData(students);
  })
  .catch((error) => console.error("Error:", error));

function displayData(students) {
  const tableBody = document.querySelector("#tableData");
  tableBody.innerHTML = "";
  students.forEach((student) => {
    tableBody.innerHTML += student.toTableRow();
  });
}
