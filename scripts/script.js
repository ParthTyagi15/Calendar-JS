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

  for (let j = 0; j < 24; j++) {
    const timeLabelElement = document.createElement("div");
    timeLabelElement.className = "time-label";
    timeLabelElement.textContent = `${j.toString().padStart(2, "0")}:00`;
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
// // populateDay();

// // Get DOM Elements

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

  Object.values(storedEvents)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .forEach((event) => {
      const eventElement = createEventElement(event);
      findAndPutEventSlot(event, eventElement);
      eventElement.addEventListener("click", () => displayEventDetails(event));
    });
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

function findAndPutEventSlot(event, eventElement) {
  document.querySelectorAll(".time-slot").forEach((slot) => {
    if (
      slot.getAttribute("data-time") == normaliseTime(event.startTime) &&
      slot.getAttribute("data-day") == event.date
    ) {
      eventElement.style.position = "absolute";

      const [startHour, startMinute] = event.startTime.split(":").map(Number);
      const [endHour, endMinute] = event.endTime.split(":").map(Number);

      let durationMinute, durationHour;
      if (endMinute > startMinute) {
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

      // Count the existing events in the same slot
      // let existingEvents = slot.querySelectorAll(".event");
      // let eventWidth = 100 / (existingEvents.length + 1) + "%";
      // let leftOffset =
      //   existingEvents.length * (100 / (existingEvents.length + 1)) + "%";

      // eventElement.style.width = eventWidth;
      // eventElement.style.left = leftOffset;
      eventElement.style.zIndex = 1;

      // existingEvents.forEach((e, index) => {
      //   e.style.width = eventWidth;
      //   e.style.left = index * (100 / (existingEvents.length + 1)) + "%";
      // });
      slot.appendChild(eventElement);
    }
  });
}

function createEventElement(event, isOverlapping) {
  const eventElement = document.createElement("div");
  eventElement.className = `event ${isOverlapping ? "overlap" : ""}`;
  eventElement.textContent = `${event.name} (${event.attendees})`;
  return eventElement;
}

// function groupOverlappingEvents(events) {
//   const groupedEvents = [];
//   let currentGroup = [];

//   events.forEach((event) => {
//     if (currentGroup.length === 0) {
//       currentGroup.push(event);
//     } else {
//       const lastEventInGroup = currentGroup[currentGroup.length - 1];
//       // const lastEventEndTime = getEndTime(lastEventInGroup);
//       const lastEventEndTime = lastEventInGroup.endTime;
//       const currentEventStartTime = event.startTime;

//       if (currentEventStartTime < lastEventEndTime) {
//         currentGroup.push(event);
//       } else {
//         groupedEvents.push([...currentGroup]);
//         currentGroup = [event];
//       }
//     }
//   });

//   if (currentGroup.length > 0) {
//     groupedEvents.push([...currentGroup]);
//   }

//   return groupedEvents;
// }

// // function getEndTime(event) {
// //   const [startHour, startMinute] = event.startTime.split(":").map(Number);
// //   const endHour = startHour + event.duration;
// //   return `${endHour.toString().padStart(2, "0")}:${startMinute
// //     .toString()
// //     .padStart(2, "0")}`;
// // }

// // function getRandomColor() {
// //   const letters = "0123456789ABCDEF";
// //   let color = "#";
// //   for (let i = 0; i < 6; i++) {
// //     color += letters[Math.floor(Math.random() * 16)];
// //   }
// //   return color;
// // }

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
