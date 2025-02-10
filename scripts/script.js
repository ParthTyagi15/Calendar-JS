const viewSelect = document.getElementById("view-select");
const currentDateElement = document.getElementById("current-date");
const addEventBtn = document.getElementById("add-event-btn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const closeModal = document.querySelector(".close");
const closeDetailsModal = document.querySelector("#event-details-modal .close");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("event-form");
const eventsContainer = document.querySelector(".events-container");
const eventDetailsContent = document.getElementById("event-details-content");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");

const prevBtn = document.querySelector(".prevBtn");
const nextBtn = document.querySelector(".nextBtn");

// Event Listeners
nextBtn.addEventListener("click", () => {
  today.setDate(today.getDate() + 1);
  const eventsContainer = document.querySelector(".events-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  timeLabelsElement.innerHTML = "";
  eventsContainer.innerHTML = "";
  populateDay();
});

prevBtn.addEventListener("click", () => {
  today.setDate(today.getDate() - 1);
  const eventsContainer = document.querySelector(".events-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  timeLabelsElement.innerHTML = "";
  eventsContainer.innerHTML = "";
  populateDay();
});

addEventBtn.addEventListener("click", () => openModal(eventModal));
closeModal.addEventListener("click", () => closeModalFunc(eventModal));
closeDetailsModal.addEventListener("click", () =>
  closeModalFunc(eventDetailsModal)
);
cancelBtn.addEventListener("click", () => closeModalFunc(eventModal));
eventForm.addEventListener("submit", handleFormSubmit);
editEventBtn.addEventListener("click", editEvent);
deleteEventBtn.addEventListener("click", deleteEvent);

currentDateElement.addEventListener("click", () => {
  location.reload();
});

viewSelect.addEventListener("change", () => {
  currentView = viewSelect.value;
  updateCalendarView(currentView);
});

document
  .querySelectorAll(".time-slot")
  .forEach((slot) => addEventListenerToSlot(slot));

// Array to store events
let events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : [];
let selectedEventIndex = null;

window.addEventListener("load", populateDay);

function updateCalendarView(view) {
  if (view === "day") {
    window.location.href = "/pages/day.html";
  } else if (view === "week") {
    window.location.href = "/pages/week.html";
  } else if (view === "month") {
    window.location.href = "/pages/month.html";
  }
}

// Set Current Date
const today = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

function populateDay() {
  currentDateElement.textContent = today.toLocaleDateString("en-US", options);
  const eventsContainer = document.querySelector(".events-container");
  const timeLabelsElement = document.querySelector(".time-labels");

  for (let j = 0; j < 24; j++) {
    const timeLabelElement = document.createElement("div");
    timeLabelElement.className = "time-label";
    timeLabelElement.textContent = `${j.toString().padStart(2, "0")}:00`;
    timeLabelsElement.appendChild(timeLabelElement);
    let data_time = `${j.toString().padStart(2, "0")}:00`;
    const timeSlotElement = document.createElement("div");
    timeSlotElement.className = "time-slot";
    timeSlotElement.setAttribute("data-time", data_time);
    timeSlotElement.setAttribute(
      "data-day",
      today.toLocaleDateString("en-US", options)
    );
    addEventListenerToSlot(timeSlotElement);
    eventsContainer.appendChild(timeSlotElement);
  }
  renderEvents();
}
// populateDay();

// Get DOM Elements

function addEventListenerToSlot(slot) {
  slot.addEventListener("click", (e) => {
    if (e.target.classList.contains("event")) {
      return; // Prevents opening add event modal when clicking an existing event
    }

    const existingEvent = slot.querySelector(".event");
    if (existingEvent) {
      existingEvent.click(); // Open event details modal
    } else {
      document.getElementById("event-start-time").value =
        slot.getAttribute("data-time");
      openModal(eventModal);
    }
  });
}

// Functions
function openModal(modal) {
  modal.style.display = "flex";
}

function closeModalFunc(modal, isEditable = false) {
  if (!isEditable) eventForm.reset();
  modal.style.display = "none";
}

function handleFormSubmit(e) {
  e.preventDefault();

  const event = {
    name: document.getElementById("event-name").value,
    startTime: document.getElementById("event-start-time").value,
    duration: parseInt(document.getElementById("event-duration").value),
    attendees: document.getElementById("event-attendees").value,
    date: document.getElementById("current-date").textContent,
  };
  const endTime = getEndTime(event);
  if (endTime > "24:00") {
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
  renderEvents();
  eventForm.reset();
  closeModalFunc(eventModal);
}

function renderEvents() {
  document.querySelectorAll(".event").forEach((event) => event.remove());
  const events = JSON.parse(localStorage.getItem("events"));
  if (!events) return;
  events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groupedEvents = groupOverlappingEvents(events);

  groupedEvents.forEach((group) => {
    group.forEach((event) => {
      const eventElement = createEventElement(event, group.length > 1);
      // console.log(eventElement);
      findAndPutEventSlot(event, eventElement);

      eventElement.addEventListener("click", () =>
        displayEventDetails(event, events.indexOf(event))
      );
    });
  });
}

function findAndPutEventSlot(event, eventElement) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    if (
      slot.getAttribute("data-time") == event.startTime &&
      slot.getAttribute("data-day") == event.date
    ) {
      eventElement.style.position = "absolute";

      const [startHour, startMinute] = event.startTime.split(":").map(Number);
      // const topPosition = startHour * 65 + startMinute; // 65 pixels per hour
      const height = event.duration * 65; // 65 pixels per hour

      // eventElement.style.top = `${topPosition}px`;
      eventElement.style.height = `${height}px`;

      // Count the existing events in the same slot
      let existingEvents = slot.querySelectorAll(".event");
      let eventWidth = 100 / (existingEvents.length + 1) + "%";
      let leftOffset =
        existingEvents.length * (100 / (existingEvents.length + 1)) + "%";

      eventElement.style.width = eventWidth;
      eventElement.style.left = leftOffset;
      eventElement.style.zIndex = 1;

      existingEvents.forEach((e, index) => {
        e.style.width = eventWidth;
        e.style.left = index * (100 / (existingEvents.length + 1)) + "%";
      });
      slot.appendChild(eventElement);
    }
  });
}

function createEventElement(event, isOverlapping) {
  const eventElement = document.createElement("div");
  eventElement.className = `event ${isOverlapping ? "overlap" : ""}`;
  eventElement.textContent = `${event.name} (${event.attendees})`;

  eventElement.style.backgroundColor = isOverlapping
    ? getRandomColor()
    : "#4CAF50"; // Default color for non-overlapping events
  return eventElement;
}

function displayEventDetails(event, index) {
  selectedEventIndex = index;

  eventDetailsContent.innerHTML = "";

  const eventName = document.createElement("p");
  const eventNameStrong = document.createElement("strong");
  eventNameStrong.textContent = "Event Name: ";
  eventName.textContent = event.name;
  eventName.insertAdjacentElement("afterbegin", eventNameStrong);

  const eventStartTime = document.createElement("p");
  const eventStartTimeStrong = document.createElement("strong");
  eventStartTimeStrong.textContent = "Start Time: ";
  eventStartTime.textContent = event.startTime;
  eventStartTime.insertAdjacentElement("afterbegin", eventStartTimeStrong);

  const eventDuration = document.createElement("p");
  const eventDurationStrong = document.createElement("strong");
  eventDurationStrong.textContent = "Duration: ";
  eventDuration.textContent = event.duration;
  eventDuration.insertAdjacentElement("afterbegin", eventDurationStrong);

  const eventAttendees = document.createElement("p");
  const eventAttendeesStrong = document.createElement("strong");
  eventAttendeesStrong.textContent = "Attendees: ";
  eventAttendees.textContent = event.attendees;
  eventAttendees.insertAdjacentElement("afterbegin", eventAttendeesStrong);

  const eventDate = document.createElement("p");
  const eventDateStrong = document.createElement("strong");
  eventDateStrong.textContent = "Date: ";
  eventDate.textContent = event.date;
  eventDate.insertAdjacentElement("afterbegin", eventDateStrong);

  eventDetailsContent.appendChild(eventName);
  eventDetailsContent.appendChild(eventStartTime);
  eventDetailsContent.appendChild(eventDuration);
  eventDetailsContent.appendChild(eventAttendees);
  eventDetailsContent.appendChild(eventDate);

  openModal(eventDetailsModal);
}

function editEvent() {
  if (selectedEventIndex !== null) {
    const event = events[selectedEventIndex];
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-start-time").value = event.startTime;
    document.getElementById("event-duration").value = event.duration;
    document.getElementById("event-attendees").value = event.attendees;
    closeModalFunc(eventDetailsModal, true);
    openModal(eventModal);
  }
}

function deleteEvent() {
  if (selectedEventIndex !== null) {
    events.splice(selectedEventIndex, 1);
    localStorage.setItem("events", JSON.stringify(events));
    renderEvents();
    closeModalFunc(eventDetailsModal);
    selectedEventIndex = null;
  }
}

function groupOverlappingEvents(events) {
  const groupedEvents = [];
  let currentGroup = [];

  events.forEach((event) => {
    if (currentGroup.length === 0) {
      currentGroup.push(event);
    } else {
      const lastEventInGroup = currentGroup[currentGroup.length - 1];
      const lastEventEndTime = getEndTime(lastEventInGroup);
      const currentEventStartTime = event.startTime;

      if (currentEventStartTime < lastEventEndTime) {
        currentGroup.push(event);
      } else {
        groupedEvents.push([...currentGroup]);
        currentGroup = [event];
      }
    }
  });

  if (currentGroup.length > 0) {
    groupedEvents.push([...currentGroup]);
  }

  return groupedEvents;
}

function getEndTime(event) {
  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const endHour = startHour + event.duration;
  return `${endHour.toString().padStart(2, "0")}:${startMinute
    .toString()
    .padStart(2, "0")}`;
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

window.addEventListener("click", (event) => {
  if (event.target === eventModal) {
    closeModalFunc(eventModal);
  }
  if (event.target === eventDetailsModal) {
    closeModalFunc(eventDetailsModal);
  }
});
