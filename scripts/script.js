const viewSelect = document.getElementById("view-select");
const currentDateElement = document.getElementById("current-date");
const addEventBtn = document.getElementById("add-event-btn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const eventEditModal = document.getElementById("event-edit-modal");
const closeModal = document.querySelector(".close");
const closeDetailsModal = document.querySelector("#event-details-modal .close");
const closeEditModal = document.querySelector("#event-edit-modal .close");
const cancelBtn = document.getElementById("cancel-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const eventForm = document.getElementById("event-form");
const eventEditForm = document.getElementById("event-edit-form");
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
  const actualToday = new Date().toDateString();
  const header = document.querySelector(".header");
  if (today.toDateString() == actualToday) {
    console.log(actualToday);
    header.classList.add("today");
  } else {
    header.classList.remove("today");
  }
  timeLabelsElement.innerHTML = "";
  eventsContainer.innerHTML = "";
  populateDay();
});

prevBtn.addEventListener("click", () => {
  today.setDate(today.getDate() - 1);
  const eventsContainer = document.querySelector(".events-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  const actualToday = new Date().toDateString();
  const header = document.querySelector(".header");
  if (today.toDateString() == actualToday) {
    console.log(actualToday);
    header.classList.add("today");
  } else {
    header.classList.remove("today");
  }

  timeLabelsElement.innerHTML = "";
  eventsContainer.innerHTML = "";
  populateDay();
});

addEventBtn.addEventListener("click", () => {
  document.getElementById("event-date").value = today
    .toISOString()
    .split("T")[0];
  openModal(eventModal);
});
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

  const actualToday = new Date().toDateString();
  const header = document.querySelector(".header");
  if (today.toDateString() == actualToday) {
    console.log(actualToday);
    header.classList.add("today");
  } else {
    header.classList.remove("today");
  }

  for (let j = 0; j < 24; j++) {
    const timeLabelElement = document.createElement("div");
    timeLabelElement.className = "time-label";
    let timeLabelText = "";
    if (j < 12) {
      if (j == 0) timeLabelText = `${(j + 12).toString()} AM`;
      else timeLabelText = `${j.toString()} AM`;
    } else {
      if (j - 12 == 0) timeLabelText = `${j.toString()} PM`;
      else timeLabelText = `${(j - 12).toString()} PM`;
    }
    timeLabelElement.textContent = timeLabelText;
    timeLabelsElement.appendChild(timeLabelElement);
    let data_time = `${j.toString().padStart(2, "0")}:00`;
    const timeSlotElement = document.createElement("div");
    timeSlotElement.className = "time-slot";
    timeSlotElement.setAttribute("data-time", data_time);
    timeSlotElement.setAttribute("data-day", today.toISOString().split("T")[0]);
    addEventListenerToSlot(timeSlotElement);
    eventsContainer.appendChild(timeSlotElement);
  }
  renderEvents();
}

function addEventListenerToSlot(slot) {
  slot.addEventListener("click", (e) => {
    // if (e.target.classList.contains("event")) {
    //   return; // Prevents opening add event modal when clicking an existing event
    // }
    const existingEvent = slot.querySelector(".event");
    if (e.target == existingEvent) {
      e.stopPropagation();
      existingEvent.click(); // Open event details modal
    } else {
      document.getElementById("event-start-time").value =
        slot.getAttribute("data-time");
      document.getElementById("event-date").value = today
        .toISOString()
        .split("T")[0];
      openModal(eventModal);
    }
  });
}

// // Functions
function openModal(modal) {
  modal.style.display = "flex";
}

function closeModalFunc(modal, isEditable = false) {
  if (!isEditable) eventForm.reset();
  modal.style.display = "none";
}

const events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : {};

window.addEventListener("load", populateDay);

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
  renderEvents();
  eventForm.reset();
  closeModalFunc(eventModal);
}

function renderEvents() {
  document.querySelectorAll(".event").forEach((event) => event.remove());

  const storedEvents = JSON.parse(localStorage.getItem("events"));
  if (!storedEvents) return;

  // Get today's events
  const todayEvents = Object.values(storedEvents).filter(
    (event) => event.date === today.toISOString().split("T")[0]
  );

  // Sort events by start time
  const sortedEvents = todayEvents.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // Group overlapping events
  const eventGroups = groupOverlappingEvents(sortedEvents);

  // Render each group with appropriate colors
  eventGroups.forEach((group) => {
    const colorSet = getColorSet(group.length);
    group.forEach((event, index) => {
      const eventElement = createEventElement(event);
      // Apply color from the set
      eventElement.style.backgroundColor = colorSet[index].bg;
      eventElement.style.borderLeftColor = colorSet[index].border;
      eventElement.style.borderBottomColor = colorSet[index].border;

      findAndPutEventSlot(event, eventElement, group.length, index);
      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        displayEventDetails(event);
      });
    });
  });
}

