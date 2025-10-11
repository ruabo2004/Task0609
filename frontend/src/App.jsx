import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import router from '@/router';

/**
 * Main App component
 * Sets up routing, context providers, and global components
 */
function App() {
  return (
    <AuthProvider>
      <div className="App">
        {/* React Router */}
        <RouterProvider router={router} />
        
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;