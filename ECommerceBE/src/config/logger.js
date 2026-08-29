import pino from "pino";
import fs from "fs";

// pino/file does not create the directory, so make sure it exists on boot.
fs.mkdirSync("./logs", { recursive: true });

const transport = pino.transport({
  targets: [
    {
      target: "pino-pretty",

      options: {
        colorize: true,
      },

      level: "info",
    },

    {
      target: "pino/file",

      options: {
        destination: "./logs/app.log",
      },

      level: "info",
    },

    {
      target: "pino/file",

      options: {
        destination:
          "./logs/error.log",
      },

      level: "error",
    },
  ],
});

const logger = pino(
  {
    level: "info",
  },

  transport
);

export default logger;