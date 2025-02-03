const viewSelect = document.getElementById("view-select");

viewSelect.addEventListener("change", () => {
  currentView = viewSelect.value;
  updateCalendarView(currentView);
});

function updateCalendarView(view) {
  const timeSlots = document.querySelector(".time-slots");

  if (view === "day") {
    window.location.href = "day.html";
  } else if (view === "week") {
    window.location.href = "week.html";
  } else if (view === "month") {
    window.location.href = "month.html";
  }
}

// Get DOM Elements
const addEventBtn = document.getElementById("add-event-btn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const closeModal = document.querySelector(".close");
const closeDetailsModal = document.querySelector("#event-details-modal .close");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("event-form");
const eventsContainer = document.querySelector(".events-container");
const currentDateElement = document.getElementById("current-date");
const eventDetailsContent = document.getElementById("event-details-content");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");

// Set Current Date
const today = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
currentDateElement.textContent = today.toLocaleDateString("en-US", options);

// Array to store events
let events = [];
let selectedEventIndex = null;

// Event Listeners
addEventBtn.addEventListener("click", () => openModal(eventModal));
closeModal.addEventListener("click", () => closeModalFunc(eventModal));
closeDetailsModal.addEventListener("click", () =>
  closeModalFunc(eventDetailsModal)
);
cancelBtn.addEventListener("click", () => closeModalFunc(eventModal));
eventForm.addEventListener("submit", handleFormSubmit);
editEventBtn.addEventListener("click", editEvent);
deleteEventBtn.addEventListener("click", deleteEvent);

document.querySelectorAll(".time-slot").forEach((slot) => {
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
});

// Functions
function openModal(modal) {
  modal.style.display = "flex";
}

function closeModalFunc(modal) {
  modal.style.display = "none";
}

function handleFormSubmit(e) {
  e.preventDefault();

  const event = {
    name: document.getElementById("event-name").value,
    startTime: document.getElementById("event-start-time").value,
    duration: parseInt(document.getElementById("event-duration").value),
    attendees: document.getElementById("event-attendees").value,
  };

  if (selectedEventIndex !== null) {
    events[selectedEventIndex] = event;
    selectedEventIndex = null;
  } else {
    events.push(event);
  }

  renderEvents();
  eventForm.reset();
  closeModalFunc(eventModal);
}

function renderEvents() {
  document.querySelectorAll(".event").forEach((event) => event.remove());

  events.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const groupedEvents = groupOverlappingEvents(events);

  groupedEvents.forEach((group) => {
    group.forEach((event) => {
      const eventElement = createEventElement(event, group.length > 1);

      findAndPutEventSlot(event, eventElement);

      eventElement.addEventListener("click", () =>
        displayEventDetails(event, events.indexOf(event))
      );
    });
  });
}

function findAndPutEventSlot(event, eventElement) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    if (slot.getAttribute("data-time") == event.startTime) {
      eventElement.style.position = "relative";

      // Count the existing events in the same slot
      let existingEvents = slot.querySelectorAll(".event");
      let eventWidth = 100 / (existingEvents.length + 1) + "%";
      let leftOffset =
        existingEvents.length * (100 / (existingEvents.length + 1)) + "%";

      eventElement.style.width = eventWidth;
      eventElement.style.left = leftOffset;

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

  const [startHour, startMinute] = event.startTime.split(":").map(Number);
  const topPosition = (startHour * 60 + startMinute) * (60 / 60);
  const height = event.duration * 60;

  //   eventElement.style.top = `${topPosition}px`;
  //   eventElement.style.height = `${height}px`;

  return eventElement;
}

function displayEventDetails(event, index) {
  selectedEventIndex = index;
  eventDetailsContent.innerHTML = `
    <p><strong>Event Name:</strong> ${event.name}</p>
    <p><strong>Start Time:</strong> ${event.startTime}</p>
    <p><strong>Duration:</strong> ${event.duration} hours</p>
    <p><strong>Attendees:</strong> ${event.attendees}</p>
  `;
  openModal(eventDetailsModal);
}

function editEvent() {
  if (selectedEventIndex !== null) {
    const event = events[selectedEventIndex];
    document.getElementById("event-name").value = event.name;
    document.getElementById("event-start-time").value = event.startTime;
    document.getElementById("event-duration").value = event.duration;
    document.getElementById("event-attendees").value = event.attendees;
    closeModalFunc(eventDetailsModal);
    openModal(eventModal);
  }
}

function deleteEvent() {
  if (selectedEventIndex !== null) {
    events.splice(selectedEventIndex, 1);
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
