import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ContactUs from '@/components/pages/ContactUs'

export const metadata = {
  title: {
    default: "Contact Us - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Get in touch with the PDF Tools team. Reach out for support, inquiries, feedback, or partnership opportunities. We're here to help with all your PDF needs.",
  keywords: [
    "Contact PDF Tools",
    "PDF tools support",
    "PDF tools help",
    "reach PDF tools team",
    "PDF inquiries",
    "PDF feedback",
    "PDF partnership",
    "contact page",
    "PDF services contact",
    "online PDF tools support"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <ContactUs/>
      <Footer/>
    </div>
  )
}

export default page
