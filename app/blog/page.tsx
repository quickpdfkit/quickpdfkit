import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import BlogPage from '@/components/pages/BlogPage'

export const metadata = {
  title: {
    default: "Blog - PDF Tools",
    template: "%s | PDF Tools"
  },
  description: "Read the latest updates, tips, and guides about PDF tools. Learn how to convert, edit, merge, split, compress, and manage PDFs efficiently with 48+ free online tools.",
  keywords: [
    "PDF tools blog",
    "PDF tips",
    "PDF guides",
    "online PDF tools",
    "PDF editor",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF updates",
    "free PDF tools",
    "PDF tutorials",
    "PDF management"
  ]
}

const page = () => {
  return (
    <div>
      <Header/>
      <BlogPage/>
      <Footer/>
    </div>
  )
}

export default page
