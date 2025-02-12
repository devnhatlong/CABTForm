const userRouter = require("./userRouter");
// const uploadFileRouter = require("./uploadFileRouter");
const { notFound, errHandler } = require("../middlewares/errorHandler");

const initRoutes = (app) => { 
    app.use("/api/user", userRouter);
    // app.use("/api/upload-file", uploadFileRouter);

    app.use(notFound);
    app.use(errHandler);
}

module.exports = initRoutes;