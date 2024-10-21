from flask import Flask, jsonify, request
from flask_cors import CORS
from algokit_utils.beta.algorand_client import (
    AlgorandClient, 
    PayParams, 
    AssetCreateParams 
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

wallets = []
assets = []

@app.route('/create-wallet', methods=['GET'])
def create_wallet():
    try:
        algorand = AlgorandClient.default_local_net()
        creator = algorand.account.random()
        creator_address = creator.address

        # Add the wallet to the list with an initial balance of 0
        wallets.append({'address': creator_address, 'balance': 0})
        return jsonify({'address': creator_address}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/wallets', methods=['GET'])
def get_wallets():
    return jsonify(wallets), 200

@app.route('/dispense/<address>', methods=['POST'])
def dispense_algorand(address):
    try:
        # Parse the incoming request data for the amount to dispense
        data = request.get_json()
        amount_in_algo = data.get('amount', 1)  # Default to dispensing 1 Algo if not specified
        amount_in_microalgo = amount_in_algo * 1_000_000  # Convert to microAlgo

        algorand = AlgorandClient.default_local_net()
        dispenser = algorand.account.dispenser()

        # Sending Algorand to the specified wallet address
        algorand.send.payment(
            PayParams(
                sender=dispenser.address,
                receiver=address,
                amount=amount_in_microalgo  # Use the converted amount to dispense
            )
        )

        # Update the balance for the address in the wallets list
        for wallet in wallets:
            if wallet['address'] == address:
                wallet['balance'] += amount_in_algo  # Update balance by dispensing the specified amount

        return jsonify({'message': f'Dispensed {amount_in_algo} Algorand', 'address': address}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/create-asset', methods=['GET'])
def create_asset():

    try:
        algorand = AlgorandClient.default_local_net()
        dispenser = algorand.account.dispenser()
        creator = algorand.account.random()
        
        algorand.send.payment(
            PayParams(
                sender=dispenser.address,
                receiver=creator.address,
                amount=10_000_000
            )
        )

        sent_txn = algorand.send.asset_create(
            AssetCreateParams(
                sender=creator.address,
                total=1000,
                asset_name="TestToken",
                unit_name="test",
                manager=creator.address,
                clawback=creator.address,
                freeze=creator.address
            )
        )

        # Extracting Asset ID
        asset_id = sent_txn["confirmation"]["asset-index"]
        print(asset_id)

        return jsonify({'name': asset_id, 'supply': asset_id, 'id': asset_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/assets', methods=['GET'])
def get_assets():
    return jsonify(assets), 200

if __name__ == '__main__':
    app.run(debug=True)
