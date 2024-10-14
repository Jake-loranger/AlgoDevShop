import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Alert, Modal, Form } from 'react-bootstrap';

const App: React.FC = () => {
  const [wallets, setWallets] = useState<{ address: string; balance: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dispenseAmount, setDispenseAmount] = useState<number>(10); // Default dispense amount
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

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

  const handleDispenseClick = (address: string) => {
    setSelectedWallet(address);
    setShowModal(true);
  };

  const dispenseAlgorand = async () => {
    if (!selectedWallet) return;

    try {
      await axios.post(`http://127.0.0.1:5000/dispense/${selectedWallet}`, { amount: dispenseAmount });
      fetchWallets(); 
      setError(null); 
      setShowModal(false);
    } catch (err) {
      setError('Failed to dispense Algorand');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWallets(); // Fetch wallets on initial render
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Algorand Wallet Manager</h1>
      <div className="text-center mb-4">
        <Button variant="primary" onClick={createWallet}>
          Create Wallet on Algorand
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
              <td>{wallet.balance}</td> {/* Convert to Algo */}
              <td>
                <Button variant="success" onClick={() => handleDispenseClick(wallet.address)}>
                  Dispense Algo
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Dispense Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={dispenseAlgorand}>
            Dispense
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
