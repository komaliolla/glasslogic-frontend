import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.body}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.placeholder}>
            <span style={styles.placeholderTitle}>ADMIN</span>
            <span style={styles.placeholderSub}>Select an option from the sidebar</span>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  body: {
    display: 'flex',
    flex: 1,
    marginTop: 52,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  placeholderTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#9ca3af',
    letterSpacing: 1.5,
  },
  placeholderSub: {
    fontSize: 13,
    color: '#9ca3af',
  },
};

export default App;
