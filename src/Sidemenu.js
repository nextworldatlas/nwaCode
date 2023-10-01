import { FormGroup, FormControlLabel, Switch } from '@mui/material'
import './sidemenu.css'

const Sidemenu = ({showTutorial, setShowTutorial, showLabels, setShowLabels}) => {
  return (
    <>
    <div style={{display: 'inline', height: '100%', width: '140px', zIndex: '1000', background: 'rgba(255, 255, 255, 1)'}}>
      <div style={{display: 'flex', justifyContent: 'right', flexDirection: 'column'}}>
        <FormGroup style={{gap: '30px'}}>
          <FormControlLabel control={<Switch checked={showTutorial} onChange={()=>setShowTutorial(prev=>!prev)}/>} label="Tutorial" />
          <FormControlLabel control={<Switch checked={showLabels}   onChange={()=>setShowLabels(prev=>!prev)} />} label="Modern Country Labels" />
        </FormGroup>
      </div>
    </div>
    </>
  )
}

export default Sidemenu