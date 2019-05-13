export default {
    communities: [],
    users: [],
    userProfile: {
        id: 1,
        name: 'Yura',
        nick: 'yuriusV',
        urlPhoto: ''
    },
    notifications: {
        site: [{text: 'Hi, new user!'}],
        users: [{name: 'Peter', urlPhoto: ''}]
    },
    feedPosts: [
        {
            id: 1,
            url: 'test',
            title: 'This is post',
            author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
            community: {url: '', name: '', urlPhoto: ''},
            time: new Date().getTime(),
            countComments: 10,
            likes: 100,
            dislikes: 30,
            content: [
                [
                    'Cut text'
                ],
                'This is a text',
                {imageUrl: '', title: ''},
                'text'
            ]
        },
        {
            id: 2,
            url: 'test2',
            title: 'Hi everyone',
            author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
            community: {url: 'communism', name: 'Communism', urlPhoto: ''},
            time: new Date().getTime(),
            countComments: 15,
            likes: 130,
            dislikes: 30,
            content: [
                [
                    'Cut text'
                ],
                'This is a text',
                {imageUrl: '', title: ''},
                'text'
            ]
        }
    ],
    communityPage: {
        id: 1,
        name: 'HachiMuchiForever',
        url: 'hachimuchi',
        urlPhoto: '',
        countUsers: 34,
        countPosts: 1030,
        posts: [
            {
                id: 1,
                url: 'test',
                title: 'This is post',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                community: {url: '', name: '', urlPhoto: ''},
                time: new Date().getTime(),
                countComments: 10,
                likes: 100,
                dislikes: 30,
                content: [
                    [
                        'Cut text'
                    ],
                    'This is a text',
                    {imageUrl: '', title: ''},
                    'text'
                ]
            },
            {
                id: 2,
                url: 'test2',
                title: 'Hi everyone',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                community: {url: 'communism', name: 'Communism', urlPhoto: ''},
                time: new Date().getTime(),
                countComments: 15,
                likes: 130,
                dislikes: 30,
                content: [
                    [
                        'Cut text'
                    ],
                    'This is a text',
                    {imageUrl: '', title: ''},
                    'text'
                ]
            }
        ]
    },
    userPage: {
        id: 1,
        name: 'Yura',
        nick: 'yuriusV',
        urlPhoto: '',
        pluses: 300,
        minuses: 200,
        countComments: 123,
        posts: [
            {
                id: 1,
                url: 'test',
                title: 'This is post',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                community: {url: '', name: '', urlPhoto: ''},
                time: new Date().getTime(),
                countComments: 10,
                likes: 100,
                dislikes: 30,
                content: [
                    [
                        'Cut text'
                    ],
                    'This is a text',
                    {imageUrl: '', title: ''},
                    'text'
                ]
            },
            {
                id: 2,
                url: 'test2',
                title: 'Hi everyone',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                community: {url: 'communism', name: 'Communism', urlPhoto: ''},
                time: new Date().getTime(),
                countComments: 15,
                likes: 130,
                dislikes: 30,
                content: [
                    [
                        'Cut text'
                    ],
                    'This is a text',
                    {imageUrl: '', title: ''},
                    'text'
                ]
            }
        ],
        rating: 13,
        countPosts: 3,
        communities: [
            {
                id: 1,
                name: 'Hachers',
                url: 'hachimuchi',
                urlPhoto: ''
            }
        ]
    },


    openedPost: {
        id: 2,
        url: 'test2',
        title: 'Hi everyone',
        author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
        community: {url: 'communism', name: 'Communism', urlPhoto: ''},
        time: new Date().getTime(),
        countComments: 15,
        likes: 130,
        dislikes: 30,
        content: [
            [
                'Cut text'
            ],
            'This is a text',
            {imageUrl: '', title: ''},
            'text'
        ],
        comments: [
            {
                id: 2,
                url: 'test2',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                time: new Date().getTime(),
                likes: 130,
                dislikes: 30,
                content: ['Hi, everyOne'],
                children: [
                    {
                        id: 2,
                        url: 'test2',
                        author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                        time: new Date().getTime(),
                        likes: 130,
                        dislikes: 30,
                        content: ['Lel kok'],
                        children: [
                            
                        ]
                    }
                ]
            },
            {
                id: 4,
                url: 'test2',
                author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                time: new Date().getTime(),
                likes: 130,
                dislikes: 30,
                content: ['Hi, everyOne'],
                children: [
                    {
                        id: 5,
                        url: 'test2',
                        author: {url: '', id: 1, name: 'Yura', urlPhoto: ''},
                        time: new Date().getTime(),
                        likes: 130,
                        dislikes: 30,
                        content: ['Lel kok'],
                        children: [
                            
                        ]
                    }
                ]
            }
        ]
    }
}