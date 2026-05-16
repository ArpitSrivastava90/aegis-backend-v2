"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    return res.json({
        message: "Webhook route working",
    });
});
router.post("/", async (req, res) => {
    console.log("GitHub webhook received");
    return res.status(200).json({
        success: true,
    });
});
exports.default = router;
