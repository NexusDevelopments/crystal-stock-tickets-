function Emojis() {
  return (
    <>
      <div className="animated-bg"></div>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '900px' }}>
        <div className="fade-in" style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 800 }}>Emojis</h1>
          <p style={{ opacity: 0.75 }}>
            Coming Soon
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.6rem' }}>Emoji Packs</h2>
          <p style={{ opacity: 0.7 }}>
            This feature is under construction. Packs and one-click downloads will be available soon.
          </p>
        </div>
      </div>
    </>
  );
}

export default Emojis;
