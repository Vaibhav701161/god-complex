import {Router} from "express";
import {submitCheckin} from "../services/checkin.service";

const router = Router();

router.post("/",async(req,res) =>{

    const userId = "mock-user-id";
    await submitCheckin(userId,req.body);
    res.sendStatus(201);
});

export default router;
