import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';
import { router } from '@/router';
import { colors } from '@/theme';

import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: colors.sidebar.DEFAULT, color: colors.content.inverse, fontSize: '14px' },
            success: { iconTheme: { primary: colors.success[500], secondary: colors.content.inverse } },
            error: { iconTheme: { primary: colors.danger[500], secondary: colors.content.inverse } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
