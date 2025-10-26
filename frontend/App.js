import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import PatentUpload from './PatentUpload';
import MetaMaskConnect from './MetaMaskConnect';
import DIDLogin from './DIDLogin';
import { registerPatent, fetchPatents } from './PatentRegistryInterface';
import { ethers } from 'ethers';

function PatentCube({ onClick, position, label }) {
  return (
    <mesh position={position} onClick={onClick} castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={'#4e8cff'} />
      <Html center>
        <div style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{label}</div>
      </Html>
    </mesh>
  );
}

export default function App() {
  const [showUpload, setShowUpload] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showView, setShowView] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [wallet, setWallet] = useState('');
  const [signer, setSigner] = useState(null);
  const [did, setDID] = useState('');
  const [patents, setPatents] = useState([]);
  const [loadingPatents, setLoadingPatents] = useState(false);

  useEffect(() => {
    // Auto-fetch patents when showView is true
    if (showView) {
      setLoadingPatents(true);
      const fetchAll = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const p = await fetchPatents(provider);
          setPatents(p);
        } catch (e) {
          setPatents([]);
        }
        setLoadingPatents(false);
      };
      fetchAll();
    }
  }, [showView]);

  // Handle MetaMask connection
  const handleWallet = async (account) => {
    setWallet(account);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setSigner(provider.getSigner());
  };

  // Handle DID login
  const handleDID = (didValue) => {
    setDID(didValue);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#181c27', color: 'white' }}>
      <h2 style={{ textAlign: 'center', margin: 0, padding: 20 }}>3D Blockchain Patent Registry</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
        <MetaMaskConnect onWallet={handleWallet} />
        <DIDLogin onDID={handleDID} />
      </div>
      <div style={{ width: '100vw', height: '60vh' }}>
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
          <PatentCube position={[-4, 0, 0]} label="Upload Patent" onClick={() => setShowUpload(true)} />
          <PatentCube position={[0, 0, 0]} label="Register On Blockchain" onClick={() => setShowRegister(true)} />
          <PatentCube position={[4, 0, 0]} label="View Patents" onClick={() => setShowView(true)} />
          <OrbitControls />
        </Canvas>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
        {showUpload && (
          <div style={{ margin: 10 }}>
            <PatentUpload onIpfsHash={(hash, key) => {
              setIpfsHash(hash);
              setEncryptionKey(key);
              setShowUpload(false);
              setShowRegister(true);
            }} />
          </div>
        )}
        {showRegister && (
          <div style={{ margin: 10, background: '#23263a', padding: 20, borderRadius: 8 }}>
            <h3>Register Patent On Blockchain</h3>
            <form onSubmit={async e => {
              e.preventDefault();
              const title = e.target.elements.title.value;
              const inventor = e.target.elements.inventor.value;
              if (!signer) {
                alert('Please connect MetaMask.');
                return;
              }
              try {
                await registerPatent(title, inventor, ipfsHash, signer);
                alert('Patent registered on blockchain!');
                setShowRegister(false);
              } catch (err) {
                alert('Error registering patent: ' + err.message);
              }
            }}>
              <div>IPFS Hash: <code>{ipfsHash}</code></div>
              <div>Encryption Key: <code>{encryptionKey}</code></div>
              <input name="title" type="text" placeholder="Patent Title" required style={{ margin: 8 }} />
              <input name="inventor" type="text" placeholder="Inventor Name" required style={{ margin: 8 }} />
              <button type="submit">Register</button>
            </form>
          </div>
        )}
        {showView && (
          <div style={{ margin: 10, background: '#23263a', padding: 20, borderRadius: 8, minWidth: 350 }}>
            <h3>View Registered Patents</h3>
            {loadingPatents ? (
              <div>Loading patents from blockchain...</div>
            ) : patents.length === 0 ? (
              <div>No patents found.</div>
            ) : (
              <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
                {patents.map(patent => (
                  <li key={patent.id} style={{ marginBottom: 10 }}>
                    <b>#{patent.id}</b>: {patent.title} <br />
                    <span>Inventor: {patent.inventor}</span><br />
                    <span>Owner: {patent.owner}</span><br />
                    <span>IPFS: <code>{patent.metadataHash}</code></span><br />
                    <span>Timestamp: {new Date(patent.timestamp * 1000).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowView(false)}>Close</button>
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: 10, right: 10, color: '#aaa', fontSize: 12 }}>
        Powered by Blockchain, IPFS, 3D UI
      </div>
    </div>
  );
}
