import * as React from 'react';
import Poll from 'react-polls';
import commonApi from '../commonApi';
import { Grid, List, ListItem, Divider, Button, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';

type PollAnswer = {
	option: string;
	votes: number
}

type PollObj = {
	id: number;
	question: string;
	answers: PollAnswer[]
}


class VoteBlock extends React.Component<any, any> {

	constructor(props) {
		super(props)
		this.state = {
			selected: 0
		}
    }
    
    handleChange = (e) => {
        this.setState({selected: +e.target.value})
    }

    
    getVoteVariants = () => {
        return (
            <RadioGroup
                value={this.state.selected}
                onChange={this.handleChange}>
                {this.props.answers.map(x => (<FormControlLabel style={{fontSize: '20px'}} value={x.id} control={<Radio />} label={x.option} />))}
            </RadioGroup>
        )
    }

    getVoteResults = () => {
        return (this.props.answers.sort((x, y) => y.votes - x.votes).map(x => (
        [<span style={{fontSize: '21px'}}><b>{x.option}</b>&nbsp;&nbsp;&nbsp;{x.votes}</span>,<br/>])))
    }

	render = () => {
		return (
			<Grid container style={{border: '1px solid black', borderRadius: '4px', padding: '15px'}} >
                <Grid item xs={12} style={{fontSize: '22px'}}>
                    <b>{this.props.question}</b>
                </Grid>
				<Grid item xs={12}>
                    {this.props.voteMode ? 
                        this.getVoteVariants()
                    : this.getVoteResults()}
                </Grid>
                <Grid item xs={12}>
                    {this.props.voteMode ? 
                        (<Button 
                            variant="outlined"
                            onClick={x => (this.props.onVote && this.state.selected && this.props.onVote(+this.state.selected))}>Проголосувати</Button>)
                        : <div/>}
                </Grid>
			</Grid>
		);
	}
};

export default VoteBlock;