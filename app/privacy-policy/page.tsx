import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import PrivacyPolicy from '@/components/pages/PrivacyPolicy'
import React from 'react'

export const metadata = {
  title: {
    default: "Privacy Policy - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Read PDF Tools' Privacy Policy to understand how we collect, use, and protect your information while providing 48+ free online PDF tools. Your privacy and data security are our priority.",
  keywords: [
    "PDF Tools privacy policy",
    "data protection",
    "user privacy",
    "online PDF tools privacy",
    "personal data",
    "PDF tools security",
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
