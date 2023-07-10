if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.getElementsByTagName("html")[0].className = "dark-theme";
  var toggleButton = document.getElementById("light-dark-toggle-icon");
  if (toggleButton != null) {
    toggleButton.className = "fa fa-sun-o";
  }
}

document.getElementsByClassName("light-dark-toggle")[0].onclick = function () {
  var body = document.getElementsByTagName("html")[0];
  if (body.className.includes("dark-theme")) {
    body.className = "";
    document.getElementById("light-dark-toggle-icon").className = "fa fa-moon-o";
  } else {
    body.className += " dark-theme";
    document.getElementById("light-dark-toggle-icon").className = "fa fa-sun-o";
  }
}

var today = new Date();
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

document.getElementById("today").getElementsByTagName("h1")[0].innerHTML = (
  daysOfWeek[today.getDay()] + ", " + monthNames[today.getMonth()] + " " + today.getDate().toString()
);

const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", onInput, false);
}

function daysSinceEpoch() {
  const now = new Date();
  return Math.floor((now.getTime() - now.getTimezoneOffset() * 6e4) / 8.64e7);
}

function onInput() {
  this.style.height = 0;
  this.style.height = (this.scrollHeight) + "px";
}

function countEmptyTasks(element) {
  var tasks = document.getElementById(element).getElementsByClassName("item");
  var count = 0;
  for (var i = 0; i < tasks.length; i++) {
    count += (tasks[i].getElementsByTagName("textarea")[0].value.length === 0);
  }
  return count;
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

function createTask(isChecked = false, isFlagged = false, task = "") {
  const newItem = document.createElement("div");
  newItem.className = "item";
  const newInput = document.createElement("input");
  newInput.setAttribute("type", "checkbox");
  newInput.checked = isChecked;
  const newClock = document.createElement("i");
  newClock.className = "fa fa-clock-o";
  const newFlag = document.createElement("i");
  newFlag.className = "fa fa-thumb-tack";
  const newTextarea = document.createElement("textarea");
  newTextarea.setAttribute("rows", "1");
  newTextarea.setAttribute("placeholder", "New Task");
  if (task.toString().length > 0)
    newTextarea.value = task;
  newItem.appendChild(newInput);
  newItem.appendChild(newClock);
  newItem.appendChild(newFlag);
  newItem.appendChild(newTextarea);
  newClock.onclick = function() { toggleTime(newClock) };
  newFlag.onclick = function() { toggleHighlight(newFlag); }
  newItem.style.backgroundColor = isFlagged ? "var(--BLUE)" : "transparent";
  return newItem;
}

function getTasks(list) {
  return JSON.parse(localStorage.getItem(list)) || [];
}

function saveState(listTypes = ["today", "later"]) {
  if (typeof listTypes === "string" || listTypes instanceof String)
    listTypes = [listTypes];
  for (const listType of listTypes) {
    const tasks = document.getElementById(listType).getElementsByClassName("item");
    const listTasks = [];
    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i].getElementsByTagName("textarea")[0].value;
      if (task.length === 0)
        continue;
      listTasks.push({
        "_status": tasks[i].getElementsByTagName("input")[0].checked,
        "flag": tasks[i].style.backgroundColor === "var(--BLUE)",
        "day": (daysSinceEpoch() + (listType === "later" ? 1 : 0)).toString(),
        "task": task
      });
    }
    localStorage.setItem(listType, JSON.stringify(listTasks));
  }
  localStorage.setItem("notes", document.getElementById("notes").innerHTML);
  return true;
}

