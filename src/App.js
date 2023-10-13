import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax
import useTimer from './hooks/useTimer'
import Tutorial from './Tutorial'
import SiteNavBar from './SiteNavBar'
import SiteTitleBar from './SiteTitleBar'
import mapImages from './2png-load.json'
import pointGeoJSON from './1Markers.json'
import mapSources from './source-geojson.json'
import mapLayersLine from './layers-line.json'
import mapLayersFill from './3layers-fill.json'
import { IconButton, Button } from '@mui/material'
import PauseCircleFilledTwoToneIcon from '@mui/icons-material/PauseCircleFilledTwoTone'
import PlayCircleFilledTwoToneIcon from '@mui/icons-material/PlayCircleFilledTwoTone'
import './tutorial.css'

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY

export default function App() {
  const timerInterval = 500
  const {time, isRunningRef, startTimer, pauseTimer, resetTimer, continuousTime} = useTimer(timerInterval)
  const prevTime = useRef(0)
  const [spinEnabled, setSpinEnabled] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [styleRotateGlobe, setStyleRotateGlobe] = useState(false)
  const styleRotateGlobeRef = useRef()
  styleRotateGlobeRef.current = styleRotateGlobe
  const [tutorialWindow, setTutorialWindow] = useState(0)
  const [defaultyear, setDefaultYear] = useState(1250)
  const [currentyear, setCurrentYear] = useState(1250)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // search QWE1
  // Load and add individual images to the map
  const loadImages = async () => {
    mapImages.forEach((v, i)=>{
      map.current.loadImage(v.imgurl, (error, image) => {
        if (error) {console.log(v.imgname); throw error};
        if(map.current.hasImage(v.imgname)){
          // necessary to remove this comment if loading is mangled.
          //map.current.removeImage(v.imgname)
        }
        else{
          map.current.addImage(v.imgname, image)
        }
      })
    })
  }

  // Pause the spinning globe, useful for user interaction.
  const pauseGlobe = () => {
    if(styleRotateGlobeRef){
      setSpinEnabled(false)
    }
  }

  useEffect(() => {
    if (map.current) return; // initialize map only once
    startTimer()
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleRotateGlobe?'mapbox://styles/mapbox/navigation-day-v1':'mapbox://styles/mapbox/streets-v12',
      projection: styleRotateGlobe?'globe':'naturalEarth',
      center: [20, 35],
      zoom: 2,
    })

    // When the map loads, add the empire boundaries.
    map.current.on('load', async () => {
      //HISTORICAL GSON FOR SHAPES//
      //QWE0
      // Empire boundary sources
      mapSources.forEach((v, i) => {
        map.current.addSource(v.name, {
          type: 'geojson',
          data: v.dataurl,
        })
      })

      // Empire boundary fills
      mapLayersFill.forEach((v, i)=> {
        map.current.addLayer(v)
      })
      // Empire boundary outlines
      mapLayersLine.forEach((v, i)=> {
        map.current.addLayer(v)
      })

      // Load multiple images to use as custom markers
      // search QWE1
      // Load and add individual images to the map
      function loadImages () {
        mapImages.forEach((v, i)=>{
          map.current.loadImage(v.imgurl, (error, image) => {
            if (error) {console.log(v.imgname); throw error};
            if(map.current.hasImage(v.imgname)){
              // necessary to remove this comment if loading is mangled.
              //map.current.removeImage(v.imgname)
            }
            else{
              map.current.addImage(v.imgname, image)
            }
          })
        })
      }

      // If any of the images are missing, attempt to reload them.
      map.current.on('styleimagemissing', ()=>{
        loadImages()
      })

      // Add a GeoJSON source with points
      // search QWE2
      map.current.addSource('points', pointGeoJSON)

      // Icon/label points
      map.current.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          'icon-image': [
            'get', 'png'
          ],
          'icon-size': [
              'step',
              ['zoom'],
              0.4, // Default icon size when zoom is less than 10
              3, 0.6 // Icon size when zoom is 10 or higher
          ],
          "icon-offset": [
            0, -100
          ],
          'text-field': ['get', 'title'],
          'text-font': [
              'Open Sans Semibold',
              'Arial Unicode MS Bold'
          ],
          'text-size': 12,
          'text-offset': [0, 0],
          'text-anchor': 'bottom'
        }
      });

      // Open link on marker click
      map.current.on('click', 'points', (e) => {
          const { link } = e.features[0].properties
          window.open(link)
      });

      //create pop-up with variable GeoJSON files
      const layers = ['world_1-fill', 'world_250-fill', 'world_500-fill', 'world_750-fill', 'world_1000-fill', 'world_1250-fill', 'world_1500-fill', 'world_1750-fill', 'world_2000-fill'] // add more layers as needed
      
      // Clicking within an empire boundary leads to the wikipedia/external link.
      map.current.on('click', layers, (e) => {
        var popupContent = document.createElement('div')
        popupContent.style.color = 'white'
        popupContent.style.backgroundColor = 'steelblue'
        popupContent.style.boxShadow = '1px 1px 1px rgba(0, 0, 0, 0.1)'
        popupContent.style.padding = '10px'
        popupContent.innerHTML = `<strong>${e.features[0].properties.NAME}</strong>`

        var popup = new mapboxgl.Popup({ className: 'my-popup' })
            .setLngLat(e.lngLat)
            .setDOMContent(popupContent)
            .addTo(map.current)

        // Close the popup after 3 seconds
        window.setTimeout(() => {
            popup.remove()
        }, 3000)
      })

      // Pause spinning on interaction
      map.current.on('mousedown', pauseGlobe)
      map.current.on('dragend', pauseGlobe)
      map.current.on('pitchend', pauseGlobe)
      map.current.on('rotateend', pauseGlobe)
      map.current.on('zoomstart', pauseGlobe)
      map.current.on('zoomstart', pauseGlobe)

      // When the cursor enters a feature in one of the layers, change the cursor style to 'pointer'.
      map.current.on('mouseenter', layers, () => {
        map.current.getCanvas().style.cursor = 'pointer'
      });
      // When the cursor leaves a feature in one of the layers, change the cursor style to ''.
      map.current.on('mouseleave', layers, () => {
        map.current.getCanvas().style.cursor = ''
      })

      setIsStyleLoaded(true)
    })

    // Load the point images/icons
    loadImages()

    // Modify the user interface for iPhones
    if (/iPhone/i.test(navigator.userAgent)) {
      // This is an iPhone, so add a class to the slider element
      let slider = document.getElementById('slider')
      slider.classList.add('iphone-slider')
    }

    // If the user is on a cellphone/tablet, start the display with a rotating globe.
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)){
      setStyleRotateGlobe(true)
      setSpinEnabled(true)
      setIsMobile(true)
    }
  }, [map.current, currentyear])

  const startyear = 0
  const endyear = 2023
  const stepYear = 250
  
  // This is a relic of the original source. The two variables should be combined.
  useEffect(()=>{
    setCurrentYear(defaultyear)
  }, [defaultyear])

  // Toggle effect between rotating globe and flat map:
  useEffect(()=>{
    //map.current.style = styleRotateGlobe?'mapbox://styles/mapbox/streets-v12':'mapbox://styles/mapbox/navigation-day-v1'
    map.current.setProjection(styleRotateGlobe?'globe':'naturalEarth')
    startTimer()
  }, [styleRotateGlobe])

  //set up the filter for empire eras//
  function filterBy(numYear) {
    // If the selected year falls within an empire's era, show that empire's boundaries.
    const year = parseInt(numYear)
    let filters = [];
    // This should be rewritten for CE/BCE (AD/BC), and displays should format based on negative numbers.
    if (year < 0) {
        filters = ["all",
            [">=", ['get', 'yearstart'], year],
            ["<=", ['get', 'yearend'], year]
        ];
    } else {
        filters = ["all",
            [">=", ['get', 'yearend'], year],
            ["<=", ['get', 'yearstart'], year]
        ];
    }

    // Only show points/icons/boundaries/fills that fit the current era.
    map.current.setFilter('points', filters)
    mapLayersFill.forEach((v, i)=>{
      map.current.setFilter(v.id, filters)
    })
    mapLayersLine.forEach((v, i)=>{
      map.current.setFilter(v.id, filters)
    })
  }

  // When the map input/controls are changed, redefine the style/display/art properties.
  useEffect(()=>{
    if(map.current && isStyleLoaded){
      filterBy(defaultyear)
      map.current.style.stylesheet.layers.forEach(l => { 
        if (l.type == "symbol") {
          if(l.id === "country-label")
            map.current.setLayoutProperty(l.id, "visibility", showLabels?"visible":"none") 
          else
            map.current.setLayoutProperty(l.id, "visibility", "none") 
        }
      })
    }

    // Change color of slider background based upon the position of the slider
    const sliderElement = document.getElementById("slider")
    const value = (sliderElement.value-sliderElement.min)/(sliderElement.max-sliderElement.min)*100
    if(defaultyear <= 1000){
      sliderElement.style.background = 'linear-gradient(to right, #82CFD0 0%, #82CFD0 ' + value + '%, #fff ' + value + '%, white 100%)'
    } else {
      sliderElement.style.background = 'linear-gradient(to right, #82CFD0 '+ value *0.4+'%, #00008B ' + value + '%, #fff ' + value + '%, white 100%)'
    }
  }, [map.current, defaultyear, showLabels, time])

  function spinMap() {
    // Count of seconds for an entire spin of the globe
    const spinDuration = isMobile?20:20
    // Above zoom level 5, do not rotate.
    const maxSpinZoom = 20
    // Rotate at intermediate speeds between zoom levels 2 and 5.
    const slowSpinZoom = 2
    // Speed of rotation
    let distancePerSecond = 0

    const zoom = map.current.getZoom()
    if (zoom < maxSpinZoom) {
      distancePerSecond = 180 / spinDuration
      if (zoom > slowSpinZoom) {
        // Slow spinning at higher zooms
        const zoomDif =
        (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
        distancePerSecond *= zoomDif
      }
      const center = map.current.getCenter()
      center.lng -= distancePerSecond
      // Animate the map over the timerInterval period.
      map.current.easeTo({ center, duration: timerInterval, easing: (n) => n })
    }
  }

  // When the time increments, check if the map should be spinning
  // If the map should be spinning, animate the globe and increment
  // the timeline every *incrementDuration* seconds.
  useEffect(()=>{
    const incrementDuration = 20
    if(styleRotateGlobe && spinEnabled ){
      spinMap()
      if(continuousTime - prevTime.current >= incrementDuration * 1000){
        prevTime.current = continuousTime
        setDefaultYear((defaultyear + stepYear)%(2000 + stepYear))
      }
    }
  }, [continuousTime])

  // When the user changes the view style, center the map.
  useEffect(()=>{
    const center = map.current.getCenter()
    center.lat = 20
    center.lng = 30
    map.current.easeTo({ center, duration: 0.1, easing: (n) => n })
  }, [styleRotateGlobe])

  return (
    <>
    <SiteTitleBar />
    <SiteNavBar showTutorial={showTutorial} setShowTutorial={setShowTutorial} showLabels={showLabels} setShowLabels={setShowLabels} styleRotateGlobe={styleRotateGlobe} setStyleRotateGlobe={setStyleRotateGlobe} setSpinEnabled={setSpinEnabled}/>
    <div style={{display: 'inline'}}>
      <div ref={mapContainer} className="map-container" />

      <div className="map-overlay top">
        <div className="map-overlay-inner">
          <h2>Historical Timeline</h2>
            <div id="sliderholder">
              <input id="slider" className="slider" value={defaultyear} type="range" step={stepYear} list="tickmarks" max={endyear} min={startyear} onChange={e=>setDefaultYear(e.target.value)}></input>
            </div>
            <div id="year">{defaultyear} CE</div>
          <datalist id="tickmarks">
          </datalist>
          <div className="timeline-labels">
            <span>0CE</span>
            <span>2000CE</span>
          </div>
          <div>{spinEnabled? 'Next era in: ' + (20-(continuousTime/1000)%20).toFixed(0) + ' seconds':''}</div>
        </div>
      </div>
      {
        showTutorial &&
        tutorialWindow === 0 &&
        <>
        <Tutorial setShowTutorial={setShowTutorial} setTutorialID={setTutorialWindow}>
          <div className="video-box">
              <img src="./1 Slide.gif" width="300" height="300" />
          </div>
          <div className="instruction-box">
          <img src="./Tutorial Text-A.png" width="275" height="150" />
          </div>
        </Tutorial>
        </>
      }
      {
        showTutorial &&
        tutorialWindow === 1 &&
        <>
        <Tutorial setShowTutorial={setShowTutorial} setTutorialID={setTutorialWindow}>
        <div className="video-box">
              <img src="./B Rotation.gif" width="300" height="300" />
          </div>
          <div className="instruction-box">
          <img src="./Tutorial Text-B Mobile.png" width="280" height="130" />
          </div>
        </Tutorial>
        </>
      }
      {
        showTutorial &&
        tutorialWindow === 2 &&
        <>
        <Tutorial setShowTutorial={setShowTutorial} setTutorialID={setTutorialWindow}>
        <div className="video-box">
              <img src="./3 Explore hi.gif" width="300" height="300" />
          </div>
          <div className="instruction-box">
          <img src="./Tutorial Text-3.png" width="250" height="125" />
          </div>
        </Tutorial>
        </>
      }
    </div>
    {
      /*Only display pause button if the view style is a rotating globe*/
      styleRotateGlobe &&
        <>
          {
            /*If on mobile, display a circular pause/play button*/ 
            isMobile &&
            <div style={{position: 'fixed', bottom: 50, right: '10vw'}}>
              <IconButton size="large" className='button-pause' style={{border: '3px solid rgba(0,0,0, 0.7)', background: 'rgba(0,0,0, 0.5)'}} onClick={(e)=>{e.stopPropagation();spinEnabled?pauseTimer():startTimer();setSpinEnabled(prev=>!prev)}}>
                {
                  spinEnabled?
                  <PauseCircleFilledTwoToneIcon fontSize="large" 
                  style={{ color: 'white' }}
                  />:
                  <PlayCircleFilledTwoToneIcon fontSize='large' 
                  style={{ color: 'white' }}
                  />
                }
              </IconButton>
            </div>
          }
          {
            /*If on desktop, display a rectangular pause button*/
            !isMobile &&
            <div style={{position: 'fixed', bottom: 50, right: '39vw', width: '20vw'}}>
              <Button variant='contained' color='primary' fullWidth onClick={(e)=>{e.stopPropagation();spinEnabled?pauseTimer():startTimer();setSpinEnabled(prev=>!prev);}}>{spinEnabled?'Pause':'Rotate'}</Button>
            </div>
          }
        </>
    }
    </>
  )
}