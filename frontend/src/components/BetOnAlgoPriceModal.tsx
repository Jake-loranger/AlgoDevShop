import { Modal, Button, Form } from 'react-bootstrap';
import { useState } from 'react';

interface BetOnAlgoPriceModalProps {
    show: boolean;
    onHide: () => void;
    onSend: (amount: number, condition: string, dateTime: string) => void;
}

const BetOnAlgoPriceModal: React.FC<BetOnAlgoPriceModalProps> = ({ show, onHide, onSend }) => {
    const [amount, setAmount] = useState<number>(0);
    const [condition, setCondition] = useState<string>('over');
    const [dateTime, setDateTime] = useState<string>('');

    const handleSend = () => {
        onSend(amount, condition, dateTime);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Bet On Algo Price</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="betAmount">
                        <Form.Label>Bet Amount (in Algo)</Form.Label>
                        <Form.Control
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Enter amount to bet"
                        />
                    </Form.Group>
                    <Form.Group controlId="betCondition" className="my-3">
                        <Form.Label>Condition</Form.Label>
                        <Form.Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                            <option value="over">Over</option>
                            <option value="under">Under</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="betDateTime" className="my-3">
                        <Form.Label>Datetime</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSend}>
                    Send Bet
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BetOnAlgoPriceModal;
