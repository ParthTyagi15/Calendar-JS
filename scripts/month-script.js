const viewSelect = document.getElementById("view-select");
const calendarGrid = document.querySelector(".calendar-grid");
const prevBtn = document.querySelector(".prevBtn");
const nextBtn = document.querySelector(".nextBtn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const closeModal = document.querySelector(".close");
const closeDetailsModal = document.querySelector("#event-details-modal .close");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("event-form");
const eventDetailsContent = document.getElementById("event-details-content");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");
const monthHolder = document.getElementById("month-holder");
const addEventBtn = document.getElementById("add-event-btn");
const eventEditModal = document.getElementById("event-edit-modal");
const closeEditModal = document.querySelector("#event-edit-modal .close");
const eventEditForm = document.getElementById("event-edit-form");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

let currentDate = new Date();

const events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : {};

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

    const todayDateElement = document.createElement("div");
    todayDateElement.classList.add("month-date-header");
    todayDateElement.textContent = day;

    calendarCell.appendChild(todayDateElement);

    const cellDate = new Date(year, month, day);
    const yearStr = String(year);
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    calendarCell.setAttribute("data-day", `${yearStr}-${monthStr}-${dayStr}`);

    if (cellDate.toDateString() === new Date().toDateString()) {
      todayDateElement.classList.add("today");
    }

    const eventIndicators = document.createElement("div");
    eventIndicators.classList.add("event-indicators");

    Object.values(events).forEach((event) => {
      if (event.date === `${yearStr}-${monthStr}-${dayStr}`) {
        const eventDot = document.createElement("div");
        eventDot.classList.add("indicator", "event");
        eventDot.title = `${event.name} (${event.startTime} - ${event.endTime})`;
        eventDot.textContent = eventDot.title;
        eventDot.addEventListener("click", (e) => {
          displayEventDetails(event);
          e.stopPropagation();
        });
        eventIndicators.appendChild(eventDot);
      }
    });

    calendarCell.appendChild(eventIndicators);
    calendarGrid.appendChild(calendarCell);
  }
}

addEventBtn.addEventListener("click", () => openModal(eventModal));
closeModal.addEventListener("click", () => closeModalFunc(eventModal));
closeDetailsModal.addEventListener("click", () =>
  closeModalFunc(eventDetailsModal)
);
closeEditModal.addEventListener("click", () => closeModalFunc(eventEditModal));
cancelBtn.addEventListener("click", () => closeModalFunc(eventModal));
cancelEditBtn.addEventListener("click", () => closeModalFunc(eventEditModal));
eventForm.addEventListener("submit", handleFormSubmit);
eventEditForm.addEventListener("submit", handleEditFormSubmit);
editEventBtn.addEventListener("click", () => {
  const eventId = editEventBtn.getAttribute("data-event-id");
  if (eventId) {
    editEvent(eventId);
  }
});
deleteEventBtn.addEventListener("click", () => {
  const eventId = deleteEventBtn.getAttribute("data-event-id");
  if (eventId) {
    deleteEvent(eventId);
  }
});

function openModal(modal, date = null) {
  if (date) {
    document.getElementById("event-date").value = date;
  }
  modal.style.display = "flex";
}

function closeModalFunc(modal, isEditable = false) {
  if (!isEditable) eventForm.reset();
  modal.style.display = "none";
}

function handleFormSubmit(e) {
  e.preventDefault();

  const eventId = Date.now().toString(); // Unique event ID
  const event = {
    id: eventId,
    name: document.getElementById("event-name").value,
    startTime: document.getElementById("event-start-time").value,
    endTime: document.getElementById("event-end-time").value,
    attendees: document.getElementById("event-attendees").value,
    date: document.getElementById("event-date").value,
  };

  if (event.endTime < event.startTime) {
    alert("Sorry! Not allowed to have end time before start time");
    return;
  }

  if (event.endTime > "24:00") {
    alert("Sorry! Not allowed");
    return;
  }
  events[eventId] = event; // Store in object with unique ID
  localStorage.setItem("events", JSON.stringify(events));
  renderCalendar(currentDate);
  eventForm.reset();
  closeModalFunc(eventModal);
}

function displayEventDetails(event) {
  eventDetailsContent.innerHTML = "";

  const eventName = document.createElement("p");
  eventName.innerHTML = `<strong>Event Name:</strong> ${event.name}`;

  const eventStartTime = document.createElement("p");
  eventStartTime.innerHTML = `<strong>Start Time:</strong> ${event.startTime}`;

  const eventEndTime = document.createElement("p");
  eventEndTime.innerHTML = `<strong>End Time:</strong> ${event.endTime}`;

  const eventAttendees = document.createElement("p");
  eventAttendees.innerHTML = `<strong>Attendees:</strong> ${event.attendees}`;

  const eventDate = document.createElement("p");
  eventDate.innerHTML = `<strong>Date:</strong> ${event.date}`;

  eventDetailsContent.appendChild(eventName);
  eventDetailsContent.appendChild(eventStartTime);
  eventDetailsContent.appendChild(eventEndTime);
  eventDetailsContent.appendChild(eventAttendees);
  eventDetailsContent.appendChild(eventDate);

  editEventBtn.setAttribute("data-event-id", event.id); // Set event ID for edit button
  deleteEventBtn.setAttribute("data-event-id", event.id); // Set event ID for delete button
  openModal(eventDetailsModal);
}

function editEvent(eventId) {
  const event = events[eventId];
  if (!event) return;

  // Populate the edit form with the event details
  document.getElementById("event-edit-name").value = event.name;
  document.getElementById("event-edit-start-time").value = event.startTime;
  document.getElementById("event-edit-end-time").value = event.endTime;
  document.getElementById("event-edit-attendees").value = event.attendees;
  document.getElementById("event-edit-date").value = event.date;

  // Set the event ID in the edit form
  eventEditForm.setAttribute("data-event-id", event.id);

  closeModalFunc(eventDetailsModal);
  openModal(eventEditModal);
}

function handleEditFormSubmit(e) {
  e.preventDefault();

  const eventId = eventEditForm.getAttribute("data-event-id");
  if (!eventId) return;

  const event = {
    id: eventId,
    name: document.getElementById("event-edit-name").value,
    startTime: document.getElementById("event-edit-start-time").value,
    endTime: document.getElementById("event-edit-end-time").value,
    attendees: document.getElementById("event-edit-attendees").value,
    date: document.getElementById("event-edit-date").value,
  };

  if (event.endTime < event.startTime) {
    alert("Sorry! Not allowed to have end time before start time");
    return;
  }

  if (event.endTime > "24:00") {
    alert("Sorry! Not allowed");
    return;
  }

  events[eventId] = event; // Update the event in the events object
  localStorage.setItem("events", JSON.stringify(events));
  renderCalendar(currentDate);
  closeModalFunc(eventEditModal);
}

function deleteEvent(eventId) {
  delete events[eventId];
  localStorage.setItem("events", JSON.stringify(events));
  renderEvents();
  closeModalFunc(eventDetailsModal);
}

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
    closeModalFunc(eventModal);
  }
  if (event.target === eventDetailsModal) {
    closeModalFunc(eventDetailsModal);
  }
  if (event.target === eventEditModal) {
    closeModalFunc(eventEditModal);
  }
});

// Update the event listener for calendar cells
calendarGrid.addEventListener("click", (e) => {
  const calendarCell = e.target.closest(".calendar-cell");
  if (calendarCell) {
    const date = calendarCell.getAttribute("data-day");
    openModal(eventModal, date);
  }
});
