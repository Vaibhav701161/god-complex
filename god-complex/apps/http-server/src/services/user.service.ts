export async function getMe(userId: string){
    return{
        id: userId,
        name: "mock-user",
        integrity: "derived later"
    };
}