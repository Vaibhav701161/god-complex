import {Router} from "express";
import {submitCheckin, autoFailMissedCheckins} from "../services/checkin.service";
import { runDailyFinalization } from "@/services/orchestration.service";
const router = Router();

router.post("/",async(req,res) =>{

    const userId = "mock-user-id";
    await submitCheckin(userId,req.body);
    res.sendStatus(201);
});

router.post("/internal/auto-fail", async (req,res) =>{
    await autoFailMissedCheckins(req.body.date);
    res.sendStatus(200);
});

router.post("/internal/finalize-day", async (_,res)=>{
    await runDailyFinalization();
    res.sendStatus(200);
});

export default router;
