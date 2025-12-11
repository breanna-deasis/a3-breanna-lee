const express = require('express');
const app = express();
const port = 3000;

//Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));

function formatDate(thisDate) {
    let month = thisDate.getMonth() + 1;
    let day = thisDate.getDate();
    let year = thisDate.getFullYear();
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year.toString().padStart(4, '0')}`;
}

let today = new Date();
let formattedDate = formatDate(today);

let tasks = [
    {task: "Mark this task as completed", completed: false, due: formattedDate},
    {task: "Add a new task", completed: false, due: formattedDate},
    {task: "Start the focus timer", completed: false, due: formattedDate}
]

function addDerivedFields(task){
    const due = new Date(task.due);
    const now = new Date();

    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    const daysLeft = due - now;
    task.overdue = !task.completed && daysLeft < 0;

    return task;
}

//Routes
app.get('/tasks', (req, res) => {
    res.json(tasks.map(t =>addDerivedFields({...t})))
})

app.post('/tasks', (req, res) => {
    const newTask = req.body;
    if (!newTask.due){
        newTask.due = formattedDate;
    } else {
        newTask.due = formatDate(new Date(newTask.due));
    }

    if (!newTask.hasOwnProperty('completed')){
        newTask.completed = false;
    }

    tasks.push(newTask);
    console.log("Added task:", newTask);

    res.json(tasks.map(t => addDerivedFields({...t})));

});

app.patch('/tasks', (req, res) => {
    const parsed = req.body;
    let updatedTask = null;
    
    if (parsed.originalTask && parsed.updatedTask){
        const task = tasks.find(t => t.task === parsed.originalTask);
        if (task){
            task.task = parsed.newTask;
            updatedTask = task;
        }
    } else {
        const task = tasks.find(t => t.task === parsed.task);
        if (task) {
            if (parsed.hasOwnProperty('completed')) task.completed = parsed.completed;
            if (parsed.due) task.due = formatDate(new Date(parsed.due));
            updatedTask = task;
        }
    }
    res.json(tasks.map(t => addDerivedFields({...t})));
})

app.delete('/tasks/:taskName', (req, res) => {
    const taskName = decodeURIComponent(req.params.taskName);
    tasks = tasks.filter(t => t.task !== taskName);
    res.json({success: true});
});

app.listen(process.env.PORT || port, () => {
    console.log(`Server running on port${process.env.PORT || port}/`);
});