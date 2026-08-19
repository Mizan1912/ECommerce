import nodemailer from "nodemailer";

import env from "./env.js"

const transporter = nodemailer.createTransport({
     host: env.MAIL_HOST,
     port: Number(env.MAIL_PORT),
     auth:{
          user:env.MAIL_USER,
          pass: env.MAIL_PASS,
     },
})

export default transporter;