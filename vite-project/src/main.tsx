import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';
import App from './App';
import { AuthProvider } from "./context/AuthProvider";


const Home = lazy(() => import('./pages/Home'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const Weather = lazy(() => import('./pages/Weather'));
const TicTacToe = lazy(() => import('./pages/TicTacToe'));
const Profile = lazy(() => import('./pages/Profile'));


const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <Home /></Suspense>
      },
      {
        path: "weather",
        element: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <Weather /></Suspense>
      },
      {
        path: "tictactoe",
        element: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <TicTacToe /></Suspense>
      },
      {
        path: "/profile",
        element: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <Profile /></Suspense>
      }
    ],
    errorElement: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <PageNotFound /></Suspense>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  </StrictMode>,
)
