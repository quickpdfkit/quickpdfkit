import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import CookiePolicy from '@/components/pages/CookiePolicy'
import React from 'react'

export const metadata = {
  title: {
    default: "Cookie Policy - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Read Fix PDF Tools' Cookie Policy to understand how we use cookies on our website to enhance your experience, improve functionality, and analyze usage.",
  keywords: [
    "Fix PDF Tools cookie policy",
    "cookies usage",
    "online Fix PDF Tools privacy",
    "website cookies",
    "Fix PDF Tools data policy",
    "cookie management",
    "user tracking",
    "Fix PDF Tools website",
    "privacy and cookies",
    "online PDF services"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <CookiePolicy/>
      <Footer/>
    </div>
  )
}

export default page
