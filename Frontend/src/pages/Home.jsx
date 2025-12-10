import React from 'react'

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
      <div style={{ marginTop: '0', maxWidth: '700px', width: '100%' }}>
        <video 
          controls 
          style={{ width: '100%', borderRadius: '8px' }}
        >
          <source src="/demo-video.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
      <h2 style={{ marginTop: '1.5rem' }}>Bienvenue — FinanceFlow</h2>
      <p>Utilisez le menu pour vous connecter ou vous inscrire.</p>
    </div>
  )
}
