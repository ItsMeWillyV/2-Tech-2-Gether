import tech2getherLogo from '../assets/tech2gether_logo.png'
import backgroundImage from '../assets/background.png'

function Hero({ title = "Tech2Gether", subtitle = "Where innovation meets collaboration at Ozarks Tech" }) {

  return (
    <div className="hero-section text-white py-32 bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <img
            src={tech2getherLogo}
            alt="Tech2Gether Logo"
            className="h-32 w-auto"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight">
          <span>{title}</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-95 italic mb-8 max-w-4xl mx-auto px-4">
          {subtitle}
        </p>

      </div>
    </div>
  )
}

export default Hero
