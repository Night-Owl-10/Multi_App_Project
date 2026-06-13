import express from "express";
import { clerkWebhook } from "../Controller/webhookController";

const router = express.Router();

router.post("/webhook", clerkWebhook);

export default router;