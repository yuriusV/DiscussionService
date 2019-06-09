
const processResponse = response => {
    return response.map(row => {
        const keys = Object.keys(row)
        for (let key of keys) {
            // Kostyle, make this structure on a server
            if (row[key] && typeof row[key].Data === "object") {
                row[key] = null
            }

            if (key.indexOf(".") != -1) {
                const parts = key.split('.')
                row[parts[0]] = row[parts[0]] || {};
                row[parts[0]][parts[1]] = row[key]
            }
        }

        return row
    })
}

const modelLogger = x => {
    console.log(x);
    return x;
}

const get = (path) => fetch('/api/v1/' + path)
const request = path => (x = null) => 
    get(path + (!!x ? ('/' + x) : ''))
    .then(x => x.json())
    .then(processResponse)
    .then(modelLogger)


const post = path => data => fetch('/api/v1/' + path, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then(x => x.json()).then(processResponse).then(modelLogger)

// Custom queries
const login = data => fetch('/login', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then(x => x.json()).then(modelLogger)


export default {
    currentUserHeader: request('currentUserHeader'),
    getCurrentUserInfo: request('getCurrentUserInfo'),
    getUserFeed: request('getUserFeed'),
    getCommuintyPageCardInfo: request('getCommuintyPageCardInfo'),
    getCommunityPosts: request('getCommunityPosts'),
    getUserCardInfo: request('getUserCardInfo'),
    getUserPosts: request('getUserPosts'),
    getPostData: request('getPostData'),
    getPostComments: request('getPostComments'),
    getUserCommunities: request('getUserCommunities'),
    getCurrentUserCommunities: request('getCurrentUserCommunities'),
    getListCommunities: request('getListCommunities'),
    getListUsers: request('getListUsers'),
    // post
    createPost: post('createPost'),
    deletePost: post('deletePost'),
    votePost: post('votePost'),
    voteComment: post('voteComment'),
    votePoll: post('votePoll'),
    makeCommment: post('makeComment'),
    login
}
