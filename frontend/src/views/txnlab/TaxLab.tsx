import { NetworkId, useWallet, type Wallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import * as React from 'react'
import { Button, Form, Row } from 'react-bootstrap'
import BetOnAlgoPriceModal from "../../components/BetOnAlgoPriceModal";

const TxnLab: React.FC = () => {
    const {
        algodClient,
        activeAddress,
        activeNetwork,
        setActiveNetwork,
        transactionSigner,
        wallets,
    } = useWallet()

    const [isSending, setIsSending] = React.useState(false)
    const [showModal, setShowModal] = React.useState(false)

    const isConnectDisabled = (wallet: Wallet) => {
        return wallet.isConnected
    }

    const setActiveAccount = (event: React.ChangeEvent<HTMLSelectElement>, wallet: Wallet) => {
        const target = event.target
        wallet.setActiveAccount(target.value)
    }

    const betTransaction = async (amount: number, condition: string, dateTime: string) => {
        try {
            if (!activeAddress) {
                throw new Error('[App] No active account')
            }

            const suggestedParams = await algodClient.getTransactionParams().do()

            const appIndex = 2578536498 // Replace with your actual app index

            const appArgs = [
                new TextEncoder().encode(amount.toString()),
                new TextEncoder().encode(condition),         
                new TextEncoder().encode(dateTime),           
            ]

            const betTransaction = algosdk.makeApplicationCallTxnFromObject({
                from: activeAddress,       
                suggestedParams,           
                appIndex: appIndex,        
                onComplete: 0,  
                appArgs: appArgs,          
                accounts: [],              
                note: new TextEncoder().encode(
                `Bet: Algo price ${condition} ${amount} at ${dateTime}`
            ),
            })

            const atc = new algosdk.AtomicTransactionComposer()
            atc.addTransaction({
                txn: betTransaction,
                signer: transactionSigner, 
            })

            setIsSending(true)

            const result = await atc.execute(algodClient, 4)

            console.info(`[App] ✅ Successfully sent bet transaction!`, {
                confirmedRound: result.confirmedRound,
                txIDs: result.txIDs,
            })
        } catch (error) {
            console.error('[App] Error sending bet transaction:', error)
        } finally {
            setIsSending(false)
        }
    }

    const sendTransaction = async () => {
        try {
            if (!activeAddress) {
                throw new Error('[App] No active account')
            }

            const atc = new algosdk.AtomicTransactionComposer()
            const suggestedParams = await algodClient.getTransactionParams().do()

            const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: activeAddress,
                to: activeAddress,
                amount: 0,
                suggestedParams,
            })

            atc.addTransaction({ txn: transaction, signer: transactionSigner })

            console.info(`[App] Sending transaction...`, transaction)

            setIsSending(true)

            const result = await atc.execute(algodClient, 4)

            console.info(`[App] ✅ Successfully sent transaction!`, {
                confirmedRound: result.confirmedRound,
                txIDs: result.txIDs,
            })
        } catch (error) {
            console.error('[App] Error signing transaction:', error)
        } finally {
            setIsSending(false)
        }
    }

    const createAsset = async () => {
        try {
            if (!activeAddress) {
                throw new Error('[App] No active account')
            }

            const atc = new algosdk.AtomicTransactionComposer()
            const suggestedParams = await algodClient.getTransactionParams().do()

            const transaction = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: activeAddress,
                total: 1000000,
                decimals: 0,
                defaultFrozen: false,
                unitName: 'ALGOTKN',
                assetName: 'AlgoDevShopToken',
                manager: activeAddress,
                reserve: undefined,
                freeze: undefined,
                clawback: undefined,
                suggestedParams,
            })

            atc.addTransaction({ txn: transaction, signer: transactionSigner })

            const result = await atc.execute(algodClient, 4)
            console.info(`[App] Asset creation transaction sent with ID: ${result}`)

            console.info(`[App] ✅ Successfully created Asset!`, {
                confirmedRound: result.confirmedRound,
                txIDs: result.txIDs,
            })
        } catch (error) {
            console.error('[App] Error creating asset:', error)
        }
    }

    return (
        <div>
            <div className='my-4'>
                <h4>
                    Current Network: <span className='active-network'>{activeNetwork}</span>
                </h4>
                <Button
                    variant='secondary'
                    onClick={() => setActiveNetwork(NetworkId.BETANET)}
                    disabled={activeNetwork === NetworkId.BETANET}
                >
                    Set to Betanet
                </Button>
                <Button
                    variant='secondary'
                    className='mx-4'
                    onClick={() => setActiveNetwork(NetworkId.TESTNET)}
                    disabled={activeNetwork === NetworkId.TESTNET}
                >
                    Set to Testnet
                </Button>
                <Button
                    variant='secondary'
                    onClick={() => setActiveNetwork(NetworkId.MAINNET)}
                    disabled={activeNetwork === NetworkId.MAINNET}
                >
                    Set to Mainnet
                </Button>
            </div>

            {wallets.map((wallet) => (
                <div key={wallet.id} className='my-4'>
                    <h4>
                        {wallet.metadata.name} {wallet.isActive ? '[Active]' : ''}
                    </h4>

                    <div className='wallet-buttons'>
                        <Button
                            onClick={() => wallet.connect()}
                            disabled={isConnectDisabled(wallet)}
                        >
                            Connect
                        </Button>
                        <Button
                            className='mx-4'
                            onClick={() => wallet.disconnect()}
                            disabled={!wallet.isConnected}
                        >
                            Disconnect
                        </Button>
                        {wallet.isActive ? (
                            <Button onClick={sendTransaction} disabled={isSending}>
                                {isSending ? 'Sending Transaction...' : 'Send Transaction'}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => wallet.setActive()}
                                disabled={!wallet.isConnected}
                            >
                                Set Active
                            </Button>
                        )}
                    </div>

                    {wallet.isActive && wallet.accounts.length > 0 && (
                        <Form.Select
                            className='my-4'
                            onChange={(e) => setActiveAccount(e, wallet)}
                        >
                            {wallet.accounts.map((account) => (
                                <option key={account.address} value={account.address}>
                                    {account.address}
                                </option>
                            ))}
                        </Form.Select>
                    )}
                </div>
            ))}

            <Row className='col-md-2 my-2'>
                <Button variant='warning' onClick={() => createAsset()}>
                    Make An Asset
                </Button>
            </Row>

            <div>
                <Row className='col-md-2 my-2'>
                    <Button variant='warning' onClick={() => setShowModal(true)}>
                        Bet On Algo
                    </Button>
                </Row>

                {/* Modal for placing a bet */}
                <BetOnAlgoPriceModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    onSend={betTransaction}
                />

                {isSending && <div>Sending transaction...</div>}
            </div>
        </div>
    )
}

export default TxnLab
