const userRouter = require("./userRouter");
const departmentRouter = require("./departmentRouter");
const provinceRouter = require("./provinceRouter");
const districtRouter = require("./districtRouter");
const communeRouter = require("./communeRouter");
const fieldOfWorkRoutes = require("./fieldOfWorkRouter");
const crimeRoutes = require("./crimeRouter");
const topicRoutes = require("./topicRouter");
const reportTypeRoutes = require("./reportTypeRouter");
const reportRoutes = require("./reportRouter");
const fileRoutes = require("./fileRouter");
const serverDateRoutes = require("./serverDateRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/department", departmentRouter);
    app.use("/api/province", provinceRouter);
    app.use("/api/district", districtRouter);
    app.use("/api/commune", communeRouter);
    app.use("/api/field-of-work", fieldOfWorkRoutes);
    app.use("/api/crime", crimeRoutes);
    app.use("/api/topic", topicRoutes);
    app.use("/api/report-type", reportTypeRoutes);
    app.use("/api/report", reportRoutes);
    app.use("/api/file", fileRoutes);

    app.use("/api/server-date", serverDateRoutes);
    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;