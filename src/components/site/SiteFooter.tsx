import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="text-sm font-semibold">Aditya Construction</div>
          <p className="mt-3 text-sm text-white/70">
            Premium construction delivery with modern project management.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Company</div>
          <div className="mt-3 space-y-2 text-white/70">
            <Link className="block hover:text-white" href="/services">Services</Link>
            <Link className="block hover:text-white" href="/projects">Projects</Link>
            <Link className="block hover:text-white" href="/contact">Contact</Link>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-semibold">Legal</div>
          <div className="mt-3 space-y-2 text-white/70">
            <Link className="block hover:text-white" href="/privacy-policy">Privacy Policy</Link>
            <Link className="block hover:text-white" href="/terms">Terms & Conditions</Link>
            <Link className="block hover:text-white" href="/disclaimer">Disclaimer</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Aditya Construction. All rights reserved.
      </div>
    </footer>
  )
}
