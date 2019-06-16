import * as React from 'react';
import Poll from 'react-polls';
import commonApi from '../commonApi';
import { Grid } from '@material-ui/core';

type PollAnswer = {
	option: string;
	votes: number
}

type PollObj = {
	id: number;
	question: string;
	answers: PollAnswer[]
}

const mapPollFromLoadedToObject = poll => {
	return {
		id: poll.id,
		question: poll.title,
		answers: poll.votes.map(x => ({option: x.name, votes: 0}))
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
		const pollsToUpdate = this.state.polls.map((x, i) => [x, i]).filter(x => x[0].id === poll.Id)

		for (let x of pollsToUpdate) {
			x.answers = this.aggregateVotes(votes)(poll.votes)
		}

        this.setState({polls: this.state.polls})
        console.log(this.state, poll, votes)
	}

	aggregateVotes = votes => variants => {
		return variants.map(variant => {
			return {
				option: variant.name,
				votes: votes.fitler(x => x.vote === variant.id)
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
			.then(this.updateVotesFromServer(pollObj))
	}

	renderPoll = (pollObj, i) => {
		return (
			<Grid item xs={4}>
				<Poll question={pollObj.question} answers={pollObj.answers} onVote={this.handleVote(pollObj)} />
			</Grid>
		)
	}

	render = () => {
		return (
			<Grid container>
				{this.state.polls.map(this.renderPoll)}
			</Grid>
		);
	}
};

export default VoteBlock;