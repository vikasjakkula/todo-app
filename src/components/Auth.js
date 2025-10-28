import React from 'react';
import { auth, googleProvider } from '../firebase';

const Auth = ({ user, onAuthChange }) => {
	const signInWithGoogle = async () => {
		try {
			const result = await auth.signInWithPopup(googleProvider);
			onAuthChange(result.user);
		} catch (error) {
			console.error('Error signing in with Google:', error);
			alert('Failed to sign in. Please try again.');
		}
	};

	const handleSignOut = async () => {
		try {
			await auth.signOut();
			onAuthChange(null);
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	if (user) {
		return (
			<div className="auth-container">
				<div className="user-info">
					<img 
						src={user.photoURL} 
						alt={user.displayName} 
						className="user-avatar"
					/>
					<span className="user-name">{user.displayName}</span>
					<button onClick={handleSignOut} className="sign-out-btn">
						Sign Out
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-container">
			<div className="sign-in-container">
				<h1 className="title" style={{ color: '#fff', fontSize: '2.5em' }}>
					My Tasks
				</h1>
				<p style={{ fontSize: '16px', marginBottom: '30px' }}>
					Sign in with Google to save your tasks
				</p>
				<button onClick={signInWithGoogle} className="google-sign-in-btn">
					<svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '10px' }}>
						<path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
						<path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
						<path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
						<path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
					</svg>
					Sign in with Google
				</button>
			</div>
		</div>
	);
};

export default Auth;
