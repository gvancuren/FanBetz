export const metadata = {
    title: 'About FanBetz | Bet Smarter, Win Bigger',
    description: 'Learn more about FanBetz and our mission to revolutionize sports betting content.',
  };
  
  export default function AboutPage() {
    return (
      <main className="min-h-screen bg-black text-white px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-4xl font-extrabold text-yellow-400">About FanBetz</h1>
  
          <section className="space-y-4">
            <p className="text-lg text-gray-300">
              <strong>FanBetz</strong> is the ultimate platform for sports bettors to monetize their expertise, build their brand, and share exclusive picks and insights with paying subscribers.
            </p>
            <p className="text-lg text-gray-300">
              Think of us as the <strong>OnlyFans for professional bettors</strong> — a place where creators earn 80% of their revenue, and fans get premium access to top-tier betting content.
            </p>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-300">Our Mission</h2>
            <p className="text-lg text-gray-300">
              We're on a mission to make sports betting content more transparent, valuable, and creator-driven. FanBetz empowers professionals to take control of their content, set their own pricing, and engage directly with their audience.
            </p>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-300">Why FanBetz?</h2>
            <ul className="list-disc pl-5 text-gray-300 text-lg space-y-2">
              <li>⚡ 80% earnings to creators</li>
              <li>📊 Build your following and track your growth</li>
              <li>💰 Sell picks individually or by subscription</li>
              <li>🔒 All payments handled securely through Stripe</li>
              <li>🎯 Built for serious bettors who want full control</li>
            </ul>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-300">Built by Bettors, for Bettors</h2>
            <p className="text-lg text-gray-300">
              FanBetz was founded by passionate entrepreneurs and betting enthusiasts who were tired of clunky platforms, unfair payout systems, and limited creator tools. We’re building something better — a sleek, powerful system that puts creators first.
            </p>
          </section>
  
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-yellow-300">Join Us</h2>
            <p className="text-lg text-gray-300">
              Whether you're a creator looking to grow your brand or a fan searching for sharp picks, FanBetz is your new home. Sign up, explore, and bet smarter — together.
            </p>
          </section>
        </div>
      </main>
    );
  }
  