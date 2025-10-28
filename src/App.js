import React, { Component } from 'react';
import ToDo, { TASK_STATUSES } from './components/ToDo';
import Auth from './components/Auth';
import { auth, db } from './firebase';
import './css/styles.css';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			task: '',
			list: [],
			done: [],
			user: null,
			loading: true
		};
		this.handleClick = this.handleClick.bind(this);
		this.removeTodo = this.removeTodo.bind(this);
		this.completeTodo = this.completeTodo.bind(this);
	}

	componentDidMount() {
		// Listen for authentication state changes
		this.unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) {
				this.setState({ user, loading: false }, () => {
					this.loadTasksFromFirestore();
				});
			} else {
				this.setState({ user: null, loading: false, list: [], done: [] });
			}
		});
	}

	componentWillUnmount() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	loadTasksFromFirestore = async () => {
		if (!this.state.user) return;

		try {
			const querySnapshot = await db.collection('tasks')
				.where('userId', '==', this.state.user.uid)
				.get();

			const todoList = [];
			const doneList = [];

			querySnapshot.forEach((doc) => {
				const task = { id: doc.id, ...doc.data() };
				if (task.status === TASK_STATUSES.DONE) {
					doneList.push(task);
				} else {
					todoList.push(task);
				}
			});

			this.setState({
				list: todoList.map(t => t.text),
				done: doneList.map(t => t.text)
			});
		} catch (error) {
			console.error('Error loading tasks:', error);
		}
	}

	onChange = (event) => {
		this.setState({ task: event.target.value });
	};

	async removeTodo(name, type) {
		let array, index;
		switch (type) {
			case TASK_STATUSES.TO_DO:
				array = [...this.state.list];
				index = array.indexOf(name);
				if (index > -1) {
					array.splice(index, 1);
					this.setState({ list: array });
					await this.deleteTaskFromFirestore(name, TASK_STATUSES.TO_DO);
				}
				break;
			case TASK_STATUSES.DONE:
				array = [...this.state.done];
				index = array.indexOf(name);
				if (index > -1) {
					array.splice(index, 1);
					this.setState({ done: array });
					await this.deleteTaskFromFirestore(name, TASK_STATUSES.DONE);
				}
				break;
			default:
				// nothing
				break;
		}
	}

	async completeTodo(name) {
		// Remove from todo, add to done
		const list = [...this.state.list];
		const done = [...this.state.done];
		const index = list.indexOf(name);
		if (index > -1) {
			list.splice(index, 1);
			done.push(name);
			this.setState({ list, done });
			await this.updateTaskStatusInFirestore(name);
		}
	}

	async handleClick() {
		if (this.state.task !== '') {
			const taskText = this.state.task;
			this.setState(
				(prevState) => ({
					task: '',
					list: [...prevState.list, prevState.task]
				})
			);
			await this.addTaskToFirestore(taskText);
		}
	}

	addTaskToFirestore = async (taskText) => {
		if (!this.state.user) return;

		try {
			await db.collection('tasks').add({
				text: taskText,
				status: TASK_STATUSES.TO_DO,
				userId: this.state.user.uid,
				createdAt: new Date().toISOString()
			});
		} catch (error) {
			console.error('Error adding task:', error);
		}
	};

	updateTaskStatusInFirestore = async (taskText) => {
		if (!this.state.user) return;

		try {
			const querySnapshot = await db.collection('tasks')
				.where('userId', '==', this.state.user.uid)
				.where('text', '==', taskText)
				.where('status', '==', TASK_STATUSES.TO_DO)
				.get();

			querySnapshot.forEach(async (document) => {
				await db.collection('tasks').doc(document.id).update({
					status: TASK_STATUSES.DONE
				});
			});
		} catch (error) {
			console.error('Error updating task:', error);
		}
	};

	deleteTaskFromFirestore = async (taskText, status) => {
		if (!this.state.user) return;

		try {
			const querySnapshot = await db.collection('tasks')
				.where('userId', '==', this.state.user.uid)
				.where('text', '==', taskText)
				.where('status', '==', status)
				.get();

			querySnapshot.forEach(async (document) => {
				await db.collection('tasks').doc(document.id).delete();
			});
		} catch (error) {
			console.error('Error deleting task:', error);
		}
	}

	handleKey = (event) => {
		if (event.key === 'Enter') {
			this.handleClick();
		}
	};

	handleAuthChange = (user) => {
		this.setState({ user });
		if (user) {
			this.loadTasksFromFirestore();
		}
	};

	render() {
		if (this.state.loading) {
			return (
				<div className="header">
					<h1 style={{ color: '#fff' }}>Loading...</h1>
				</div>
			);
		}

		if (!this.state.user) {
			return <Auth user={this.state.user} onAuthChange={this.handleAuthChange} />;
		}

		return (
			<div className="header">
				<Auth user={this.state.user} onAuthChange={this.handleAuthChange} />
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