function groupOverlappingEvents(events) {
  if (events.length === 0) return [];

  const groups = [];
  let currentGroup = [events[0]];

  for (let i = 1; i < events.length; i++) {
    const currentEvent = events[i];
    const lastOverlappingEvent = findLastOverlappingEvent(
      currentGroup,
      currentEvent
    );

    if (lastOverlappingEvent) {
      currentGroup.push(currentEvent);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentEvent];
    }
  }

  // Don't forget to add the last group
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function findLastOverlappingEvent(group, currentEvent) {
  for (let i = group.length - 1; i >= 0; i--) {
    if (currentEvent.startTime < group[i].endTime) {
      return group[i];
    }
  }
  return null;
}

function getColorSet(count) {
  const colorSets = [
    { bg: "#13753f", border: "#00c85a" }, // Default green
    { bg: "#1a73e8", border: "#4285f4" }, // Blue
    { bg: "#d93025", border: "#ea4335" }, // Red
    { bg: "#f9ab00", border: "#fbbc04" }, // Yellow
    { bg: "#a142f4", border: "#b87cff" }, // Purple
    { bg: "#f25c54", border: "#ff6b6b" }, // Coral
    { bg: "#34a853", border: "#00c853" }, // Different green
    { bg: "#ff6d00", border: "#ff9e40" }, // Orange
    { bg: "#607d8b", border: "#90a4ae" }, // Blue Grey
    { bg: "#9c27b0", border: "#ba68c8" }, // Deep Purple
  ];

  // Return as many colors as needed, cycling through the array if necessary
  return Array(count)
    .fill(0)
    .map((_, i) => colorSets[i % colorSets.length]);
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
  eventName.classList.add("textOverflow");
  eventAttendees.classList.add("textOverflow");

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
  renderEvents();
  closeModalFunc(eventEditModal);
}

function deleteEvent(eventId) {
  delete events[eventId];
  localStorage.setItem("events", JSON.stringify(events));
  renderEvents();
  closeModalFunc(eventDetailsModal);
}

function normaliseTime(time) {
  const [hour, minute] = time.split(":");
  return hour + ":00";
}

function findAndPutEventSlot(
  event,
  eventElement,
  overlapCount = 1,
  eventIndex = 0
) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    if (
      slot.getAttribute("data-time") == normaliseTime(event.startTime) &&
      slot.getAttribute("data-day") == event.date
    ) {
      eventElement.style.position = "absolute";

      const [startHour, startMinute] = event.startTime.split(":").map(Number);
      const [endHour, endMinute] = event.endTime.split(":").map(Number);

      let durationMinute, durationHour;
      if (endMinute >= startMinute) {
        durationMinute = endMinute - startMinute;
        durationHour = endHour - startHour;
      } else {
        durationMinute = 60 + (endMinute - startMinute);
        durationHour = endHour - startHour - 1;
      }

      const topPosition = startMinute * (65 / 60);
      const height = durationHour * 65 + durationMinute * (65 / 60); // 65 pixels per hour

      eventElement.style.top = `${topPosition}px`;
      eventElement.style.height = `${height}px`;

      if (overlapCount > 1) {
        const eventWidth = 95 / overlapCount + "%";
        const leftOffset = eventIndex * (95 / overlapCount) + "%";

        eventElement.style.width = eventWidth;
        eventElement.style.left = leftOffset;
      } else {
        // If there's only one event, use 90% width to still leave a small space visible
        eventElement.style.width = "95%";
        eventElement.style.left = "0";
      }

      // Set z-index to ensure newer events appear on top
      eventElement.style.zIndex = 1 + eventIndex;

      slot.appendChild(eventElement);
    }
  });
}

function createEventElement(event) {
  const eventElement = document.createElement("div");
  eventElement.className = "event";
  eventElement.textContent = `${event.name} (${event.attendees})`;
  return eventElement;
}

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
