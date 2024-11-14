import React, { useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { PeraWalletConnect } from '@perawallet/connect';
import { DeflyWalletConnect } from '@blockshake/defly-connect';

const Wallet: React.FC = () => {
    const peraWallet = new PeraWalletConnect();
    const deflyWallet = new DeflyWalletConnect();

    const [deflyAddress, setDeflyAddress] = useState<string | null>(null);
    const [isDeflyConnected, setIsDeflyConnected] = useState(false);

    const [peraAddress, setPeraAddress] = useState<string | null>(null);
    const [isPeraConnected, setIsPeraConnected] = useState(false);
    const [error, setError] = useState<string | null>("");

    const connectPeraWallet = async () => {
        try {
            const accounts = await peraWallet.connect();
            if (accounts.length > 0) {
                setPeraAddress(accounts[0]);
                setIsPeraConnected(true);
                setError(null);
            }
        } catch (error) {
            setError('Failed to connect to Pera Wallet');
            console.error(error);
        }
    };

    const disconnectPeraWallet = () => {
        peraWallet.disconnect();
        setPeraAddress(null);
        setIsPeraConnected(false);
    };

    const connectDeflyWallet = async () => {
        try {
            const address = await deflyWallet.connect();
            setDeflyAddress(deflyAddress);
            setIsDeflyConnected(true);
        } catch (error) {
            console.error('Failed to connect to Defly Wallet', error);
        }
    };

    const disconnectDeflyWallet = () => {
        deflyWallet.disconnect();
        setDeflyAddress(null);
        setIsDeflyConnected(false);
    };


    return (
        <Col className='d-flex justify-content-start'>
            <div className="text-center mb-4">
                {!isPeraConnected ? (
                    <Button variant="warning m-3" onClick={connectPeraWallet}>
                        Connect Pera Wallet
                    </Button>
                ) : (
                    <>
                        <p>{peraAddress}</p>
                        <Button variant="danger m-3" onClick={disconnectPeraWallet}>
                            Disconnect
                        </Button>
                    </>
                )}
            </div>
            <div className="text-center mb-4">
                {!isPeraConnected ? (
                    <Button variant="dark m-3" onClick={connectDeflyWallet}>
                        Connect Defly
                    </Button>
                ) : (
                    <>
                        <p>{deflyAddress}</p>
                        <Button variant="danger m-3" onClick={disconnectDeflyWallet}>
                            Disconnect
                        </Button>
                    </>
                )}
            </div>
        </Col>
    );
};

export default Wallet;
