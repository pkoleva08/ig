import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = ({ user, setUser }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <ul>
          <li>
            <Link to="/Home">Home</Link>
          </li>
          <li>
            <Link to="/About">About</Link>
          </li>
          <li>
            <Link to="/Contact">Contact</Link>
          </li>
          <li>
            <Link to="/Calc">Calculator</Link>
          </li>
          <li>
            <Link to="/Avg">Average</Link>
          </li>
          <li>
            <Link to="/Gauss">Gauss</Link>
          </li>
          {!user && (
            <li>
              <Link to="/Login">Login</Link>
            </li>
          )}
          {!user && (
            <li>
              <Link to="/Register">Register</Link>
            </li>
          )}
        </ul>
        {user && (
          <div className="user-greeting">
            Hello, <b>{user.username}</b>!
            <button type="button" onClick={() => setUser(null)}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
