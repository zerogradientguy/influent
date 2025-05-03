import { Link } from "react-router-dom"
import { Star, TrendingUp, Zap } from "lucide-react"

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect Brands with Perfect Influencers</h1>
              <p className="text-xl mb-8">
                Influne helps brands find the right influencers for their marketing campaigns, making influencer
                marketing more effective and transparent.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100 text-center">
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="btn-secondary bg-transparent border-white text-white hover:bg-white/10 text-center"
                >
                  Learn More
                </a>
              </div>
            </div>
            {/* <div className="md:w-1/2">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Influne Platform"
                className="rounded-lg shadow-xl"
              />
            </div> */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Influne?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers unique features designed to make influencer marketing more effective, transparent, and
              tailored to your specific needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-emerald-500 mb-4">
                <TrendingUp size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Matching Algorithm</h3>
              <p className="text-gray-600">
                Our advanced algorithm matches brands with influencers based on audience demographics, engagement
                metrics, and past performance.
              </p>
            </div>

            <div className="card">
              <div className="text-emerald-500 mb-4">
                <Star size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent Ratings</h3>
              <p className="text-gray-600">
                Post-campaign feedback and ratings help brands make informed decisions and influencers improve their
                services.
              </p>
            </div>

            <div className="card">
              <div className="text-emerald-500 mb-4">
                <Zap size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">Streamlined Campaigns</h3>
              <p className="text-gray-600">
                Manage your entire campaign process from brief creation to performance analysis in one user-friendly
                platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our simple process makes it easy for brands to find the perfect influencers and for influencers to connect
              with relevant brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-emerald-600">For Brands</h3>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Create Your Profile</h4>
                    <p className="text-gray-600">
                      Register and set up your brand profile with details about your company, industry, and target
                      audience.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Create a Campaign</h4>
                    <p className="text-gray-600">
                      Define your campaign goals, budget, timeline, and specific requirements for the influencers you
                      want to work with.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Get Matched</h4>
                    <p className="text-gray-600">
                      Our algorithm will match you with the most suitable influencers based on your campaign
                      requirements and their performance metrics.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Manage & Evaluate</h4>
                    <p className="text-gray-600">
                      Manage your campaign, communicate with influencers, and evaluate performance with detailed
                      analytics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-emerald-600">For Influencers</h3>
              <div className="space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      1
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Create Your Profile</h4>
                    <p className="text-gray-600">
                      Register and build your influencer profile with details about your niche, audience demographics,
                      and past collaborations.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      2
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Set Your Terms</h4>
                    <p className="text-gray-600">
                      Define your availability, pricing, and the types of brands and campaigns you're interested in
                      working with.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      3
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Get Discovered</h4>
                    <p className="text-gray-600">
                      Our matching algorithm will connect you with brands looking for influencers with your specific
                      audience and expertise.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white font-bold">
                      4
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Collaborate & Grow</h4>
                    <p className="text-gray-600">
                      Collaborate with brands, deliver campaigns, and build your reputation through ratings and reviews.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what brands and influencers are saying about their experience with Influne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">Marketing Director at TechBrand</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Influne has transformed how we approach influencer marketing. The matching algorithm saved us countless
                hours of research and helped us find influencers who truly resonated with our target audience."
              </p>
              <div className="flex text-yellow-400">
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Alex Rivera</h4>
                  <p className="text-gray-600 text-sm">Lifestyle Influencer</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "As an influencer, finding brands that align with my values and audience has always been challenging.
                Influne makes it easy to connect with relevant brands and manage campaigns professionally."
              </p>
              <div className="flex text-yellow-400">
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
                <Star size={20} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Influencer Marketing?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join Influne today and experience a more effective, transparent, and tailored approach to influencer
            marketing.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/register" className="btn-primary bg-white text-emerald-600 hover:bg-gray-100">
              Register as a Brand
            </Link>
            <Link to="/register" className="btn-secondary bg-transparent border-white text-white hover:bg-white/10">
              Register as an Influencer
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
