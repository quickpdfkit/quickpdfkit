import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import AboutUs from '@/components/pages/AboutUs'

export const metadata = {
  title: {
    default: "About Us - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Learn more about PDF Tools, our mission, and how we provide 48+ free online PDF tools to help you convert, edit, merge, split, compress, and protect PDFs with ease.",
  keywords: [
    "About PDF Tools",
    "PDF tools team",
    "PDF tools mission",
    "free PDF tools",
    "online PDF converter",
    "PDF editor",
    "PDF management",
    "PDF services",
    "company information",
    "PDF tools about"
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
