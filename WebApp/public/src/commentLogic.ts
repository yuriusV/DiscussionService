const recGetSubComments = (comment, allComments) => {
    let onlySubComments = allComments.filter(x => x.parentId === comment.id)
        .sort((y, x) => (x.likes - x.dislikes) - (y.likes - y.dislikes))
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
    return rootComments.sort((y, x) => (x.likes - x.dislikes) - (y.likes - y.dislikes))
}

export const getBetterCommentOrNone = (comments) => {
    if (!comments || comments.length == 0) return null;

    const minimumRating = 1;
    const bestValue = Math.max.apply(null, comments.map(x => x.likes - x.dislikes))
    const commentWithBest = comments.filter(x => (x.likes - x.dislikes) == bestValue)
    if (commentWithBest.length == 0) return null;
    if (commentWithBest[0].likes - commentWithBest[0].dislikes >= minimumRating) {
        return commentWithBest[0]
    }
    return null;
}