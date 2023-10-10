// useTimer.js
import {useState, useRef} from 'react'

const useTimer = (timerInterval)=> {
  const [time, setTime] = useState(0)
  const [continuousTime, setContinuousTime] = useState(0)
  const requestRef = useRef(null)
  const isRunningRef = useRef(false)
  const previousTimeRef = useRef(performance.now())
  const continuousTimeRef = useRef(performance.now())

  const animate = (currentTime) => {
    let deltaTime = 0
    let deltaContinous = 0
    if(currentTime != null){
      deltaTime = currentTime - previousTimeRef.current
      deltaContinous = currentTime - continuousTimeRef.current
      if(isRunningRef.current)
      {
        if(deltaTime >= timerInterval){
          previousTimeRef.current = currentTime
          if(isRunningRef.current)
            setTime(prev=>prev+deltaTime)
        }
        continuousTimeRef.current = currentTime
      }
    }

    if(isRunningRef.current){
      setContinuousTime(prev=>prev+deltaContinous)
      requestRef.current = requestAnimationFrame(animate)
    }
  }

  const startTimer = () => {
    if(!isRunningRef.current){
      isRunningRef.current = true
      previousTimeRef.current = performance.now()
      continuousTimeRef.current = performance.now()
      animate()
    }
  }

  const pauseTimer = () => {
    if(isRunningRef.current){
      isRunningRef.current = false 
      cancelAnimationFrame(requestRef.current)
    }
  }

  const resetTimer = () => {
    setTime(0)
  }

  return {
    time,
    isRunningRef: isRunningRef,
    startTimer,
    pauseTimer,
    resetTimer, 
    continuousTime
  }
}

export default useTimer