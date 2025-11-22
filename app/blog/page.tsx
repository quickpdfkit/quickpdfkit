import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import BlogPage from '@/components/pages/BlogPage'

export const metadata = {
  title: {
    default: "Blog - Fix PDF Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Read the latest updates, tips, and guides about Fix PDF Tools. Learn how to convert, edit, merge, split, compress, and manage PDFs efficiently with 48+ free online tools.",
  keywords: [
    "Fix PDF Tools blog",
    "PDF tips",
    "PDF guides",
    "online Fix PDF Tools",
    "PDF editor",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF updates",
    "free Fix PDF Tools",
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
