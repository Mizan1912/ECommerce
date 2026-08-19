import transporter from "../config/mail.js";

import env from "../config/env.js"

const sendMail = async({
     to,
     subject,
     html,
}) => {
     await transporter.sendMail({
          from: env.MAIL_FROM,

          to,

          subject,

          html,
     })
}

export default sendMail;