import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import ContactUs from '@/components/pages/ContactUs'

export const metadata = {
  title: {
    default: "Contact Us - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Get in touch with the Fix PDF Tools team. Reach out for support, inquiries, feedback, or partnership opportunities. We're here to help with all your PDF needs.",
  keywords: [
    "Contact Fix PDF Tools",
    "Fix PDF Tools support",
    "Fix PDF Tools help",
    "reach Fix PDF Tools team",
    "PDF inquiries",
    "PDF feedback",
    "PDF partnership",
    "contact page",
    "PDF services contact",
    "online Fix PDF Tools support"
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
