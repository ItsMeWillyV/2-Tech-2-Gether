import { Helmet } from 'react-helmet-async'
import { FaTrophy, FaMedal, FaAward, FaExternalLinkAlt, FaUsers } from 'react-icons/fa'
import Hero from '../components/Hero'

function Sponsors() {
  const sponsorTiers = [
    {
      name: 'Bronze',
      price: '$100',
      icon: FaAward,
      color: 'from-amber-600 to-amber-800',
      borderColor: 'border-amber-500',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      benefits: [
        'Your logo will appear on our website',
        'Featured in our meeting slideshow presentations',
        'Logo on any printed materials we distribute',
        'Special shoutout at every meeting',
        'Recognition as a community supporter'
      ]
    },
    {
      name: 'Silver',
      price: '$250',
      icon: FaMedal,
      color: 'from-gray-400 to-gray-600',
      borderColor: 'border-gray-400',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
      benefits: [
        'Everything included in Bronze tier',
        'Opportunities to speak with students at meetings',
        'Job postings featured on our website',
        'Priority placement in sponsor materials',
        'Direct access to our talented student network',
        'Quarterly updates on club activities and achievements'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-light-gray">
      <Helmet>
        <title>Sponsors - Tech2Gether</title>
        <meta name="description" content="Support Tech2Gether and connect with talented tech students at Ozarks Tech" />
        <meta name="keywords" content="Tech2Gether, Sponsors, Ozarks Tech, Technology, Programming, Partnership" />
        <meta property="og:title" content="Sponsors - Tech2Gether" />
        <meta property="og:description" content="Partner with Tech2Gether to support tech education and connect with future talent" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <Hero 
        title="Our Sponsors"
        subtitle="Join us in empowering the next generation of innovators"
      />

      <div className="container mx-auto px-4 py-20">

        {/* Sponsor Tiers Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Sponsor&#8203;ship Tiers
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Choose the sponsorship level that's right for your organization and help us grow the tech community at Ozarks Tech
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
            {sponsorTiers.map((tier, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 relative group w-full sm:w-[450px] shadow-xl" 
                style={{ position: 'relative', minHeight: '500px' }}
              >
                {/* Glistening effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none z-10"></div>
                <div className={`bg-gradient-to-r ${tier.color} text-white p-8 text-center`}>
                  <div className="flex justify-center mb-4">
                    <tier.icon className="text-5xl" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">{tier.name} Tier</h3>
                  <div className="text-4xl font-bold">{tier.price}</div>
                </div>

                <div className="p-8">
                  <div className="flex gap-2 justify-center">
                    <h4 className="text-xl font-bold mb-6 text-binary-blue text-center">
                      What You Get
                    </h4>
                  </div>
                  
                  <ul className="space-y-4 mb-1">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-analog-aquamarine rounded-full flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Possibilities Section */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 py-16 px-8 rounded-3xl shadow-inner mb-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <FaTrophy className="text-6xl text-yaml-yellow" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-binary-blue">
              Event Sponsor&#8203;ship
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-xl text-gray-700 leading-relaxed mb-3 mt-3">
                We're looking for sponsors for our upcoming events! On November 14th we're hosting our first annual Capture the Flag at Ozarks Tech! All event sponsorships will contribute to running the event and prizes for winning competitors. To become an event sponsor, submit an inquiry below.
              </p>
            </div>
          </div>
        </div>


        {/* Contact Section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-event text-white rounded-3xl shadow-xl p-12 max-w-3xl mx-auto transition-all duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Partner With Us?
            </h2>
            <p className="text-xl mb-8 opacity-95 leading-relaxed">
              Let's discuss how your organization can support Tech2Gether and connect with talented students at Ozarks Tech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://forms.office.com/pages/responsepage.aspx?id=drq33vxyB0yDPxYotekhaNhghODwk3NEh9FML_kcXP9UOUJXUFY5OTFVVUE4ODJFWDdCMTFFMElGNC4u&route=shorturl" target='_blank' className="btn-event px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3">
                <FaUsers />
                Submit Inquiry
                <FaExternalLinkAlt className="text-sm" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sponsors