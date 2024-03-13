import { useState, useEffect } from 'react'

const Login = ({ login, register })=> {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submitLogin = ev => {
    ev.preventDefault();
    login({ username, password });
  }

  const submitRegister = ev =>{
    ev.preventDefault();
    register({username, password});
  }

  return (
    <form>
      <input value={ username } placeholder='username' onChange={ ev=> setUsername(ev.target.value)}/>
      <input value={ password} placeholder='password' onChange={ ev=> setPassword(ev.target.value)}/>
      <button onClick={submitLogin} disabled={ !username || !password }>Login</button>
      <button onClick={submitRegister} disabled={ !username || !password }>Register</button>
    </form>
  );
}