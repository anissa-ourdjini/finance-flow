import React, { useRef, useEffect, useState } from 'react'

export default function Home() {
  const videoRef = useRef(null)
  const [needUnmute, setNeedUnmute] = useState(false)

  useEffect(() => {
    // Tenter de lancer avec son immédiatement, sinon fallback muet
    const playVideo = async () => {
      if (!videoRef.current) return

      videoRef.current.muted = false
      try {
        await videoRef.current.play()
      } catch (err) {
        console.log('Autoplay avec son refusé, on tente en muet')
        setNeedUnmute(true)
        videoRef.current.muted = true
        videoRef.current.play().catch(e => console.log('Lecture échouée:', e))
      }
    }

    // Petit délai pour laisser le DOM se stabiliser
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
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        position: 'relative'
      }}>
        <video 
          ref={videoRef}
          controls
          autoPlay
          loop
          playsInline
          style={{ width: '100%', display: 'block' }}
        >
          <source src="/assets/grok-video-3e557791-bc9c-4a3a-8727-078196fc2ce5.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>

        {needUnmute && (
          <button
            onClick={() => {
              if (!videoRef.current) return
              videoRef.current.muted = false
              setNeedUnmute(false)
              videoRef.current.play().catch(err => console.log('Lecture après unmute échouée:', err))
            }}
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              padding: '12px 16px',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            Activer le son
          </button>
        )}
      </div>
    </div>
  )
}
