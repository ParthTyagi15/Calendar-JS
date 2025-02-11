const viewSelect = document.getElementById("view-select");
const calendarGrid = document.querySelector(".calendar-grid");
const prevBtn = document.querySelector(".prevBtn");
const nextBtn = document.querySelector(".nextBtn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const closeModalButtons = document.querySelectorAll(".close");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("event-form");
const eventDetailsContent = document.getElementById("event-details-content");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");
const monthHolder = document.getElementById("month-holder");

let currentDate = new Date();
let events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : [];
let selectedEventIndex = null;

viewSelect.addEventListener("change", () => {
  const currentView = viewSelect.value;
  updateCalendarView(currentView);
});

function updateCalendarView(view) {
  if (view === "day") {
    window.location.href = "/pages/day.html";
  } else if (view === "week") {
    window.location.href = "/pages/week.html";
  } else if (view === "month") {
    window.location.href = "/pages/month.html";
  }
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startingDay = firstDayOfMonth.getDay();

  monthHolder.textContent = `${date.toLocaleString("en-us", {
    month: "long",
  })} ${year}`;

  calendarGrid.innerHTML = "";
  for (let i = 0; i < startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell", "empty");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const calendarCell = document.createElement("div");
    calendarCell.classList.add("calendar-cell");
    // calendarCell.textContent = day;

    const todayDateElement = document.createElement("div");
    todayDateElement.classList.add("month-date-header");
    todayDateElement.textContent = day;

    calendarCell.appendChild(todayDateElement);

    const cellDate = new Date(year, month, day);
    const yearStr = String(year);
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    calendarCell.setAttribute(
      "data-day",
      yearStr + "-" + monthStr + "-" + dayStr
    );
    if (cellDate.toDateString() === new Date().toDateString()) {
      todayDateElement.classList.add("today");
    }

    const eventIndicators = document.createElement("div");
    eventIndicators.classList.add("event-indicators");

    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === cellDate.toDateString();
    });

    dayEvents.forEach((event) => {
      const eventDot = document.createElement("div");
      eventDot.classList.add("indicator", "event");
      eventDot.title = `${event.name} (${event.startTime} - ${event.endTime})`;
      eventDot.textContent = eventDot.title;
      eventDot.addEventListener("click", (e) => {
        openEventDetailsModal(event);
        e.stopPropagation();
      });
      eventIndicators.appendChild(eventDot);
    });

    calendarCell.appendChild(eventIndicators);
    calendarCell.addEventListener("click", () => openEventModal(calendarCell));
    calendarGrid.appendChild(calendarCell);
  }

  for (let i = 0; i < 35 - daysInMonth - startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell", "empty");
    calendarGrid.appendChild(emptyCell);
  }
}

function openEventModal(calendarCellElement) {
  if (calendarCellElement)
    document.getElementById("event-date").value =
      calendarCellElement.getAttribute("data-day");
  eventModal.style.display = "flex";
}

function closeEventModal() {
  eventModal.style.display = "none";
  eventForm.reset();
}

function openEventDetailsModal(event) {
  selectedEventIndex = events.indexOf(event);
  eventDetailsContent.innerHTML = "";

  const eventName = document.createElement("p");
  const eventNameStrong = document.createElement("strong");
  eventNameStrong.textContent = "Event Name: ";
  eventName.textContent = event.name;
  eventName.className = "textOverflow";
  eventName.insertAdjacentElement("afterbegin", eventNameStrong);

  const eventStartTime = document.createElement("p");
  const eventStartTimeStrong = document.createElement("strong");
  eventStartTimeStrong.textContent = "Start Time: ";
  eventStartTime.textContent = event.startTime;
  eventStartTime.insertAdjacentElement("afterbegin", eventStartTimeStrong);

  const eventEndTime = document.createElement("p");
  const eventEndTimeStrong = document.createElement("strong");
  eventEndTimeStrong.textContent = "End Time: ";
  eventEndTime.textContent = event.endTime;
  eventEndTime.insertAdjacentElement("afterbegin", eventEndTimeStrong);

  const eventAttendees = document.createElement("p");
  const eventAttendeesStrong = document.createElement("strong");
  eventAttendeesStrong.textContent = "Attendees: ";
  eventAttendees.textContent = event.attendees;
  eventName.className = "textOverflow";
  eventAttendees.insertAdjacentElement("afterbegin", eventAttendeesStrong);

  const eventDate = document.createElement("p");
  const eventDateStrong = document.createElement("strong");
  eventDateStrong.textContent = "Date: ";
  eventDate.textContent = event.date;
  eventDate.insertAdjacentElement("afterbegin", eventDateStrong);

  eventDetailsContent.appendChild(eventName);
  eventDetailsContent.appendChild(eventStartTime);
  eventDetailsContent.appendChild(eventEndTime);
  eventDetailsContent.appendChild(eventAttendees);
  eventDetailsContent.appendChild(eventDate);
  eventDetailsModal.style.display = "flex";

  editEventBtn.addEventListener("click", editEvent);

  deleteEventBtn.addEventListener("click", deleteEvent);
}

function closeEventDetailsModal() {
  eventDetailsModal.style.display = "none";
}

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const event = {
    name: document.getElementById("event-name").value,
    startTime: document.getElementById("event-start-time").value,
    endTime: document.getElementById("event-end-time").value,
    attendees: document.getElementById("event-attendees").value,
    date: document.getElementById("event-date").value,
  };

  if (event.endTime < event.startTime) {
    alert("Sorry! Not allowed to have end time before than start time");
    return;
  }

  if (event.endTime > "24:00") {
    alert("Sorry! Not allowed");
    return;
  }

  if (selectedEventIndex !== null) {
    events[selectedEventIndex] = event;
    selectedEventIndex = null;
  } else {
    events.push(event);
  }
  localStorage.setItem("events", JSON.stringify(events));
  renderCalendar(currentDate);
  closeEventModal();
});

function editEvent() {
  if (selectedEventIndex !== null) {
    const event = events[selectedEventIndex];
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-date").value = event.date;
    document.getElementById("event-start-time").value = event.startTime;
    document.getElementById("event-end-time").value = event.endTime;
    document.getElementById("event-attendees").value = event.attendees;
    closeEventDetailsModal();
    openEventModal();
  }
}

function deleteEvent() {
  if (selectedEventIndex !== null) {
    events.splice(selectedEventIndex, 1);
    localStorage.setItem("events", JSON.stringify(events));
    renderCalendar(currentDate);
    closeEventDetailsModal();
  }
}

editEventBtn.addEventListener("click", editEvent);
deleteEventBtn.addEventListener("click", deleteEvent);

closeModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeEventModal();
    closeEventDetailsModal();
  });
});

cancelBtn.addEventListener("click", () => {
  closeEventModal();
});

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});

window.addEventListener("load", () => {
  renderCalendar(new Date());
});

monthHolder.addEventListener("click", () => {
  location.reload();
});

window.addEventListener("click", (event) => {
  if (event.target === eventModal) {
    closeEventModal();
  }
  if (event.target === eventDetailsModal) {
    closeEventDetailsModal();
  }
});
