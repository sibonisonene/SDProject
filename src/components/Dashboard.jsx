import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthDetails from '../components/AuthDetails';
import { AuthContext } from '../AuthContext';
import useGetProfile from '../components/hooks/useGetProfile';
import { capitalizeFirstLetter } from '../utils';
import '../index.css';

const Dashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const { profile } = useGetProfile();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <AuthDetails onUserChange={setUser} />
        {authUser && profile.length > 0 && (
          <div>
            <p>
              Welcome, {capitalizeFirstLetter(profile[0].fullName)} {capitalizeFirstLetter(profile[0].surname)}!
            </p>
            <div className="dashboard-links">
              <Link to="/components/Issues" className="dashboard-link">
                <div className="link-content">
                  <div className="link-image">⚠️</div>
                  <p>Issues</p>
                </div>
              </Link>
              <Link to="/components/Fines" className="dashboard-link">
                <div className="link-content">
                  <div className="link-image">💸</div>
                  <p>Fines</p>
                </div>
              </Link>
              <Link to="/components/Reports" className="dashboard-link">
                <div className="link-content">
                  <div className="link-image">📄</div>
                  <p>Reports</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
