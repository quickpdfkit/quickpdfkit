import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import AboutUs from '@/components/pages/AboutUs'

export const metadata = {
  title: {
    default: "About Us - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Learn more about Fix PDF Tools, our mission, and how we provide 48+ free online Fix PDF Tools to help you convert, edit, merge, split, compress, and protect PDFs with ease.",
  keywords: [
    "About Fix PDF Tools",
    "Fix PDF Tools team",
    "Fix PDF Tools mission",
    "free Fix PDF Tools",
    "online PDF converter",
    "PDF editor",
    "PDF management",
    "PDF services",
    "company information",
    "Fix PDF Tools about"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <AboutUs/>
      <Footer/>
    </div>
  )
}

export default page
