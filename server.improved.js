const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const Task = require('./task');
const User = require('./user');
require('dotenv').config();
console.log('URI being used:', process.env.MONGODB_URI);
connectDB();

const app = express();
const port = 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'default',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

//Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function ensureAuthenticated(req, res, next){
    if (req.session && req.session.userId){
        return next();
    }
    res.status(401).json({msg: 'Unauthorized'});
}

function addDerivedFields(taskDoc){
    const task = taskDoc.toObject ? taskDoc.toObject() : taskDoc;

    task.id = task._id;
    delete task._id;

    const now = new Date();
    const nowTime = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const dueDate = new Date(task.dueDate);

    const month = (dueDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dueDate.getUTCDate().toString().padStart(2, '0');
    const year = dueDate.getUTCFullYear();
    task.dueDate = `${month}-${day}-${year}`;

    const dueDateTime = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    //console.log(`Task: ${task.task}, Due: ${dueDateTime}, Now: ${nowTime}`);
    task.overdue = !task.completed && dueDateTime < nowTime;
    return task;
}

app.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password){
            return res.status(400).json({msg: 'Username and password are required'});
        }

        let user = await User.findOne({username})
        if (user){
            return res.status(400).json({msg: 'Username already exists'});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({username, password: hashedPassword});
        await user.save();
        req.session.userId = user._id;

        req.session.save((err) => {
            if (err) return res.status(500).json('Server Error');
            res.status(201).json({msg: 'User registered successfully'});
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password){
            return res.status(400).json({msg: 'Username and password are required'});
        }

        const user = await User.findOne({username});
        if (!user){
            return res.status(400).json({msg: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({msg: 'Invalid credentials'});
        }

        req.session.userId = user._id;
        res.json({msg: 'Login successful', user: {id: user._id, username: user.username}});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err){
            return res.status(500).send('Could not log out');
        }
        res.json({msg: 'Logout successful'});
    });
});
//Routes
app.get('/tasks', ensureAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({userId: req.session.userId}).sort({dueDate: 'asc'})
        const user = await User.findById(req.session.userId);
        res.json({tasks: tasks.map(t =>addDerivedFields(t)), totalFocusTime : user.totalFocusTime || 0});
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/tasks', ensureAuthenticated, async (req, res) => {
    try {
        const {task, completed, dueDate}= req.body;
        const newTask = new Task({
            task:task, 
            completed: completed || false, 
            dueDate: dueDate ? new Date(dueDate) : new Date(),
            userId: req.session.userId
        });
        
        await newTask.save();
        const allTasks = await Task.find({userId: req.session.userId}).sort({dueDate: 'asc'});
        const user = await User.findById(req.session.userId);
        res.json({tasks: allTasks.map(t => addDerivedFields(t)), totalFocusTime: user.totalFocusTime || 0});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.patch('/tasks', ensureAuthenticated, async (req, res) => {
    try {
        const {id, task, completed, dueDate} = req.body;
        if (!id) return res.status(400).send('Task ID is required');
        
        let updateFields = {};
        
        if (task !== undefined) updateFields.task = task;
        if (completed !== undefined) updateFields.completed = completed;
        /*if (dueDate) {
            const dateParts = dueDate.split('-');
            if (dateParts.length === 3){
                const month = parseInt(dateParts[0], 10) - 1;
                const day = parseInt(dateParts[1], 10);
                const year = parseInt(dateParts[2], 10);

                const parsedDate = new Date(year, month, day);
                updateFields.dueDate = parsedDate;
            } else {
                updateFields.dueDate = new Date(dueDate);
            }
        }
        const updatedDoc = await Task.findOneAndUpdate(
            { _id: id, userId: req.session.userId },
            {$set: updateFields},
            {new: true}
        );
        if (!updatedDoc){
            return res.status(404).json({msg:'Task not found'});
        }*/

        if (dueDate) updateFields.dueDate = new Date(dueDate);
        await Task.findOneAndUpdate(
            { _id: id, userId: req.session.userId },
            { $set: updateFields }
        );

        const tasks = await Task.find({userId: req.session.userId}).sort({dueDate: 'asc'});
        const user = await User.findById(req.session.userId);
        res.json({tasks: tasks.map(t => addDerivedFields(t)), totalFocusTime: user.totalFocusTime || 0});

    } catch (err) {
        console.error(err)
        res.status(500).send('Server Error');
    }
})

app.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const result = await Task.findOneAndDelete({_id: taskId, userId: req.session.userId});
        if (!result){
            return res.status(404).json({msg:'Task not found'});
        }
        const tasks = await Task.find({userId: req.session.userId}).sort({dueDate: 'asc'});
        const user = await User.findById(req.session.userId);
        res.json({tasks: tasks.map(t => addDerivedFields(t)), totalFocusTime: user.totalFocusTime || 0});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/update-focus', ensureAuthenticated, async (req, res) => {
    try {
        const minutesToAdd = req.body.minutes;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { $inc: { totalFocusTime: minutesToAdd } },
            { new: true }
        );

        if (!user){
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({ totalFocusTime: user.totalFocusTime });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

if (process.env.NODE_ENV !== 'production'){
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on local host${process.env.PORT || port}`);
    });
} else {
    app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log(`Server running on production port ${process.env.PORT}`);
    });
}

module.exports = app;