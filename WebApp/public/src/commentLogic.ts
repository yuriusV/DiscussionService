const recGetSubComments = (comment, allComments) => {
    let onlySubComments = allComments.filter(x => x.parentId === comment.id)
    comment.children = onlySubComments
    for(let child of onlySubComments) {
        recGetSubComments(child, allComments)
    }
}

export const makeCommentTree = (comments) => {
    let rootComments = comments.filter(x => x.parentId === 0)
    for(let x of rootComments) {
        recGetSubComments(x, comments)
    }
    return rootComments
}