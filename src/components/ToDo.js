import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'react-feather';

export default (props) => {
	const [editingId, setEditingId] = useState(null);
	const [editText, setEditText] = useState('');

	const handleEdit = (todo) => {
		setEditingId(todo.id);
		setEditText(todo.text);
	};

	const handleSaveEdit = (todo) => {
		if (editText.trim()) {
			props.updateTodo(todo.id, editText.trim());
			setEditingId(null);
			setEditText('');
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditText('');
	};

	const todoList = props.tasks.map((todo) => (
		<div key={todo.id} className="todo-item">
			{editingId === todo.id ? (
				<React.Fragment>
					<input
						type="text"
						value={editText}
						onChange={(e) => setEditText(e.target.value)}
						className="edit-input"
						onKeyPress={(e) => {
							if (e.key === 'Enter') handleSaveEdit(todo);
							if (e.key === 'Escape') handleCancelEdit();
						}}
						autoFocus
					/>
					<div className="todo-actions">
						<Check 
							className="action-icon save-icon" 
							size={18} 
							onClick={() => handleSaveEdit(todo)}
							title="Save"
						/>
						<X 
							className="action-icon cancel-icon" 
							size={18} 
							onClick={handleCancelEdit}
							title="Cancel"
						/>
					</div>
				</React.Fragment>
			) : (
				<React.Fragment>
					<div className="todo-text">
						{todo.text}
					</div>
					<div className="todo-actions">
						<Edit2 
							className="action-icon edit-icon" 
							size={18} 
							onClick={() => handleEdit(todo)}
							title="Edit"
						/>
						<Trash2 
							className="action-icon delete-icon" 
							size={18} 
							onClick={() => props.deleteTodo(todo.id)}
							title="Delete"
						/>
					</div>
				</React.Fragment>
			)}
		</div>
	));

	return (
		<div className="todos-container">
			{todoList}
		</div>
	);
};
