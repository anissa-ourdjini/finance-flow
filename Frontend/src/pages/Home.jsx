import React, { useRef, useEffect } from 'react'

export default function Home() {
  const videoRef = useRef(null)

  useEffect(() => {
    // Attendre que l'utilisateur interagisse avec la page pour autoriser le son
    const enableSound = () => {
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.play().catch(err => {
          console.log('Erreur lors du démarrage de la vidéo')
        })
      }
      // Retirer les listeners après la première interaction
      document.removeEventListener('click', enableSound)
      document.removeEventListener('touchstart', enableSound)
    }

    // Ajouter les listeners pour la première interaction
    document.addEventListener('click', enableSound)
    document.addEventListener('touchstart', enableSound)

    return () => {
      document.removeEventListener('click', enableSound)
      document.removeEventListener('touchstart', enableSound)
    }
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
