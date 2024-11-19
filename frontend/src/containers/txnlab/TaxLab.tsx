import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { PeraWalletConnect } from '@perawallet/connect';
import { DeflyWalletConnect } from '@blockshake/defly-connect';
import algosdk from 'algosdk';

const TxnLab: React.FC = () => {
    const peraWallet = new PeraWalletConnect();
    const deflyWallet = new DeflyWalletConnect();

    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [walletBalance, setWalletBalance] = useState(0);

    const algorandClient = new algosdk.Algodv2(
        '',
        'https://testnet-api.algonode.cloud',
        ''
    );

    const connectPeraWallet = async () => {
        try {
            const accounts = await peraWallet.connect();
            const address = accounts[0];
            setWalletAddress(address);
            setIsWalletConnected(true);
            fetchWalletBalance(address);
        } catch (error) {
            console.error('Failed to connect to Pera Wallet', error);
        }
    };

    const connectDeflyWallet = async () => {
        try {
            const address = await deflyWallet.connect();
            // setWalletAddress(address);
            setIsWalletConnected(true);
            // fetchWalletBalance(address);
        } catch (error) {
            console.error('Failed to connect to Defly Wallet', error);
        }
    };

    const fetchWalletBalance = async (address: string) => {
        try {
            const accountInfo = await algorandClient.accountInformation(address).do();
            setWalletBalance(accountInfo.amount / 1e6); // Convert microAlgos to Algos
        } catch (error) {
            console.error('Failed to fetch wallet balance', error);
        }
    };

    return (
        <Col>
            <Button variant="warning m-3" onClick={connectPeraWallet}>
                Connect Pera Wallet
            </Button>
            <Button variant="dark m-3" onClick={connectDeflyWallet}>
                Connect Defly Wallet
            </Button>

            {isWalletConnected && (
                <Card className="mt-4 p-3">
                    <Card.Body>
                        <Card.Title>Wallet Details</Card.Title>
                        <Card.Text>
                            <strong>Address:</strong> {walletAddress}
                        </Card.Text>
                        <Card.Text>
                            <strong>Balance:</strong> {walletBalance} Algos
                        </Card.Text>
                    </Card.Body>
                </Card>
            )}
        </Col>
    );
};

export default TxnLab;
