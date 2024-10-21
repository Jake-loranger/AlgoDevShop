from flask import Flask, jsonify, request
from flask_cors import CORS
from algokit_utils.beta.algorand_client import (
    AlgorandClient, 
    PayParams, 
    AssetCreateParams 
)

app = Flask(__name__)
CORS(app)

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
                amount=amount_in_microalgo
            )
        )

        # Update the balance for the address in the wallets list
        for wallet in wallets:
            if wallet['address'] == address:
                wallet['balance'] += amount_in_algo

        return jsonify({'message': f'Dispensed {amount_in_algo} Algorand', 'address': address}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/create-asset', methods=['POST'])
def create_asset():

    try:
        data = request.get_json()
        asset_name = data.get("name")
        asset_unit_name = data.get("unit")
        asset_supply = data.get("supply")

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
                total=asset_supply,
                asset_name=asset_name,
                unit_name=asset_unit_name,
                manager=creator.address,
                clawback=creator.address,
                freeze=creator.address
            )
        )

        asset_id = sent_txn["confirmation"]["asset-index"]

        assets.append({'id': asset_id, 'name': asset_name, 'unit': asset_unit_name, 'supply': asset_supply})
        return jsonify({'id': asset_id,  'name': asset_name, 'unit': asset_unit_name, 'supply': asset_supply}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/assets', methods=['GET'])
def get_assets():
    return jsonify(assets), 200

if __name__ == '__main__':
    app.run(debug=True)
