// SiteNavBar.js
import "./index.css"
import "./navbar.css"
import './sidemenu.css'
import { Button } from '@mui/material'
import LocalGroceryStoreTwoToneIcon from '@mui/icons-material/LocalGroceryStoreTwoTone'
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone'
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone'
import { FormControlLabel, Switch } from '@mui/material'
import "./LogoNoScript.png"

// right-menu element
const rightMenuStyle = {
  zIndex: 10000,
  width: '250px',
  background: 'radial-gradient(circle at 3% -80%,#ADD8E6 0,#e3eedb 100%,violet 0)'
}

/**
 * 
 * @param {Boolean} showTutorial If the tutorial should be shown, this is true
 * @param {Boolean} setShowTutorial Assignment function for showTutorial
 * @param {Boolean} showLabels If the labels should be shown, this is true
 * @param {Boolean} setShowLabels Assignment function for showLabels
 * @returns 
 */
const SiteNavBar = ({ showTutorial, setShowTutorial, showLabels, setShowLabels, styleRotateGlobe, setStyleRotateGlobe, setSpinEnabled }) => {
  return (
    <div className="navbar">
      <Button size="small" color="primary" aria-label="link to home" style={{ padding: '1px' }} href="https://www.instagram.com/nextworldatlas" target="_blank">
        <div className="navbar-text">
          <HomeTwoToneIcon fontSize="small" />
          <div>Videos</div>
        </div>
      </Button>
      <Button size="small" color="primary" aria-label="link to shop" style={{ padding: '1px' }} href="https://www.etsy.com/shop/nextworldatlas" target="_blank">
        <div className="navbar-text">
          <LocalGroceryStoreTwoToneIcon fontSize="small" />
          <div>Maps</div>
        </div>
      </Button>
      <div className="add-node-vertical" >
        <Button size="small" color="primary" aria-label="controls menu" style={{ padding: '1px' }} >
          <div className="navbar-text">
            <SettingsTwoToneIcon fontSize="small" />
            <div>Controls</div>
          </div>
        </Button>
        <ul className="right-menu" style={rightMenuStyle}>
        <li>
            <FormControlLabel control={<Switch checked={styleRotateGlobe} onChange={() => {setSpinEnabled(!styleRotateGlobe); setStyleRotateGlobe(prev => !prev);}} />} label={"Rotating Globe"} />
          </li>
          <li>
            <FormControlLabel control={<Switch checked={showTutorial} onChange={() => setShowTutorial(prev => !prev)} />} label="Tutorial" />
          </li>
          <li>
            <FormControlLabel control={<Switch checked={showLabels} onChange={() => setShowLabels(prev => !prev)} />} label="Modern Country Labels" />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SiteNavBar