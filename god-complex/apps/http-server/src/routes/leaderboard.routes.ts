import {Router} from "express";
import {getLeaderboard} from "../services/scoring.service";

const router = Router();

router.post("./:groupId", async (req,res)=>{
    const leaderboard = await getLeaderboard(req.params.groupId);
    res.json(leaderboard);
});

export default router;