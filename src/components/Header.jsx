import React from "react";
import { Link } from "react-router-dom";

const Header = ({ user, setUser }) => {
  const linkClass =
    "text-white font-bold uppercase px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.4)] hover:backdrop-blur-lg border border-transparent hover:border-white/25";

  return (
    <header className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gray-500/30 dark:bg-gray-800/30 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <ul className="flex gap-4 m-0 p-0 list-none">
          <li>
            <Link to="/Home" className={linkClass}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/About" className={linkClass}>
              About
            </Link>
          </li>
          <li>
            <Link to="/Contact" className={linkClass}>
              Contact
            </Link>
          </li>
          <li>
            <Link to="/Calc" className={linkClass}>
              Calculator
            </Link>
          </li>
          <li>
            <Link to="/Avg" className={linkClass}>
              Average
            </Link>
          </li>
          <li>
            <Link to="/Gauss" className={linkClass}>
              Gauss
            </Link>
          </li>
          {!user && (
            <li>
              <Link to="/Login" className={linkClass}>
                Login
              </Link>
            </li>
          )}
          {!user && (
            <li>
              <Link to="/Register" className={linkClass}>
                Register
              </Link>
            </li>
          )}
        </ul>
        {user && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-sm border border-white/10 text-white">
            <span>
              Hello, <b>{user.username}</b>!
            </span>
            <button
              type="button"
              onClick={() => setUser(null)}
              className="bg-red-500/80 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
