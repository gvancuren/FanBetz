export default function ContactPage() {
    return (
      <div className="min-h-screen px-6 py-16 text-white bg-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-yellow-400 mb-6">Contact FanBetz</h1>
          <p className="text-gray-300 mb-8 text-lg">
            We’re here to help. Whether you have a question, idea, or partnership opportunity — our team is ready to listen.
          </p>
          <form className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <textarea
                rows={5}
                placeholder="Your Message"
                className="w-full bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-500 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    );
  }
  