import React from 'react';
import './App.css';
import Signup from './components/Signup';
import Login from './components/Login';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './components/dashbord/dashboard.jsx';
import Home from './components/pages/Home.jsx';
import WatchList from './components/pages/watchList.jsx';
import History from './components/pages/History.jsx';
import Profile from './components/pages/Profile.jsx';
import ProtectedRoute from './store/auth/protectedRoute.jsx';
import UploadVideo from './components/pages/uploadVideo.jsx';
import WatchPage from './components/watchPage/WatchPage.jsx'
import { useDispatch } from 'react-redux';
import {checkBackendAuth} from './store/auth/checkAuthAndSync.js'
import { useEffect } from 'react';

function App() {


  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkBackendAuth());
  }, [dispatch]);
  const myroute = createBrowserRouter([
    {
      path: '/',
      element: <Dashboard />,
      children: [
        { index: true, element: <Home /> }, 
        { path: 'home', element: <Home /> },
        {
          path: 'watchList',
          element: (
            <ProtectedRoute>
              <WatchList />
            </ProtectedRoute>
          ),
        },
        {
          path: 'history',
          element: (
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          ),
        },
        {
          path: 'profile',
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: 'uploadvideo',
          element: (
            <ProtectedRoute>
              <UploadVideo />
            </ProtectedRoute>
          ),
        },
      ],
    },
    { path: '/watch/:videoId', element: <WatchPage /> },
    { path: '/signup', element: <Signup /> },
    { path: '/login', element: <Login /> },
    { path: '*', element: <h1 className="text-center text-2xl mt-10">404 - Page Not Found</h1> }, // Fallback route
  ]);

  return (
    <div>
      <RouterProvider router={myroute} />
  </div>
  );
}

export default App;
