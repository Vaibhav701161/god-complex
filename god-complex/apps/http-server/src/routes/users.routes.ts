import {Router} from "express";
import {getMe} from "../services/user-service";

const router = Router();

// making a mock user for now

router.get("/me", async (req,res) => {
    const userId = "mock-user-id";
    const user = await getMe(userId);
    res.json(user);

});

export default router;