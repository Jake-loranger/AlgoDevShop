import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';

const App: React.FC = () => {
  const [wallets, setWallets] = useState<{ address: string; balance: number }[]>([]);
  const [assets, setAssets] = useState<{ id: number; name: string; unit: string; supply: number;  }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [dispenseAmount, setDispenseAmount] = useState<number>(10); // Default dispense amount
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [newAssetName, setNewAssetName] = useState<string>('');
  const [newAssetUnit, setNewAssetUnit] = useState<string>('');
  const [newAssetSupply, setNewAssetSupply] = useState<number>(0);

  const createWallet = async () => {
    try {
      await axios.get('http://127.0.0.1:5000/create-wallet');
      fetchWallets(); // Fetch updated wallets after creating a new wallet
      setError(null);
    } catch (err) {
      setError('Failed to create wallet');
      console.error(err);
    }
  };

  const createAsset = async () => {
    try {
      await axios.post(`http://127.0.0.1:5000/create-asset`, { name: newAssetName, unit: newAssetUnit, supply: newAssetSupply });
      fetchAssets(); // Fetch updated assets after creating a new asset
      setError(null);
      setShowAssetModal(false); // Close modal after creating asset
      setNewAssetName(''); // Reset asset name
      setNewAssetSupply(0); // Reset asset supply
    } catch (err) {
      setError('Failed to create asset');
      console.error(err);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/wallets');
      setWallets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch wallets');
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/assets');
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch assets');
      console.error(err);
    }
  };

  const handleDispenseClick = (address: string) => {
    setSelectedWallet(address);
    setShowDispenseModal(true);
  };

  const dispenseAlgorand = async () => {
    if (!selectedWallet) return;

    try {
      await axios.post(`http://127.0.0.1:5000/dispense/${selectedWallet}`, { amount: dispenseAmount });
      fetchWallets();
      setError(null);
      setShowDispenseModal(false);
    } catch (err) {
      setError('Failed to dispense Algorand');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallets(); // Fetch wallets on initial render
    fetchAssets(); // Fetch assets on initial render
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Algorand Wallet and Asset Manager</h1>
      <div className="text-center mb-4">
        <Button variant="primary m-3" onClick={createWallet}>
          Create Wallet
        </Button>
        <Button variant="primary m-3" onClick={() => setShowAssetModal(true)}>
          Create Asset
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <h2 className="mb-4">Wallets</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Address</th>
            <th>Balance (Algo)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((wallet) => (
            <tr key={wallet.address}>
              <td>{wallet.address}</td>
              <td>{wallet.balance}</td>
              <td>
                <Button variant="success" onClick={() => handleDispenseClick(wallet.address)}>
                  Dispense Algo
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="mb-4">Assets</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th> 
            <th>Name</th>
            <th>Unit Name</th>
            <th>Supply</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <tr key={index}>
              <td>{asset.id}</td>
              <td>{asset.name}</td>
              <td>{asset.unit}</td>
              <td>{asset.supply}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Dispense Modal */}
      <Modal show={showDispenseModal} onHide={() => setShowDispenseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Dispense Algorand</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="dispenseAmount">
              <Form.Label>Amount (in Algo)</Form.Label>
              <Form.Control
                type="number"
                value={dispenseAmount}
                onChange={(e) => setDispenseAmount(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDispenseModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={dispenseAlgorand}>
            Dispense
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Asset Modal */}
      <Modal show={showAssetModal} onHide={() => setShowAssetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Asset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="assetName">
              <Form.Label>Asset Name</Form.Label>
              <Form.Control
                type="text"
                value={newAssetName}
                onChange={(e) => setNewAssetName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="assetUnitName">
              <Form.Label>Asset Unit Name</Form.Label>
              <Form.Control
                type="text"
                value={newAssetUnit}
                onChange={(e) => setNewAssetUnit(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="assetSupply">
              <Form.Label>Asset Supply</Form.Label>
              <Form.Control
                type="number"
                value={newAssetSupply}
                onChange={(e) => setNewAssetSupply(Number(e.target.value))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssetModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={createAsset}>
            Create Asset
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
