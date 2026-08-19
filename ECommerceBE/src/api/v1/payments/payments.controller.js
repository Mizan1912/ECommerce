import asyncHandler
from "../../../utils/asyncHandler.js";

import {
  handleWebhook,
  initiatePayment,
} from "./payments.service.js";

export const initiatePaymentController =
  asyncHandler(
    async (req, res) => {
      const {
        orderNumber,
      } = req.validatedData.params;

      const result =
        await initiatePayment(
          req.user.userId,
          orderNumber
        );

      res.status(201).json({
        success: true,

        message:
          "Payment initiated",

        data: result,
      });
    }
  );


export const webhookController =
  asyncHandler(
    async (
      req,
      res
    ) => {

      const signature =
        req.headers[
          "x-razorpay-signature"
        ];

      await handleWebhook(
        signature,

        req.rawBody
      );

      res.status(200).json({
        success: true,
      });
    }
  ); 