import React from 'react'
import { sizes } from '../vars'
import PropTypes from 'prop-types'
import styles from './styles'
import { getInitials } from './utils'

const Avatar = ({ name, src, size, className }) => (
  <div {...styles.body({ size })} className={className}>
    {src && <img {...styles.img} src={src} />}
    {name && <div {...styles.initials({ name })}>{getInitials(name)}</div>}
  </div>
)

Avatar.defaultProps = {
  size: sizes.medium
}

Avatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  size: PropTypes.oneOf(Object.keys(sizes)),
  className: PropTypes.string
}

Avatar.sizes = sizes

export default Avatar
