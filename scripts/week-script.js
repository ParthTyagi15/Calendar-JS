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

// let events = localStorage.getItem("events")
//   ? JSON.parse(localStorage.getItem("events"))
//   : [];
// let selectedEventIndex = null;

const events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : {};

const addEventBtn = document.getElementById("add-event-btn");
const eventModal = document.getElementById("event-modal");
const eventDetailsModal = document.getElementById("event-details-modal");
const closeModal = document.querySelector(".close");
const closeDetailsModal = document.querySelector("#event-details-modal .close");
const cancelBtn = document.getElementById("cancel-btn");
const eventForm = document.getElementById("event-form");
const eventsContainer = document.querySelector(".week-events-container");
const eventDetailsContent = document.getElementById("event-details-content");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");
const weekHolder = document.getElementById("current-week");
const eventEditModal = document.getElementById("event-edit-modal");
const closeEditModal = document.querySelector("#event-edit-modal .close");
const eventEditForm = document.getElementById("event-edit-form");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const prevBtn = document.querySelector(".prevBtn");
const nextBtn = document.querySelector(".nextBtn");

nextBtn.addEventListener("click", () => {
  const weekContainer = document.querySelector(".week-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  timeLabelsElement.innerHTML = "";
  weekContainer.innerHTML = "";
  let firstDayofNewWeek = currWeek[0];
  firstDayofNewWeek.setDate(firstDayofNewWeek.getDate() + 7);
  currWeek = populateWeek(firstDayofNewWeek);
});

prevBtn.addEventListener("click", () => {
  const weekContainer = document.querySelector(".week-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  timeLabelsElement.innerHTML = "";
  weekContainer.innerHTML = "";
  let firstDayofNewWeek = currWeek[0];
  firstDayofNewWeek.setDate(firstDayofNewWeek.getDate() - 7);
  currWeek = populateWeek(firstDayofNewWeek);
});

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

weekHolder.addEventListener("click", () => {
  location.reload();
});

document
  .querySelectorAll(".time-slot")
  .forEach((slot) => addEventListenerToSlot(slot));

let currWeek = [];
window.addEventListener("load", function () {
  currWeek = populateWeek(new Date());
});

const today = new Date();
const options = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

function populateWeek(today) {
  const weekContainer = document.querySelector(".week-container");
  const timeLabelsElement = document.querySelector(".time-labels");
  const todayDate = new Date().toDateString();
  const days = getCurrentWeek(today);
  weekHolder.textContent = `${days[0].toLocaleDateString("en-in", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} - ${days[6].toLocaleDateString("en-in", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
  for (let i = 0; i < 7; i++) {
    const weekDay = document.createElement("div");
    weekDay.className = `week-day ${
      days[i].toDateString() == todayDate ? "today" : ""
    }`;
    weekDay.setAttribute("date", days[i].toDateString());

    const weekHeader = document.createElement("div");
    weekHeader.className = `week-header ${
      days[i].toDateString() == todayDate ? "today" : ""
    }`;
    weekHeader.textContent = days[i].toDateString();

    const weekEventContainer = document.createElement("div");
    weekEventContainer.className = "week-events-container";

    for (let j = 0; j < 24; j++) {
      if (i == 0) {
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
      }
      let data_time = `${j.toString().padStart(2, "0")}:00`;
      const timeSlotElement = document.createElement("div");
      timeSlotElement.className = "time-slot";
      timeSlotElement.setAttribute("data-time", data_time);
      timeSlotElement.setAttribute(
        "data-day",
        days[i].toISOString().split("T")[0]
      );
      addEventListenerToSlot(timeSlotElement);
      weekEventContainer.appendChild(timeSlotElement);
    }

    weekDay.appendChild(weekHeader);
    weekDay.appendChild(weekEventContainer);

    weekContainer.appendChild(weekDay);
  }

  currWeek = days; // Set currWeek before calling renderEvents
  renderEvents();
  return days;
}

function getCurrentWeek(current) {
  let week = new Array();
  current.setDate(current.getDate() - current.getDay());
  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return week;
}

function addEventListenerToSlot(slot) {
  slot.addEventListener("click", (e) => {
    // if (e.target.classList.contains("event")) {
    //   return; // Prevents opening add event modal when clicking an existing event
    // }

    const existingEvent = slot.querySelector(".event");
    if (e.target == existingEvent) {
      existingEvent.click(); // Open event details modal
      e.stopPropagation();
    } else {
      document.getElementById("event-start-time").value =
        slot.getAttribute("data-time");
      document.getElementById("event-date").value =
        slot.getAttribute("data-day");

      openModal(eventModal);
    }
  });
}

function openModal(modal) {
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
  renderEvents();
  eventForm.reset();
  closeModalFunc(eventModal);
}

function renderEvents() {
  document.querySelectorAll(".event").forEach((event) => event.remove());

  const storedEvents = JSON.parse(localStorage.getItem("events"));
  if (!storedEvents || !currWeek || currWeek.length === 0) return;

  // Get events for each day in the current week
  for (let i = 0; i < 7; i++) {
    const currentDay = currWeek[i].toISOString().split("T")[0];

    // Get the events for this day
    const dayEvents = Object.values(storedEvents).filter(
      (event) => event.date === currentDay
    );

    // Sort events by start time
    const sortedEvents = dayEvents.sort((a, b) =>
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

      // Set data attributes for later use when comparing events
      eventElement.setAttribute("data-start-time", event.startTime);
      eventElement.setAttribute("data-end-time", event.endTime);
      eventElement.setAttribute("data-event-id", event.id);

      // Handle overlapping events
      const overlappingEvents = [];
      slot.querySelectorAll(".event").forEach((existingEvent) => {
        const existingStartTime = existingEvent.getAttribute("data-start-time");
        const existingEndTime = existingEvent.getAttribute("data-end-time");

        if (
          (event.startTime < existingEndTime &&
            event.endTime > existingStartTime) ||
          (existingStartTime < event.endTime &&
            existingEndTime > event.startTime)
        ) {
          overlappingEvents.push({
            element: existingEvent,
            startTime: existingStartTime,
            endTime: existingEndTime,
            id: existingEvent.getAttribute("data-event-id"),
          });
        }
      });

      // Get events with the same start time
      const sameStartTimeEvents = overlappingEvents.filter(
        (e) => e.startTime === event.startTime
      );

      if (sameStartTimeEvents.length > 0) {
        // Adjust width for events with same start time
        const eventsWithSameStart = [
          ...sameStartTimeEvents,
          {
            element: eventElement,
            startTime: event.startTime,
            endTime: event.endTime,
            id: event.id,
          },
        ];

        // Sort by ID to ensure consistent ordering
        eventsWithSameStart.sort((a, b) => Number(a.id) - Number(b.id));

        const totalEvents = eventsWithSameStart.length;
        const thisEventIndex = eventsWithSameStart.findIndex(
          (e) => e.id === event.id
        );

        const eventWidth = 95 / totalEvents + "%";
        const leftOffset = thisEventIndex * (95 / totalEvents) + "%";

        eventElement.style.width = eventWidth;
        eventElement.style.left = leftOffset;

        // Apply the same adjustments to existing events with same start time
        sameStartTimeEvents.forEach((e) => {
          const index = eventsWithSameStart.findIndex((es) => es.id === e.id);
          e.element.style.width = eventWidth;
          e.element.style.left = index * (95 / totalEvents) + "%";
        });
      } else {
        // If there are no events with the same start time, use full width
        eventElement.style.width = "95%";
        eventElement.style.left = "0";
      }

      // Handle z-index for overlapping events with different start times
      const differentStartTimeEvents = overlappingEvents.filter(
        (e) => e.startTime !== event.startTime
      );

      if (differentStartTimeEvents.length > 0) {
        // Sort overlapping events by end time
        const sortedByEndTime = [
          ...differentStartTimeEvents,
          {
            element: eventElement,
            startTime: event.startTime,
            endTime: event.endTime,
            id: event.id,
          },
        ].sort((a, b) => a.endTime.localeCompare(b.endTime));

        // Set z-index based on position in the sorted array
        // Events with earlier end times get higher z-index
        sortedByEndTime.forEach((e, idx) => {
          const zIndex = sortedByEndTime.length - idx; // Higher z-index for earlier end times
          if (e.id === event.id) {
            eventElement.style.zIndex = zIndex;
          } else {
            e.element.style.zIndex = zIndex;
          }
        });
      } else {
        // Default z-index if no overlapping events with different start times
        eventElement.style.zIndex = 1;
      }

      slot.appendChild(eventElement);
    }
  });
}

function createEventElement(event) {
  const eventElement = document.createElement("div");
  eventElement.className = "event";
  eventElement.textContent = `${event.name} (${event.attendees})`;

  // Add tooltips for long event names
  eventElement.title = `${event.name} (${event.attendees})`;

  return eventElement;
}

function normaliseTime(time) {
  const [hour, minute] = time.split(":");
  return hour + ":00";
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

  eventName.classList.add("textOverflow");
  eventAttendees.classList.add("textOverflow");

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
