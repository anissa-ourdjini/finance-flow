import React, { useRef, useEffect } from 'react'

export default function Home() {
  const videoRef = useRef(null)

  useEffect(() => {
    // Lancer la vidéo avec son dès que le composant charge
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          // Essayer de jouer avec son
          await videoRef.current.play()
        } catch (error) {
          console.log('Autoplay avec son refusé par le navigateur')
        }
      }
    }

    // Attendre un peu pour laisser le DOM se stabiliser
    setTimeout(playVideo, 100)
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem' 
    }}>
      <div style={{ 
        maxWidth: '900px', 
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        <video 
          ref={videoRef}
          controls
          autoPlay
          loop
          muted={false}
          playsInline
          style={{ width: '100%', display: 'block' }}
        >
          <source src="/assets/grok-video-63e76f90-1a00-4b3f-a9f0-8b876cf31417.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    </div>
  )
}
