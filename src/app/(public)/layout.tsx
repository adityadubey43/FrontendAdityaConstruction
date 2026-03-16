import SiteFooter from '@/components/site/SiteFooter'
import SiteNavbar from '@/components/site/SiteNavbar'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteNavbar />
      <main className="pt-20">{children}</main>
      <SiteFooter />
    </div>
  )
}
