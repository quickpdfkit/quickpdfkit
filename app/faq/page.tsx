import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import FAQSection from '@/components/pages/FAQSection'
import React from 'react'

export const metadata = {
  title: {
    default: "FAQ - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Find answers to frequently asked questions about PDF Tools. Learn how to convert, edit, merge, split, compress, and protect PDFs using our 48+ free online tools.",
  keywords: [
    "PDF tools FAQ",
    "frequently asked questions",
    "PDF tools help",
    "PDF editor guide",
    "online PDF converter FAQ",
    "merge PDF questions",
    "split PDF questions",
    "compress PDF guide",
    "PDF tools support",
    "free PDF tools help"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <FAQSection/>
      <Footer/>
    </div>
  )
}

export default page
