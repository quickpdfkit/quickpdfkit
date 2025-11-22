import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import PrivacyPolicy from '@/components/pages/PrivacyPolicy'
import React from 'react'

export const metadata = {
  title: {
    default: "Privacy Policy - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Read Fix PDF Tools' Privacy Policy to understand how we collect, use, and protect your information while providing 48+ free online Fix PDF Tools. Your privacy and data security are our priority.",
  keywords: [
    "Fix PDF Tools privacy policy",
    "data protection",
    "user privacy",
    "online Fix PDF Tools privacy",
    "personal data",
    "Fix PDF Tools security",
    "privacy information",
    "website privacy",
    "PDF services privacy",
    "privacy and cookies"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <PrivacyPolicy/>
      <Footer/>
    </div>
  )
}

export default page
