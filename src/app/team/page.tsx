import Image from 'next/image';

export default function TeamPage() {
  return (
    <div className="min-h-screen px-6 py-16 text-white bg-black">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-yellow-400 mb-6">Meet the Team</h1>
        <p className="text-gray-300 mb-10 text-lg">
          Behind FanBetz is a team of world-class builders and betting minds dedicated to creating the most trusted, creator-first betting platform on the planet.
        </p>

        <div className="flex items-center gap-6 mb-10">
          <Image
            src="/assets/gunnar-headshot.jpg"
            alt="Gunnar Amsden"
            width={120}
            height={120}
            className="rounded-full border-2 border-yellow-400 object-cover"
          />
          <div>
            <h3 className="text-2xl font-semibold text-white">Gunnar Van Curen</h3>
            <p className="text-sm text-gray-400 mt-1">Founder & CEO</p>
            <p className="text-gray-300 mt-2 text-base max-w-lg">
              Navy SEAL veteran, business leader, and the visionary behind FanBetz. Gunnar leads product, brand, and partnerships with relentless energy and purpose.
            </p>
          </div>
        </div>

        {/* Add more team members here as needed */}
      </div>
    </div>
  );
}
