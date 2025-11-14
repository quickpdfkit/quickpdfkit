import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import TermsAndConditions from '@/components/pages/TermsAndConditions'
import React from 'react'

export const metadata = {
  title: {
    default: "Terms and Conditions - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Read the Terms and Conditions of PDF Tools to understand the rules, responsibilities, and guidelines for using our 48+ free online PDF tools safely and responsibly.",
  keywords: [
    "PDF Tools terms and conditions",
    "PDF tools usage rules",
    "online PDF tools policy",
    "PDF tools guidelines",
    "PDF editor terms",
    "PDF converter terms",
    "website terms",
    "PDF services rules",
    "PDF tools legal",
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
