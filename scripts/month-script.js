const viewSelect = document.getElementById("view-select");
viewSelect.addEventListener("change", () => {
  currentView = viewSelect.value;
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
let events = [];

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
    calendarCell.textContent = day;

    const cellDate = new Date(year, month, day);
    if (cellDate.toDateString() === new Date().toDateString()) {
      calendarCell.classList.add("today");
    }

    const eventIndicators = document.createElement("div");
    eventIndicators.classList.add("event-indicators");

    const bookedSlots = events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.toDateString() === cellDate.toDateString() &&
        event.status === "booked"
      );
    });

    const availableSlots = events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.toDateString() === cellDate.toDateString() &&
        event.status === "available"
      );
    });

    bookedSlots.forEach(() => {
      const bookedDot = document.createElement("span");
      bookedDot.classList.add("indicator", "booked");
      eventIndicators.appendChild(bookedDot);
    });

    availableSlots.forEach(() => {
      const availableDot = document.createElement("span");
      availableDot.classList.add("indicator", "available");
      eventIndicators.appendChild(availableDot);
    });

    calendarCell.appendChild(eventIndicators);
    calendarCell.addEventListener("click", () => openEventModal(cellDate));
    calendarGrid.appendChild(calendarCell);
  }
  for (let i = 0; i < 35 - daysInMonth - startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("calendar-cell", "empty");
    calendarGrid.appendChild(emptyCell);
  }
}

function openEventModal(date) {
  eventModal.style.display = "flex";
  eventForm.dataset.date = date.toISOString();
}

function closeEventModal() {
  eventModal.style.display = "none";
}

function openEventDetailsModal(event) {
  eventDetailsContent.innerHTML = `
    <p><strong>Event Name:</strong> ${event.name}</p>
    <p><strong>Start Time:</strong> ${event.startTime}</p>
    <p><strong>Duration:</strong> ${event.duration} hours</p>
    <p><strong>Attendees:</strong> ${event.attendees}</p>
  `;
  eventDetailsModal.style.display = "flex";
}

function closeEventDetailsModal() {
  eventDetailsModal.style.display = "none";
}

eventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const eventName = document.getElementById("event-name").value;
  const eventStartTime = document.getElementById("event-start-time").value;
  const eventDuration = document.getElementById("event-duration").value;
  const eventAttendees = document.getElementById("event-attendees").value;
  const eventDate = new Date(eventForm.dataset.date);

  const newEvent = {
    date: eventDate.toISOString(),
    name: eventName,
    startTime: eventStartTime,
    duration: eventDuration,
    attendees: eventAttendees,
    status: "booked",
  };

  events.push(newEvent);
  renderCalendar(currentDate);
  closeEventModal();
});

editEventBtn.addEventListener("click", () => {
  // Implement edit functionality
});

deleteEventBtn.addEventListener("click", () => {
  // Implement delete functionality
});

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
