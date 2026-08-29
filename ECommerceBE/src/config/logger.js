import pino from "pino";

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