const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const cluster = new couchbase.Cluster(process.env.COUCHBASE_URL);
cluster.authenticate(process.env.DB_USERNAME,process.env.DB_PASSWORD);
var bucket = cluster.openBucket(process.env.BUCKET);

if(process.env.NODE_ENV == 'dev'){
    console.log('testing dev indexes.');
    const q = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE username=$1');
    bucket.query(q, ['username'], (e,r,m) =>{
        if(e){
            console.log('index query failed');
            console.log('query used:');
            console.log(q);
            console.log();
            console.log('error');
            console.log(e);
            const PKaccount = N1qlQuery.fromString('CREATE PRIMARY INDEX ON '+process.env.BUCKET);
            bucket.query(PKaccount);
            const FKaccount_username = N1qlQuery.fromString('CREATE INDEX FKaccount_username ON '+process.env.BUCKET+'(username) where _type == account');
            bucket.query(FKaccount_username);
        }
    });
}else if(process.env.NODE_ENV == 'test'){
    console.log('testing test indexes.');
    const q = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username`=$1');
    bucket.query(q, ['username'], (e,r,m) =>{
        if(e){
            console.log('index query failed');
            console.log('query used:');
            console.log(q);
            console.log();
            console.log('error');
            console.log(e);
            const testPKaccount = N1qlQuery.fromString('CREATE PRIMARY INDEX ON '+process.env.BUCKET);
            bucket.query(testPKaccount);
            const testFKaccount_username = N1qlQuery.fromString('CREATE INDEX FKaccount_username ON '+process.env.BUCKET+'(username) where _type == account');
            bucket.query(testFKaccount_username);
        }
    });
}else{
    console.log('NODE_ENV is ' + process.env.NODE_ENV);
}
// Check for indexes, if they don't exist create them.


module.exports = bucket;
