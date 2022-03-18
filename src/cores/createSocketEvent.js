export const createTodoSocketEvent = (noteId) => {
    if (!noteId) return "";
    return `noteId:${noteId}`;
}