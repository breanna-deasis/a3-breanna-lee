// FRONT-END (CLIENT) JAVASCRIPT HERE

/*const update = async function(event) {
  const response = await fetch( "/submit", {
    method:"PATCH",
    body 
  })
}*/

const addTaskButton = document.getElementById("add-task");
const taskInput = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date-input");
const priorityList = document.getElementById("priority-tasks");
const taskList = document.getElementById("task-list");
const completedList = document.getElementById("completed-tasks");
const overdueTitle = document.getElementById("overdue-header");
const otherTitle = document.getElementById("other-header");

const authContainer = document.getElementById("auth-container");
const todoContainer = document.getElementById("todo-container");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const registerButton = document.getElementById("register-button");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const authMessage = document.getElementById("auth-message");

const setUIState = (loggedIn) => {
  if (loggedIn){
    authContainer.style.display = "none";
    todoContainer.style.display = "block";
  } else {
    authContainer.style.display = "block";
    todoContainer.style.display = "none";
    usernameInput.value = '';
    passwordInput.value = '';
  }
}

const loadTasks = async ()=> {
  try {
    const response = await fetch("/tasks");

    if (response.status === 401){
      setUIState(false);
      return;
    }

    const data = await response.json();
    setUIState(true);
    printTasks(data.tasks);

    const focusDisplay = document.getElementById('total-focus-time');
    if (focusDisplay){
      focusDisplay.innerText = data.totalFocusTime || 0;
    }
  } catch (error) {
    console.error("Failed to load tasks:", error);
    setUIState(false);
  }
}

const handleAuth = async (url, action) => {
  authMessage.innerText = '';
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password){
    authMessage.innerText = 'Username and password are required';
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    });

    const result = await response.json();
    if (response.ok){
      await loadTasks();
    } else {
      authMessage.innerText = result.msg || `Failed to ${action}`;
    }
  } catch (error) {
    console.error(error);
    authMessage.innerText = 'A server error occurred';
  }
};

const handleLogin = (event) => {
  event.preventDefault();
  handleAuth('/login', 'login');
}

const handleRegister = (event) => {
  event.preventDefault();
  handleAuth('/register', 'Registration');
}

const handleLogout = async (event) => {
  await fetch('/logout');
  setUIState(false);
  taskList.innerHTML = '';
  completedList.innerHTML = '';
  priorityList.innerHTML = '';
  overdueTitle.innerHTML= '';
  otherTitle.innerHTML= '';
}

//ADDS A NEW TASK
const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault();
  const task = taskInput.value.trim();
  if (!task) return;
  const dueDate = dueDateInput.value;

  try {
    const response = await fetch( "/tasks", {
      method:"POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({task, completed:false, dueDate})
    });//.then(function(response) {return response.json();})
    //.then(function(json) {

    if (response.ok){
      const updatedTasks = await response.json();
      printTasks(updatedTasks);
      taskInput.value = "";
      dueDateInput.value = "";
    } else if (response.status === 401){
      handleLogout();
    }
  } catch (error) {
    console.error("Failed to add task:", error);
  }
}

const printTasks = (tasks) => {
  taskList.innerHTML = "";
  completedList.innerHTML = "";
  priorityList.innerHTML = "";

  tasks.forEach( item => {
    const taskId = item.id;
    const li = document.createElement('li');
    li.className = 'list-item';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'list-item-content u-flex-grow-1 u-flex u-items-center';

    //checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.completed;
    checkbox.className = 'u-mr-1';
    checkbox.addEventListener('change', () => {
      toggleTask(taskId, checkbox.checked);
    });
    
    // task name
    const span = document.createElement('span');
    span.innerText = item.task;
    span.contentEditable = true;
    span.className = item.completed ? 'u-text-line-through u-text-muted u-text-bold u-mr-3' : 'u-text-bold u-mr-3';
    span.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        await fetch('/tasks', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({id: taskId, task: span.innerText })
        });
        loadTasks();
      }
    });

    const dueDateValue = document.createElement('span');
    dueDateValue.innerText = item.dueDate;
    dueDateValue.contentEditable = true;

    dueDateValue.className = item.overdue && !item.completed ?
      'u-text-danger u-ml-1 u-font-size-sm u-text-bold' : 'u-text-muted u-ml-1 u-font-size-sm';


    dueDateValue.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter'){
        e.preventDefault();
        const newDateText = dueDateValue.innerText.trim();

        await fetch('/tasks', {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({id: taskId, dueDate: newDateText })
        });
        loadTasks();
      }
    });
    
    const actionDiv = document.createElement('div');
    actionDiv.className = 'list-item-action u-flex';

    const deleteButton = document.createElement('button');
    deleteButton.innerText = "Delete";
    deleteButton.className = 'btn btn--sm btn--danger ml-1';
    deleteButton.addEventListener('click', async() => {
      const response = await fetch(`/tasks/${taskId}`,{ method: 'DELETE'});
      if (response.ok){
        const data = await response.json();
        printTasks(data.tasks);
        document.getElementById('total-focus-time').innerText = data.totalFocusTime || 0;
      }
    });

    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(span);
    contentDiv.appendChild(dueDateValue);

    actionDiv.appendChild(deleteButton);

    li.appendChild(contentDiv);
    li.appendChild(actionDiv);

    if (item.completed) {
      completedList.appendChild(li);
    } else  if (item.overdue) {
      priorityList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }
  });
};

const toggleTask = async (taskId, isCompleted) => {
  const response = await fetch('/tasks', {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ id: taskId, completed: isCompleted})
  });
  if (response.ok){
    loadTasks();
  } else if (response.status === 401){
    handleLogout();
  }
};

window.onload = loadTasks;

addTaskButton.addEventListener('click', submit);
taskInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    submit(event);
  }
});

loginButton.addEventListener('click', handleLogin);
registerButton.addEventListener('click', handleRegister);
logoutButton.addEventListener('click', handleLogout);
