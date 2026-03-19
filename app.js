var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");




var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var userProfileRouter = require('./routes/userProfile');
var attendanceRouter = require('./routes/attendance');
var companyRouter = require('./routes/company')
var holidayRouter = require("./routes/holidays");
var departmentRouter = require("./routes/department");
const departmentHeadRoutes = require("./routes/departmenthead");







var connectDB = require("./config/db");


// Connect to database
connectDB();

var app = express();


// CORS configuration
app.use(cors({
  origin: [ "http://localhost:3000", "http://localhost:3001",],
  methods: ["PUT", "DELETE", "POST", "GET", "PATCH"],
  credentials: true
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use('/', indexRouter);
//users
app.use('/api/users', userRouter);
//userprofile
app.use('/api/users',userProfileRouter)
// attendance
app.use('/api/attendance',attendanceRouter);
//company
app.use('/api/company',companyRouter);
//holiday
app.use("/api/holidays", holidayRouter);
//department
app.use("/api/department", departmentRouter);
//department head
app.use("/api/department-heads",departmentHeadRoutes);









// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: "The requested resource was not found",
    path: req.path,
  });
});

// error handler
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  const error = req.app.get("env") === "development" ? err : {};

  // Send error response
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
    error: req.app.get("env") === "development" ? error : {},
  });
});

module.exports = app;
