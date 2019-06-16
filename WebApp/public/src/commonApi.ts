
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
const requestScalar = path => (x = null) =>
    get(path + (!!x ? ('/' + x) : ''))
    .then(x => x.json())
    .then(modelLogger)

const post = path => data => fetch('/api/v1/' + path, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then(x => x.json()).then(modelLogger)

const logout = () => fetch('/logout').then(x => x.json()).then(modelLogger)

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
    getUserCardInfo: request('getUserCardInfo'),
    getUserPosts: request('getUserPosts'),
    getPostData: request('getPostData'),
    getPostComments: request('getPostComments'),
    getUserCommunities: request('getUserCommunities'),
    getCurrentUserCommunities: request('getCurrentUserCommunities'),
    getListUsers: request('getListUsers'),
    searchInSite: request('searchInSite'),
    // post
    createPost: post('createPost'),
    deletePost: post('deletePost'),
    votePost: post('votePost'),
    voteComment: post('voteComment'),
    votePoll: post('votePoll'),
    makeComment: post('makeComment'),
    login,
    logout,
    // polls
    loadPollsData: request('loadPollsData'),
    loadPollData: request('loadPollData'),
    makePollChoice: post('makePollChoice'),
    //communities
    enterCommunity: requestScalar('enterCommunity'),
    exitCommunity: requestScalar('exitCommunity'),
    getCommuintyPageCardInfo: request('getCommuintyPageCardInfo'),
    getCommunityPosts: request('getCommunityPosts'),
    getListCommunities: request('getListCommunities'),
    createCommunity: post('createCommunity')
}
