import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import TermsAndConditions from '@/components/pages/TermsAndConditions'
import React from 'react'

export const metadata = {
  title: {
    default: "Terms and Conditions - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Read the Terms and Conditions of Fix PDF Tools to understand the rules, responsibilities, and guidelines for using our 48+ free online Fix PDF Tools safely and responsibly.",
  keywords: [
    "Fix PDF Tools terms and conditions",
    "Fix PDF Tools usage rules",
    "online Fix PDF Tools policy",
    "Fix PDF Tools guidelines",
    "PDF editor terms",
    "PDF converter terms",
    "website terms",
    "PDF services rules",
    "Fix PDF Tools legal",
    "user agreement"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <TermsAndConditions/>
      <Footer/>
    </div>
  )
}

export default page
