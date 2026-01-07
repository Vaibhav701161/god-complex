import {Router} from "express";
import{
    createGroup,
    joinGroup,
    lockGroup,
    getGroup
} from "../services/group.service";

const router = Router();

router.post("/", async (req,res)=>{
    const userId = "mock-user-id";
    const group = await createGroup(userId, req.body);
    
});

router.post("/:groupId/join",async (req,res) => {
    const userId = "mock-user-id";
    await joinGroup(userId,req.params.groupId);
    res.sendStatus(200);

});

router.post("/:groupId/lock", async (req,res)=>{
    await lockGroup(req.params.groupId);
    res.sendStatus(200);
});

router.get("/:groupId", async(req,res) => {
    const group = await getGroup(req.params.groupId);
    res.json(group);
});

export default router;