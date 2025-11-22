import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import FAQSection from '@/components/pages/FAQSection'
import React from 'react'

export const metadata = {
  title: {
    default: "FAQ - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Find answers to frequently asked questions about Fix PDF Tools. Learn how to convert, edit, merge, split, compress, and protect PDFs using our 48+ free online tools.",
  keywords: [
    "Fix PDF Tools FAQ",
    "frequently asked questions",
    "Fix PDF Tools help",
    "PDF editor guide",
    "online PDF converter FAQ",
    "merge PDF questions",
    "split PDF questions",
    "compress PDF guide",
    "Fix PDF Tools support",
    "free Fix PDF Tools help"
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
