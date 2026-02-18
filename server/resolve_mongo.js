const dns = require('dns');

// Force use of Google DNS
dns.setServers(['8.8.8.8']);

const srvRecord = '_mongodb._tcp.cluster0.bs0ptyg.mongodb.net';

console.log(`Attempting to resolve ${srvRecord} using 8.8.8.8...`);

dns.resolveSrv(srvRecord, (err, addresses) => {
    if (err) {
        console.error('Resolution failed:', err);
        return;
    }

    console.log('Success! Found shards:');
    addresses.forEach(a => console.log(a.name));
});
