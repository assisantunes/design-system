// import of react version of design system component
import Button from '@pluralsight/ps-button/react'
import React from 'react'
import styleable from 'react-styleable'

import css from './app.module.css'

export default styleable(css)(props =>
  <div className={props.css.app}>
    <header>
      <h3>Pluralsight Design System</h3>
      <h2>React Example</h2>
    </header>
    <div className={props.css.box}>
      <Button size="large" onClick={_ => alert("It's working")}>
        Design System component
      </Button>
    </div>
    <div className={props.css.box}>
      <Button size="large" css={{ 'ps-button': props.css.buttonOverride }}>
        Override all styles with react-stylable
      </Button>
    </div>
  </div>
)