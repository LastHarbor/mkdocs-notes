from flask import Flask, redirect, url_for, session, jsonify
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your_default_secret_key')

oauth = OAuth(app)
auth0 = oauth.register(
    'auth0',
    client_id=os.getenv('AUTH0_CLIENT_ID'),
    client_secret=os.getenv('AUTH0_CLIENT_SECRET'),
    api_base_url=f'https://{os.getenv("AUTH0_DOMAIN")}',
    access_token_url=f'https://{os.getenv("AUTH0_DOMAIN")}/oauth/token',
    authorize_url=f'https://{os.getenv("AUTH0_DOMAIN")}/authorize',
    client_kwargs={
        'scope': 'openid profile email',
    },
)

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login')
def login():
    return auth0.authorize_redirect(redirect_uri=url_for('authorized', _external=True))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/authorized')
def authorized():
    token = auth0.authorize_access_token()
    resp = auth0.get('userinfo')
    user_info = resp.json()

    session['jwt_payload'] = user_info
    session['profile'] = {
        'user_id': user_info['sub'],
        'name': user_info['name'],
        'picture': user_info['picture']
    }
    return jsonify(user_info)

if __name__ == '__main__':
    app.run(port=8000)
