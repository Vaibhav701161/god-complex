import {Router} from "express";
import{
    submitDailyGoals,
    getDailyGoals
} from "../services/goal.service";

const router = Router();

router.post("/submit", async (req,res)=>{
    const userId = "mock-user-id";
    await submitDailyGoals(userId, req.body);
    res.sendStatus(201);
});

router.get("/:groupId/:date", async (req,res)=>{
    const goals = await getDailyGoals(
        req.params.groupId,
        req.params.date
    );
    res.json(goals);
});

export default router;