const userRouter = require("./userRouter");
const formRoutes = require("./formRoutes");
const responseRoutes = require("./responseRoutes");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    app.use("/api/forms", formRoutes);
    app.use("/api/responses", responseRoutes);

    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;