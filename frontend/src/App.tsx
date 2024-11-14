import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Container, Nav, Navbar, Row, Col } from 'react-bootstrap';
import Localnet from './containers/localnet/Localnet';
import Wallet from './containers/wallet/Wallet';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>Algorand Manager</Navbar.Brand>
          <Nav className="me-auto">
            <Row>
              <Col>
                <Nav.Link as={Link} to="/localnet">LocalNet</Nav.Link>
              </Col>
              <Col>
                <Nav.Link as={Link} to="/wallet">Wallet</Nav.Link>
              </Col>
            </Row>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/localnet" element={<Localnet />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
