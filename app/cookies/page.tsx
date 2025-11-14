import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import CookiePolicy from '@/components/pages/CookiePolicy'
import React from 'react'

export const metadata = {
  title: {
    default: "Cookie Policy - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Read PDF Tools' Cookie Policy to understand how we use cookies on our website to enhance your experience, improve functionality, and analyze usage.",
  keywords: [
    "PDF Tools cookie policy",
    "cookies usage",
    "online PDF tools privacy",
    "website cookies",
    "PDF Tools data policy",
    "cookie management",
    "user tracking",
    "PDF tools website",
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
