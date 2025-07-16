import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-yellow-400 px-6 py-8 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 flex-wrap">
        {/* Company Info */}
        <div>
          <h2 className="text-yellow-400 font-bold text-xl mb-2">FanBetz</h2>
          <p className="text-gray-400 text-sm max-w-xs">
            FanBetz is a paid content platform for sports bettors. For entertainment purposes only.
          </p>
          <div className="flex gap-4 mt-4 items-center">
            <span className="text-white text-sm">Stripe</span>
            <Image src="/assets/visa.png" alt="Visa" className="h-6 w-auto" width={50} height={20} />
            <Image src="/assets/mastercard.svg" alt="Mastercard" className="h-6 w-auto" width={50} height={20} />
          </div>
        </div>

        {/* Legal Links */}
        <div>
          <h3 className="text-white font-semibold mb-2">Legal</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li><Link href="/terms" className="hover:text-yellow-400">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-yellow-400">Privacy Policy</Link></li>
            <li><Link href="/compliance" className="hover:text-yellow-400">Compliance Agreement</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-white font-semibold mb-2">Follow Us</h3>
          <div className="flex gap-4 items-center">
            <a href="https://x.com/Fan_Betz" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/twitter.svg" alt="Twitter" className="h-10 w-10" width={24} height={24} />
            </a>
            <a href="https://www.instagram.com/fanbetz/" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/instagram.png" alt="Instagram" className="h-10 w-10" width={24} height={24} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <Image src="/assets/youtube.svg" alt="YouTube" className="h-14 w-14" width={24} height={24} />
            </a>
          </div>
        </div>

        {/* Company Section */}
        <div>
          <h3 className="text-white font-semibold mb-2">Company</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li><Link href="/about" className="hover:text-yellow-400">About</Link></li>
            <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li>
            <li><Link href="/team" className="hover:text-yellow-400">Our Team</Link></li>
            <li><Link href="/careers" className="hover:text-yellow-400">Careers</Link></li>
          </ul>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-8">
        © {new Date().getFullYear()} FanBetz. All rights reserved.
      </p>
    </footer>
  );
}
