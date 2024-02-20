import './globals.css'
import { Provider } from 'jotai';
import { Inter } from 'next/font/google'
import Intial from './Intial';
const inter = Inter({
  subsets: ['latin'],
  variable: "--font-inter"
});

import { Toaster } from '../components/ui/toaster';

export const metadata = {
  title: 'Folder Chat',
  description: 'Developed By Hexon Global',
}

export default function RootLayout({ children }) {
  
  return (

    <html lang="en" className='overflow-y-scroll no-scrollbar'>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.variable}>

        <Provider>
          <Intial />
          {children}
          <Toaster />
        </Provider>
      </body>

    </html>

  )
}
