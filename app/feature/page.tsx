import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import OurFeatures from '@/components/pages/OurFeatures'
import React from 'react'

export const metadata = {
  title: {
    default: "Our Features - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Explore the powerful features of PDF Tools. Learn how our 48+ free online PDF tools can help you convert, merge, split, compress, edit, and protect your PDFs efficiently.",
  keywords: [
    "PDF tools features",
    "PDF editor features",
    "online PDF tools",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF management tools",
    "PDF tools capabilities",
    "free PDF tools"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <OurFeatures/>
      <Footer/>
    </div>
  )
}

export default page
