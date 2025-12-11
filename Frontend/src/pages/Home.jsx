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
      minHeight: '100vh',
      padding: '1rem',
      animation: 'fadeIn 0.6s ease-in'
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(216, 183, 232, 0.2); }
          50% { box-shadow: 0 12px 48px rgba(216, 183, 232, 0.35); }
        }
        
        @keyframes shimmer {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>

      <div style={{ 
        maxWidth: '900px', 
        width: '100%',
        background: 'white',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(216, 183, 232, 0.25)',
        position: 'relative',
        border: '3px solid #E8D9F5',
        animation: 'float 4s ease-in-out infinite, pulse 2s ease-in-out infinite'
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
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #D8B7E8, #C499E0)',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(216, 183, 232, 0.3)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '16px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontFamily: "'Comic Sans MS', cursive",
              animation: 'shimmer 2s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)'
              e.target.style.boxShadow = '0 12px 32px rgba(216, 183, 232, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = '0 8px 24px rgba(216, 183, 232, 0.3)'
            }}
          >
            🔊 Activer le son
          </button>
        )}
      </div>
    </div>
  )
}
