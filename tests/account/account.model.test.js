const accountModel = require('../../controllers/account.model');
const couchbase = require('couchbase');
const N1qlQuery = couchbase.N1qlQuery;
const db = require('./../../controllers/db');
const chai = require('chai');
const expect = chai.expect;

let newAccount, newBadPasswordAccount;

function clearAccounts( next ){
    const q = N1qlQuery.fromString( 'DELETE FROM `'+process.env.BUCKET+'`' );
    db.query( q, ( e, r, m ) => {
        if(e){
            console.log( 'error in deleting test db' )
            console.log( e );
        }else{
            console.log( 'meta from deleting.' );
            console.log( m );
            console.log( 'count from deleting.' );
            console.log( m.metrics.mutationCount );
            console.log( 'test db cleared ' );
        }
        console.log( 'end testing statement.' );
        next();
    });
}

function indexAvailable(next){
    console.log('testing test indexes.');
    const q1 = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username` = "username" ');
    db.query(q1, (e,r,m) =>{
        if(e){
            console.log('index query failed');
            // console.log('query used:');
            // console.log(q1);
            // console.log();
            // console.log('error');
            // console.log(e);
            next(true);
        } else {
            next(false);
        }
    });
}

function buildPrimaryIndex( next ) {
    const testPKaccount = N1qlQuery.fromString('CREATE PRIMARY INDEX ON `'+process.env.BUCKET+'`');
    db.query(testPKaccount, (e) => {
        if(e) {
            console.log('testPKaccount failed.');
            console.log(e);
        } else {
            console.log('testPKaccount should be added.');
        }
        next();
    });
}

function buildIndexes( next ) {
    const testFKaccount_username =  N1qlQuery.fromString( 'CREATE INDEX testFKaccount_username ON `'+process.env.BUCKET+'`(username) where `_type` == account' );
    db.query(testFKaccount_username, ( e ) => {
        if( e ) {
            console.log( 'testFKaccount_username failed.' );
            console.log( e );
        } else {
            console.log( 'testFKaccount_username should be added.' );
        }
        next();
    });
}

function initializeAccount( next ) {
    const testUser = {
        "username": "testuser",
        "password":"1A2b6O!b",
        "email": "dune44@hotmail.com",
    };
    accountModel.Create.account(testUser, (goodResult) => {
        newAccount = goodResult;
        next();
    });

}

function initializeBadPasswordAccount( next ) {
    const testUser = {
        "username": "testuser2",
        "password":"1A2b6b",
        "email": "dune44@hotmail.com",
    };

    accountModel.Create.account(testUser, (badResult) => {
        newBadPasswordAccount = badResult;
        next();
    });
}

describe('Account Model Create a user account', () => {

    before( ( done ) => {
        console.log( 'Start before statement' );
            indexAvailable( ( result ) => {
                if ( result ) {
                    console.log( 'build indexes' );
                    buildPrimaryIndex( () => {
                        buildIndexes( () => {
                            initializeBadPasswordAccount( done );
                        });
                    });
                } else {
                    console.log( 'failure to get indexAvailable results' );
                    initializeAccount( () => {
                        initializeBadPasswordAccount( done );
                    });
                }
        });
    });

    after( ( done ) => {
        // Allow some timeout to allow db to settle
        setTimeout( () => {
            clearAccounts( done );
        }, 200);
    });

    it('newAccount should not return false', () => {
            expect(newAccount).to.not.equal(false);
    });

    it('newAccount data should have property email', () => {
        expect(newAccount.data).to.have.property('email');
    });

    it('newAccount email should be a string', () => {
        expect(newAccount.data.email).to.be.a('string');
    });

    it('newAccount should have property password', () => {
        expect(newAccount.data).to.have.property('password');
    });

    it('newAccount password should be a string', () => {
        expect(newAccount.data.password).to.be.a('string');
    });
    
    it('newAccount should have a password longer than 30', () => {
        expect(newAccount.data.password).to.have.lengthOf.at.least(30);
    });

    it('newAccount should have property result.', () => {
       expect(newAccount).to.have.property('result');
    });

    it('newAccount should have property username', () => {
        expect(newAccount.data).to.have.property('username');
    });

    it('newAccount username should be a string', () => {
        expect(newAccount.data.username).to.be.a('string');
    });

    it('newAccount should have a username longer than 3', () => {
        expect(newAccount.data.username).to.have.lengthOf.at.least(3);
    });
    
    //Bad Accounts
    it('newBadAccount should contain an error message', () => {
        expect(newBadPasswordAccount).to.have.property('msg');
    });

    it('newBadAccount should have property result', () => {
        expect(newBadPasswordAccount).to.have.property('result');
    });

    it('newBadPasswordAccount should have result of false', () => {
        expect(newBadPasswordAccount.result).to.equal(false);
    });

});

// describe('Read findOne', () => {

// });

// describe('Read Validate Credentials', () => {

// });

// describe('Update', () => {

// });

// describe('Delete', () => {
     
// });