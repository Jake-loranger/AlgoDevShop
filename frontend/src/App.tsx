import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Nav, Navbar, Row, Col, Image } from 'react-bootstrap';
import Localnet from './views/localnet/Localnet';
import Wallet from './views/wallet/Wallet';
import TxnLab from './views/txnlab/TaxLab';
import {
  NetworkId,
  WalletId,
  WalletManager,
  WalletProvider
} from '@txnlab/use-wallet-react';
import algoLogo from './assets/algorand.png';

const App: React.FC = () => {
  const walletManager = new WalletManager({
    wallets: [
      WalletId.DEFLY,
      WalletId.PERA
    ],
    network: NetworkId.TESTNET
  })


  return (
    <WalletProvider manager={walletManager}>
      <Router>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            <Navbar.Brand>
              <Image
                src={algoLogo}
                alt="Algorand Logo"
                width="50"
                height="50"
                fluid
              />
            </Navbar.Brand>
            <Nav className="me-auto">
              <Row>
                <Col>
                  <Nav.Link as={Link} to="/localnet">LocalNet</Nav.Link>
                </Col>
                <Col>
                  <Nav.Link as={Link} to="/wallet">Wallet</Nav.Link>
                </Col>
                <Col>
                  <Nav.Link as={Link} to="/txnlab">TxnLab</Nav.Link>
                </Col>
              </Row>
            </Nav>
          </Container>
        </Navbar>

        <Container className="mt-4">
          <Routes>
            <Route path="/localnet" element={<Localnet />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/txnlab" element={<TxnLab />} />
          </Routes>
        </Container>
      </Router>
    </WalletProvider>
  );
};

export default App;
