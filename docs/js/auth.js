window.env = {
    AUTH0_CLIENT_ID: "your-client-id",
    AUTH0_CLIENT_SECRET: "your-client-secret",
    AUTH0_DOMAIN: "your-domain.auth0.com",
    SECRET_KEY: "your-secret-key"
};

window.onload = function() {
    if (!localStorage.getItem('auth_token')) {
        login();
    } else {
        validateToken();
    }
};

function login() {
    var auth0Domain = window.env.AUTH0_DOMAIN;
    var clientId = window.env.AUTH0_CLIENT_ID;
    var redirectUri = window.location.origin;
    var scope = 'openid profile email';

    var authUrl = `https://${auth0Domain}/authorize?response_type=token&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location = authUrl;
}

function validateToken() {
    var token = localStorage.getItem('auth_token');
    var auth0Domain = window.env.AUTH0_DOMAIN;

    fetch(`https://${auth0Domain}/userinfo`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Token validation failed');
        }
        return response.json();
    })
    .then(data => {
        console.log('User authenticated:', data);
    })
    .catch(error => {
        console.error('Authentication error:', error);
        login();
    });
}

(function() {
    function parseHash(hash) {
        var params = hash.slice(1).split('&').reduce(function(result, item) {
            var parts = item.split('=');
            result[parts[0]] = parts[1];
            return result;
        }, {});
        return params;
    }

    var hash = window.location.hash;
    if (hash.includes('access_token')) {
        var params = parseHash(hash);
        localStorage.setItem('auth_token', params['access_token']);
        window.location.hash = '';
    }
})();
