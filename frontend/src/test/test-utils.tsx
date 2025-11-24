import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { DropdownProvider } from '../contexts/DropdownContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { ChatProvider } from '../contexts/ChatContext';

// Custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <DropdownProvider>
            <ChatProvider>
              <NotificationProvider>
                <AccessibilityProvider>
                  <BrowserRouter>
                    {children}
                  </BrowserRouter>
                </AccessibilityProvider>
              </NotificationProvider>
            </ChatProvider>
          </DropdownProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

