export async function handleGameMessage(msgObj, userId) {

    const { event, data} = msgObj;
    const handler = eventHandlers[event];
    if (!handler) {
        throw new Error(`No handler for event: ${event}`);
    }
    return handler(data, userId);
}
const eventHandlers = {
    join: joinGame,
    move: handlePlayerMove,
    start: startGame,
    state: stateGame,
    score: scoreGame,
};

export async function joinGame(data, userId) {
    console.log(`User ${userId} joined the game`);
}
export async function startGame(data, userId) {
    console.log(`User ${userId} started the game`);
}
export async function handlePlayerMove(data, userId) {
    console.log(`User ${userId} moved:`, data);
}
export async function stateGame(data, userId) {
    console.log(`User ${userId} requested game state:`, data);
}
export async function scoreGame(data, userId) {
    console.log(`User ${userId} scored:`, data);
}