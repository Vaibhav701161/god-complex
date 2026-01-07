export async function createGroup(userId:string, data:any){
    return{id: "group-id", ...data};
}

export async function joinGroup(userId:string , groupId:string){
    return;
}

export async function lockGroup(groupId:string){
    return;
}

export async function getGroup(groupId:string){
    return{id:groupId};
}