export default function CareersPage() {
    return (
      <div className="min-h-screen px-6 py-16 text-white bg-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">Join FanBetz</h1>
          <p className="text-gray-300 text-lg mb-10">
            We’re building the most elite platform in sports betting content — and we’re looking for top-tier talent to join us. At FanBetz, we hire people who want to move fast, build hard, and make history.
          </p>
  
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-white">🔧 Full Stack Engineer</h3>
              <p className="text-gray-400 mt-2">
                We’re hiring passionate engineers to scale our core platform. Experience with Next.js, Prisma, Stripe, and scalable infra preferred.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">📢 Growth & Marketing Intern</h3>
              <p className="text-gray-400 mt-2">
                Help us scale awareness and creator acquisition through social, influencer partnerships, and content marketing.
              </p>
            </div>
          </div>
  
          <p className="mt-10 text-sm text-gray-500">
            Sound like you? Email us at <a href="mailto:fanbetzbusiness@gmail.com" className="text-yellow-400 underline">careers@fanbetz.com</a>.
          </p>
        </div>
      </div>
    );
  }
  