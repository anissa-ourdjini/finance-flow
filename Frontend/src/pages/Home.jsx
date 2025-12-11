import React, { useRef, useEffect, useState } from 'react'

export default function Home() {
  const videoRef = useRef(null)
  const [needUnmute, setNeedUnmute] = useState(false)

  useEffect(() => {
    // Tenter de lancer avec son immédiatement, sinon fallback muet
    const playVideo = async () => {
      if (!videoRef.current) return

      try {
        videoRef.current.muted = false
        await videoRef.current.play()
        console.log('Vidéo lancée avec son!')
      } catch (err) {
        console.log('Autoplay avec son refusé, on tente en muet')
        setNeedUnmute(true)
        videoRef.current.muted = true
        try {
          await videoRef.current.play()
        } catch (e) {
          console.log('Lecture échouée:', e)
        }
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
          muted={false}
          style={{ width: '100%', display: 'block' }}
        >
          <source src="/assets/grok-video-ca6df36a-0dd1-40c5-bf71-70aad132eafe.mp4" type="video/mp4" />
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
