// SiteTitleBar.js
import "./titlebar.css"
import logo from "./LogoNoScript.png"

const SiteTitleBar = () => {
  return (
    <div className="titlebar">
      <div className="titlebar-content">
        <img src={logo} style={{width: '18px'}} alt="Next World Atlas"/>
        <div className="titlebar-text" style={{position: 'relative', bottom: 0}}>NEXT WORLD ATLAS</div>
      </div>
    </div>
  )
}

export default SiteTitleBar