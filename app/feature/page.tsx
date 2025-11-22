import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import OurFeatures from '@/components/pages/OurFeatures'
import React from 'react'

export const metadata = {
  title: {
    default: "Our Features - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Explore the powerful features of Fix PDF Tools. Learn how our 48+ free online Fix PDF Tools can help you convert, merge, split, compress, edit, and protect your PDFs efficiently.",
  keywords: [
    "Fix PDF Tools features",
    "PDF editor features",
    "online Fix PDF Tools",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF management tools",
    "Fix PDF Tools capabilities",
    "free Fix PDF Tools"
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
