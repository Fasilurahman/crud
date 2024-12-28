const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/user_management_system");
const nocache = require('nocache');

const express = require('express');
const app = express();

app.use(nocache());

const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin',adminRoutes);

app.listen(3000,function(){
    console.log("server is running");
});