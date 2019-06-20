import * as React from 'react';
import Poll from 'react-polls';
import commonApi from '../commonApi';
import { Grid } from '@material-ui/core';
import VoteBox from './VoteBox'

type PollAnswer = {
	option: string;
	votes: number
}

type PollObj = {
	id: number;
	question: string;
    answers: PollAnswer[],
    votes: PollAnswer[],
    isVoted: boolean
}

const mapPollFromLoadedToObject = poll => {
	return {
		id: poll.id,
		question: poll.title,
        answers: poll.votes.map((x, i) => ({id: i, option: x.name, votes: 0})),
        isVoted: poll.isVoted > 0,
        votes: poll.votes
	}
}

class VoteBlock extends React.Component<any, any> {

	constructor(props) {
		super(props)
		this.state = {
			polls: []
		}
	}

	componentDidMount = () => {
		console.log(this.props.postId)
		commonApi.loadPollsData(this.props.postId).then(polls => {
			this.initPolls(polls)
			for (let poll of polls) {
				commonApi.loadPollData(poll.id).then(this.updateVotesFromServer(poll))
			}
		})
	}

	initPolls = (polls) => {
		this.setState({ polls: polls.map(mapPollFromLoadedToObject) })
	}

	updateVotesFromServer = poll => votes => {

		for (let x of this.state.polls) {
            if (x.id == poll.id) {
                x.answers = this.aggregateVotes(votes)(poll.votes)
            }
		}

        this.setState({polls: this.state.polls})
        console.log(this.state, poll, votes)
	}

	aggregateVotes = votes => variants => {
		return variants.map((variant, i) => {
			return {
                id: i,
				option: variant.name,
				votes: votes.filter(x => x.vote === variant.id).length
			}
		})
	}

	handleVote = (pollObj: PollObj) => voteAnswer => {
		const answers = pollObj.answers
		const newPollAnswers = answers.map(answer => {
			if (answer.option === voteAnswer) answer.votes++
			return answer
		})

		const currentPoll = this.state.polls.map((x, i) => [x, i]).filter(x => x[0].id === pollObj.id)
		if (currentPoll.length == 1) {
			this.state.polls[currentPoll[0][1]].answers = newPollAnswers
		}
		const polls = this.state.polls

        commonApi.makePollChoice({ pollId: pollObj.id, choice: voteAnswer })
            .then(x => {
                pollObj.isVoted = true;
                return x;
            })
			.then(this.updateVotesFromServer(pollObj))
	}

	renderPoll = (pollObj, i) => {
		return [
            <Grid item xs={2}/>,
			<Grid item xs={8} style={{padding: '30px'}}>
                <VoteBox
                    voteMode={!pollObj.isVoted} 
                    question={pollObj.question} 
                    answers={pollObj.answers} 
                    onVote={this.handleVote(pollObj)} />
			</Grid>,
            <Grid item xs={2}/>
        ]
	}

	render = () => {
		return (
			<Grid container style={{margin: '20px'}}>
				{this.state.polls.map(this.renderPoll)}
			</Grid>
		);
	}
};

export default VoteBlock;