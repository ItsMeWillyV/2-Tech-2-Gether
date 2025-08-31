import React from 'react'

/**
 * Reusable Card component for displaying various types of content
 * 
 * @param {Object} props - Component properties
 * @param {string} props.id - Optional ID for the card element
 * @param {React.Component} props.icon - Icon component to display
 * @param {string} props.iconColor - Tailwind color class for the icon
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Optional subtitle/badge text
 * @param {string} props.subtitleBg - Background color for subtitle badge
 * @param {string} props.subtitleText - Text color for subtitle badge
 * @param {string} props.description - Card description text
 * @param {Array} props.details - Array of detail objects with icon, text, and color
 * @param {Object} props.button - Button configuration object
 * @param {string} props.button.text - Button text
 * @param {string} props.button.href - Button URL (for links)
 * @param {Function} props.button.onClick - Button click handler (for buttons)
 * @param {React.Component} props.button.icon - Button icon
 * @param {string} props.button.className - Button CSS classes
 * @param {boolean} props.button.external - Whether link opens in new tab
 * @param {string} props.borderColor - Border top color class
 * @param {string} props.className - Additional CSS classes for the card
 * @param {string} props.size - Card size variant ('sm', 'md', 'lg')
 * @param {boolean} props.centered - Whether content should be centered
 * @param {string} props.additionalInfo - Additional info text to display
 * @param {string} props.additionalInfoBg - Background color for additional info
 */

function Card({
  id,
  icon: Icon,
  iconColor = 'text-binary-blue',
  title,
  subtitle,
  subtitleBg = 'bg-binary-blue',
  subtitleText = 'text-white',
  description,
  details = [],
  button,
  borderColor = 'border-t-binary-blue',
  className = '',
  size = 'lg',
  centered = true,
  additionalInfo,
  additionalInfoBg = 'bg-gray-100'
}) {
  // Size variants
  const sizeClasses = {
    sm: 'p-6',
    md: 'p-7',
    lg: 'p-8'
  }

  // Icon size variants
  const iconSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl'
  }

  const padding = sizeClasses[size] || sizeClasses.lg
  const iconSize = iconSizes[size] || iconSizes.lg
  const textAlign = centered ? 'text-center' : 'text-left'
  const itemsAlign = centered ? 'items-center justify-center' : 'items-start justify-start'

  const renderButton = () => {
    if (!button) return null

    const buttonContent = (
      <>
        {button.icon && <button.icon className="text-lg" />}
        {button.text}
        {button.external && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </>
    )

    const buttonClasses = `w-full px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 font-medium inline-flex items-center justify-center gap-2 ${button.className || 'bg-binary-blue text-white hover:bg-analog-aquamarine'}`

    if (button.href) {
      return (
        <a
          href={button.href}
          target={button.external ? '_blank' : undefined}
          rel={button.external ? 'noopener noreferrer' : undefined}
          className={buttonClasses}
        >
          {buttonContent}
        </a>
      )
    }

    return (
      <button
        onClick={button.onClick}
        className={buttonClasses}
      >
        {buttonContent}
      </button>
    )
  }

  return (
    <div
      id={id}
      className={`bg-white ${padding} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-t-4 ${borderColor} flex flex-col h-full ${className}`}
    >
      {/* Icon */}
      {Icon && (
        <div className={`flex ${centered ? 'justify-center' : 'justify-start'} mb-6`}>
          <Icon className={`${iconSize} ${iconColor}`} />
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className={`text-2xl font-bold mb-4 ${textAlign} text-binary-blue`}>
          {title}
        </h3>
      )}

      {/* Subtitle/Badge */}
      {subtitle && (
        <div className={`${textAlign} mb-4`}>
          <div className={`${subtitleBg} ${subtitleText} px-3 py-1 rounded-full text-sm font-semibold inline-block mb-2`}>
            {subtitle}
          </div>
        </div>
      )}

      {/* Details */}
      {details.length > 0 && (
        <div className="space-y-2 mb-6 text-sm text-gray-600">
          {details.map((detail, index) => (
            <div key={index} className={`flex ${itemsAlign} gap-2`}>
              {detail.icon && <detail.icon className={detail.color || iconColor} />}
              <span>{detail.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className={`text-gray-600 ${textAlign} leading-relaxed mb-6 flex-grow`}>
          {description}
        </p>
      )}

      {/* Additional Info */}
      {additionalInfo && (
        <div className={`${additionalInfoBg} p-3 rounded-lg mb-4`}>
          <p className="text-sm text-gray-700">
            {additionalInfo}
          </p>
        </div>
      )}

      {/* Button */}
      {button && (
        <div className={`${textAlign} mt-auto`}>
          {renderButton()}
        </div>
      )}
    </div>
  )
}

export default Card
