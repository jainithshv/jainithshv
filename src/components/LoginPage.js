// import React, { useState } from 'react';
// import '../Styles/LoginPage.css';
// import studyIllustration from '../Styles/Login.png';

// function LoginPage({ onLogin }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (email.trim() && password.trim()) {
//       onLogin(email);
//     } else {
//       setError('Please enter both email and password.');
//     }
//   };

//   return (
//     <div className="container">
//       <div className="login-section">
//         <h2 className="login-here">Login Here</h2>
//         {error && <div className="error-message">{error}</div>}
//         <form onSubmit={handleSubmit}>
//           <label htmlFor="email">Email id</label>
//           <input 
//             type="email" 
//             id="email" 
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <label htmlFor="password">Password</label>
//           <input 
//             type="password" 
//             id="password" 
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <button type="submit">Confirm</button>
//         </form>
//       </div>
//       <div className="info-section">
//         <h1>KNOWLEDGE INSTITUTE OF TECHNOLOGY</h1>
//         <div className="autonomous-badge">
//           <span>AN AUTONOMOUS INSTITUTION</span>
//         </div>
//         <img src={studyIllustration} alt="Study Illustration" className="illustration" />
//       </div>
//     </div>
//   );
// }

// export default LoginPage;