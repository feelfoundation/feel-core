const request = require('request');

 request({
        url: 'http://127.0.0.1:8500/api/node/status/forging',
        method: 'PUT',
        json: {
                forging: true,  
                publicKey: '4f7c0262dc5909e5e43b0cf950b7754d40501dd2e218c148d7fbf8236ed78574',
                password: 'elephant tree paris dragon chair galaxy'
        }
 }, function (err, res) {
        console.log('Forging enabling result:', err, res ? res.body : null);
 });


