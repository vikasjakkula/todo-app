import React, { Component } from 'react';
import ToDo, { TASK_STATUSES } from './components/ToDo';
import './css/styles.css';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			task: '',
			list: [
				'Check it out in GitHub',
				'Made with ❤️ by Alyssa X',
				'Try making a new task above 👆',
				'Build your own!'
			],
			done: []
		};
		this.handleClick = this.handleClick.bind(this);
		this.removeTodo = this.removeTodo.bind(this);
		this.completeTodo = this.completeTodo.bind(this);
	}

	componentDidMount() {
		const todo = localStorage.getItem('todo');
		const done = localStorage.getItem('done');
		if (todo !== null) {
			this.setState({ list: JSON.parse(todo) });
		}
		if (done !== null) {
			this.setState({ done: JSON.parse(done) });
		}
	}

	onChange = (event) => {
		this.setState({ task: event.target.value });
	};

	removeTodo(name, type) {
		let array, index;
		switch (type) {
			case TASK_STATUSES.TO_DO:
				array = [...this.state.list];
				index = array.indexOf(name);
				if (index > -1) {
					array.splice(index, 1);
					this.setState({ list: array }, () => {
						localStorage.setItem('todo', JSON.stringify(this.state.list));
					});
				}
				break;
			case TASK_STATUSES.DONE:
				array = [...this.state.done];
				index = array.indexOf(name);
				if (index > -1) {
					array.splice(index, 1);
					this.setState({ done: array }, () => {
						localStorage.setItem('done', JSON.stringify(this.state.done));
					});
				}
				break;
			default:
				// nothing
				break;
		}
	}

	completeTodo(name) {
		// Remove from todo, add to done
		const list = [...this.state.list];
		const done = [...this.state.done];
		const index = list.indexOf(name);
		if (index > -1) {
			list.splice(index, 1);
			done.push(name);
			this.setState({ list, done }, () => {
				localStorage.setItem('todo', JSON.stringify(this.state.list));
				localStorage.setItem('done', JSON.stringify(this.state.done));
			});
		}
	}

	handleClick() {
		if (this.state.task !== '') {
			this.setState(
				(prevState) => ({
					task: '',
					list: [...prevState.list, prevState.task]
				}),
				() => {
					localStorage.setItem('todo', JSON.stringify(this.state.list));
					localStorage.setItem('done', JSON.stringify(this.state.done));
				}
			);
		}
	}

	handleKey = (event) => {
		if (event.key === 'Enter') {
			this.handleClick();
		}
	};

	render() {
		return (
			<div className="header">
				<h1 className="title" style={{ color: '#fff', fontSize: '2.5em' }}>My tasks</h1>
				<input
					placeholder="Ex: Buy groceries"
					maxLength={80}
					value={this.state.task}
					type="text"
					onKeyPress={this.handleKey}
					onChange={this.onChange}
				/>
				<button onClick={this.handleClick} style={{ color: '#fff' }}>+</button>
				<ToDo
					tasks={this.state.list}
					done={this.state.done}
					remove={this.removeTodo}
					complete={this.completeTodo}
				/>
			</div>
		);
	}
}
