const userRouter = require("./userRouter");
const departmentRouter = require("./departmentRouter");
const fieldOfWorkRoutes = require("./fieldOfWorkRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/department", departmentRouter);
    app.use("/api/field-of-work", fieldOfWorkRoutes);

    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;