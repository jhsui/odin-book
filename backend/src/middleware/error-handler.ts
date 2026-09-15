import { type ErrorRequestHandler } from "express";
import multer from "multer";

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      message: "Avatar must be 5 MiB or smaller.",
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error.",
  });
};

export default errorHandler;
