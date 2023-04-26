import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from '@clerk/nextjs';

import 'bootstrap/dist/css/bootstrap.css';
import 'react-quill/dist/quill.snow.css';
import '../styles/styles.css';
import { useEffect, useState, createContext} from 'react';
import { useRouter } from 'next/router';

// import useLocalStorage from 'use-local-storage'
// import { useMediaQuery } from "react-responsive";

const publicPages = ['/', '/signin', '/signup'];
export const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
})

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('light')


  useEffect(() => {
    typeof document !== undefined
      ? require('bootstrap/dist/js/bootstrap')
      : null;

      const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(defaultDark ? 'dark' : 'light');
      console.log(theme)

  }, []);

  
  

  const { pathname } = useRouter();

  const isPublicPage = publicPages.includes(pathname);
  return (
    <ClerkProvider {...pageProps}>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <ThemeContext.Provider value={{theme, setTheme}}>
          <div className='app' data-theme={theme}>
            <SignedIn>
              <Component {...pageProps} />
            </SignedIn>

            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </div>
        </ThemeContext.Provider>
      )}
    </ClerkProvider>
  );
}
