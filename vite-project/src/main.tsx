import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy } from 'react';
import App from './App';
import { ClerkProvider } from '@clerk/react'

const Home = lazy(() => import('./pages/Home'));
const PageNotFound = lazy(() => import('./pages/PageNotFound'));
const Weather = lazy(() => import('./pages/Weather'));
const TicTacToe = lazy(() => import('./pages/TicTacToe'));


const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;


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
      }
    ],
    errorElement: <Suspense fallback={<div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>}> <PageNotFound /></Suspense>
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={appRouter} />
    </ClerkProvider>
  </StrictMode>,
)
