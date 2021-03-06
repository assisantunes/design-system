import core from '@pluralsight/ps-design-system-core'
import CodeMirror from 'react-codemirror'
import Theme from '@pluralsight/ps-design-system-theme/react'

import CodeMirrorCss from '../../../vendor/codemirror-css'
import CodeMirrorTheme from '../../../vendor/codemirror-theme-monokai-sublime-css'

let modeLoaded = false
if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
  require('codemirror/mode/javascript/javascript')
  modeLoaded = true
}

import debounce from 'debounce'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import SrcSwitcher from './src-switcher'
import { transform } from 'babel-standalone'

const compileSrc = src =>
  transform(src, {
    presets: [
      'es2015', // TODO: replace with preset-env when supported
      'react',
      'stage-2'
    ]
  }).code

const formatSrc = code => code.trim()

const OutputDecorationGlobalStyles = _ => (
  <style global jsx>{`
    .output {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: ${core.layout.spacingLarge};
      background: ${core.colors.gray06};
      overflow: hidden;
    }
    .outputLight {
      background: ${core.colors.bone};
    }
    .outputChild {
      margin: ${core.layout.spacingLarge} 0 0 0;
      color: ${core.colors.white};
    }
    .outputChild:first-child {
      margin-top: 0;
    }
    @media screen and (min-width: 769px) {
      .outputHorizontal {
        flex-direction: row;
      }
      .outputVertical {
        align-items: flex-start;
      }
      .outputChild + .outputChild {
        margin: 0 0 0 98px;
      }
      .outputVertical .outputChild {
        width: 100%;
      }
      .outputVertical .outputChild + .outputChild {
        margin: 45px 0 0 0;
      }
    }
  `}</style>
)

const defaultDecorateCodes = (props, codes) => {
  let decorated = `<div className="${getOutputClassName(
    props
  )}" style={${JSON.stringify(props.outputStyle)}}>`

  codes.forEach(code => {
    decorated += `<div className="outputChild" style={${JSON.stringify(
      props.outputChildStyle
    )}}>${code}</div>`
  })

  decorated += '</div>'

  return decorated
}

const makeGlobalsAvailable = includes => {
  window.React = require('react')
  Object.keys(includes).forEach(name => {
    window[name] = includes[name]
  })
}

const evalSrc = compiled => eval(compiled)

const renderOutput = (evaled, el) => ReactDOM.render(evaled, el)

const unmountOutput = el => ReactDOM.unmountComponentAtNode(el)

const getOutputClassName = props =>
  `output ${props.themeName === Theme.names.light ? 'outputLight' : ''} ${
    props.orient === 'vertical' ? 'outputVertical' : 'outputHorizontal'
  }`

class ReactExample extends React.Component {
  constructor(props) {
    super(props)
    this.state = { codes: props.codes, error: null }
    this.handleCodeChange = this.handleCodeChange.bind(this)
  }
  componentDidMount() {
    this.renderOutput()
  }
  componentDidUpdate(prevProps) {
    if (this.props.code !== prevProps.code) this.renderOutput()
  }
  componentWillUnmount() {
    unmountOutput(this.outputEl)
  }
  handleCodeChange(code, i) {
    const codes = [...this.state.codes]
    codes[i] = code
    this.setState(_ => ({ codes }), debounce(this.renderOutput, 200))
  }
  renderError() {}
  renderOutput() {
    if (typeof window === 'undefined') return

    unmountOutput(this.outputEl)
    this.setState(
      _ => ({ error: null }),
      _ => {
        try {
          const src = (this.props.decorateCodes || defaultDecorateCodes)(
            this.props,
            this.state.codes
          )
          const compiled = compileSrc(src)
          makeGlobalsAvailable(this.props.includes)
          const evaled = evalSrc(compiled)
          renderOutput(evaled, this.outputEl)
        } catch (err) {
          console.log('err', err)
          unmountOutput(this.outputEl)
          this.setState(_ => ({ error: err.toString() }))
        }
      }
    )
  }
  renderSrc() {
    const options = {
      theme: 'monokai-sublime'
    }
    if (modeLoaded) options.mode = 'javascript'

    return (
      <div className="editor">
        {this.state.codes.map((code, i) => (
          <CodeMirror
            key={i}
            value={formatSrc(code)}
            onChange={code => this.handleCodeChange(code, i)}
            options={options}
          />
        ))}
        <style jsx>{`
          .editor :global(.CodeMirror) {
            background: none;
          }
          .editor :global(.CodeMirror),
          .editor :global(.CodeMirror-scroll) {
            height: auto;
          }
        `}</style>
        <CodeMirrorCss />
        <CodeMirrorTheme />
      </div>
    )
  }
  renderError() {
    return this.state.error ? (
      <pre className="error">
        {this.state.error}
        <style jsx>{`
          .error {
            background: ${core.colors.red};
            color: ${core.colors.white};
            overflow: hidden;
            padding: ${core.layout.spacingLarge};
          }
        `}</style>
      </pre>
    ) : null
  }
  render() {
    return (
      <div>
        {this.renderError()}
        <div ref={el => (this.outputEl = el)} />
        <OutputDecorationGlobalStyles />
        <div className="src">{this.renderSrc()}</div>
        <style jsx>{`
          .src {
            padding: ${core.layout.spacingLarge};
            background: ${core.colors.gray04};
          }
        `}</style>
      </div>
    )
  }
}

ReactExample.propTypes = {
  codes: PropTypes.arrayOf(PropTypes.string),
  decorateCodes: PropTypes.func,
  includes: PropTypes.object,
  outputChildStyle: PropTypes.object,
  outputStyle: PropTypes.object,
  themeName: PropTypes.oneOf(Object.keys(Theme.names))
}
ReactExample.defaultProps = {
  orient: 'horizontal',
  themeName: Theme.defaultName
}

export default ReactExample