function initializeState() {
  laterToToday = [];
  for (const listType of ["later", "today"]) {
    const tasks = getTasks(listType);
    for (var i = 0; i < tasks.length; i++) {
      if (listType === "later" && parseInt(tasks[i]["day"]) <= daysSinceEpoch()) {
        laterToToday.push(tasks[i]);
      } else {
        document.getElementById(listType).appendChild(
          createTask(tasks[i]["_status"], tasks[i]["flag"], tasks[i]["task"])
        );
      }
    }
    if (laterToToday.length > 0 && listType === "today") {
      for (var i = 0; i < laterToToday.length; i++)
        document.getElementById(listType).appendChild(
          createTask(
            laterToToday[i]["_status"],
            laterToToday[i]["flag"],
            laterToToday[i]["task"]
          )
        );
    }
    var lastTask = createTask();
    lastTask.id = "last-" + listType;
    document.getElementById(listType).appendChild(lastTask);
  }
  document.getElementById("notes").innerHTML = localStorage.getItem("notes");
  return true;
}

function toggleHighlight(flag) {
  const highlight = "var(--BLUE)";
  var isHighlighted = flag.parentElement.style.backgroundColor === highlight;
  flag.parentElement.style.backgroundColor = isHighlighted ? "transparent" : highlight;
  saveState();
}

function toggleTime(clock) {
  if (clock.parentElement.getElementsByTagName("textarea")[0].value.length === 0) {
    return;
  }
  const curr = clock.parentElement.parentElement.id === "today" ? "today" : "later";
  if (document.getElementById("last-" + curr) == clock.parentElement) {
    const newItem = createTask();
    insertAfter(newItem, clock.parentElement);
    newItem.id = clock.parentElement.id;
    clock.parentElement.id = "";
  }
  const next = curr === "today" ? "later" : "today";
  var priorLast = document.getElementById("last-" + next);
  priorLast.parentNode.insertBefore(clock.parentElement, priorLast);
  clock.parentElement.id = priorLast.id;
  priorLast.id = "";
  saveState();
}

function parseTasks(e) {
  /***
  if (document.activeElement.value !== undefined) {
    document.activeElement.innerHTML = document.activeElement.innerHTML.replace(
      /^#(\d+) $/gm, "<b>$1</b>"
    );
  }
  ***/
  if (e.pointerType !== undefined && document.activeElement.value === "on") {
    var checkbox = document.activeElement;
    var textarea = checkbox.parentNode.getElementsByTagName("textarea")[0];
    textarea.style.opacity = checkbox.checked ? "0.5" : "1.0";
    textarea.style.textDecoration = checkbox.checked ? "line-through" : "none";
  }

  if (document.activeElement.id === "notes")
    localStorage.setItem("notes", document.getElementById("notes").innerHTML);
  if (e.key !== "Enter" && e.pointerType === undefined)
    return true;
  if (e.key === "Enter" && document.activeElement.id !== "notes")
    e.preventDefault();

  for (const listType of ["today", "later"]) {
    if (countEmptyTasks(listType) > 1) {
      var tasks = document.getElementById(listType).getElementsByClassName("item");
      for (var i = tasks.length; i > 0; i--) {
        if (tasks[i - 1].getElementsByTagName("textarea")[0].value.length === 0) {
          tasks[i - 1].remove();
        }
      }
      tasks = document.getElementById(listType).getElementsByClassName("item");
      if (tasks.length === 0) {
        const newItem = createTask();
        document.getElementById(listType).appendChild(newItem);
        newItem.style.backgroundColor = "transparent";
        newItem.getElementsByTagName("textarea")[0].focus();
      }
      tasks[tasks.length - 1].id = "last-" + listType;
    }
    if (countEmptyTasks(listType) < 1) {
      const newItem = createTask();
      var priorLast = document.getElementById("last-" + listType);
      insertAfter(newItem, priorLast);
      newItem.id = priorLast.id;
      priorLast.id = "";
      newItem.style.backgroundColor = "transparent";
      newItem.getElementsByTagName("textarea")[0].focus();
    }
  }
  saveState();
}

function clearCompleted() {
  var items = document.getElementsByClassName("item");
  for (var i = items.length; i > 0; i--)
    if (items[i - 1].getElementsByTagName("input")[0].checked)
      items[i - 1].remove();
  saveState();
}

document.getElementById("footer-current-year").innerHTML = new Date().getFullYear();
document.addEventListener("keydown", parseTasks);
document.addEventListener("click", parseTasks);
initializeState();
