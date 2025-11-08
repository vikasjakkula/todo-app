import React, { Component } from 'react';
import ToDo from './components/ToDo';
import Auth from './components/Auth';
import { supabase } from './supabase';
import './css/styles.css';

export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			task: '',
			tasks: [],
			user: null,
			loading: true,
			isOptimizing: false
		};
	}

	componentDidMount() {
		this.checkUser();
	}

	componentWillUnmount() {
		if (this.tasksSubscription) {
			this.tasksSubscription.unsubscribe();
		}
	}

	checkUser = async () => {
		const { data } = await supabase.auth.getSession();
		if (data && data.session && data.session.user) {
			this.setState({ user: data.session.user, loading: false }, () => {
				this.loadTasks();
			});
		} else {
			this.setState({ loading: false });
		}
	};

	loadTasks = async () => {
		if (!this.state.user) return;

		try {
			const { data, error } = await supabase
				.from('todos')
				.select('*')
				.eq('user_id', this.state.user.id)
				.order('created_at', { ascending: false });

			if (error) throw error;
			this.setState({ tasks: data || [] });

			// Subscribe to real-time changes
			this.tasksSubscription = supabase
				.channel('todos')
				.on(
					'postgres_changes',
					{ 
						event: '*', 
						schema: 'public', 
						table: 'todos',
						filter: 'user_id=eq.' + this.state.user.id
					},
					() => {
						this.loadTasks();
					}
				)
				.subscribe();
		} catch (error) {
			console.error('Error loading tasks:', error);
		}
	};

	onChange = (event) => {
		this.setState({ task: event.target.value });
	};

	optimizeInput = async () => {
		if (!this.state.task.trim()) return;

		this.setState({ isOptimizing: true });
		
		try {
			const originalText = this.state.task;
			// Simple optimization: trim, capitalize first letter, remove extra spaces
			const optimized = originalText
				.trim()
				.replace(/\s+/g, ' ')
				.replace(/^./, str => str.toUpperCase())
				.replace(/\bi\b/g, 'I'); // Capitalize standalone 'i'
			
			this.setState({ task: optimized });
		} catch (error) {
			console.error('Error optimizing input:', error);
		} finally {
			setTimeout(() => {
				this.setState({ isOptimizing: false });
			}, 300);
		}
	};

	addTodo = async () => {
		if (!this.state.task.trim() || !this.state.user) return;

		try {
			const { error } = await supabase
				.from('todos')
				.insert([{
					user_id: this.state.user.id,
					user_email: this.state.user.email,
					text: this.state.task.trim(),
					completed: false
				}]);

			if (error) throw error;
			this.setState({ task: '' });
		} catch (error) {
			console.error('Error adding task:', error);
			alert('Failed to add task. Please try again.');
		}
	};

	updateTodo = async (id, newText) => {
		try {
			const { error } = await supabase
				.from('todos')
				.update({ text: newText, updated_at: new Date().toISOString() })
				.eq('id', id)
				.eq('user_id', this.state.user.id);

			if (error) throw error;
		} catch (error) {
			console.error('Error updating task:', error);
			alert('Failed to update task. Please try again.');
		}
	};

	deleteTodo = async (id) => {
		try {
			const { error } = await supabase
				.from('todos')
				.delete()
				.eq('id', id)
				.eq('user_id', this.state.user.id);

			if (error) throw error;
		} catch (error) {
			console.error('Error deleting task:', error);
			alert('Failed to delete task. Please try again.');
		}
	};

	handleKey = (event) => {
		if (event.key === 'Enter') {
			this.addTodo();
		}
	};

	handleAuthChange = (user) => {
		this.setState({ user });
		if (user) {
			this.loadTasks();
		} else {
			this.setState({ tasks: [] });
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
				<div className="input-container">
					<input
						placeholder="Ex: Buy groceries"
						maxLength={200}
						value={this.state.task}
						type="text"
						onKeyPress={this.handleKey}
						onChange={this.onChange}
						className="task-input"
					/>
					<button 
						onClick={this.optimizeInput} 
						className="optimize-btn"
						disabled={this.state.isOptimizing || !this.state.task.trim()}
						title="Optimize input"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles-icon lucide-sparkles">
							<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
							<path d="M20 2v4"/>
							<path d="M22 4h-4"/>
							<circle cx="4" cy="20" r="2"/>
						</svg>
					</button>
					<button 
						onClick={this.addTodo} 
						className="add-btn"
						style={{ color: '#fff' }}
					>
						+
					</button>
				</div>
				<ToDo
					tasks={this.state.tasks}
					updateTodo={this.updateTodo}
					deleteTodo={this.deleteTodo}
				/>
			</div>
		);
	}
}
