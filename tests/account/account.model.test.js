const accountModel = require('../../controllers/account.model');
const chai = require('chai');
const couchbase = require('couchbase');
const db = require('./../../controllers/db');
const dirtyChai = require('dirty-chai');
const expect = chai.expect;
const N1qlQuery = couchbase.N1qlQuery;
const roles = require('./../../config/roles');
const { v4: uuidv4 } = require('uuid');

chai.use(dirtyChai);

/*
Test Template

describe( '', () => {

  before( ( done ) => {
    done();
  });

  after( done => done() );

  // Property Exists

  // Property Type

  // Return Value

});

*/
const errMsg = require('./../../controllers/account.errMsg');
describe( 'Error msg sanity check.', () => {

      // Property Existence
      it( 'errMsg should have property accountNotFound', () => {
        expect( errMsg ).to.have.property( 'accountNotFound' );
      });

      it( 'errMsg should have property emailInvalid', () => {
        expect( errMsg ).to.have.property( 'emailInvalid' );
      });
      
      it( 'errMsg should have property errorMsg', () => {
        expect( errMsg ).to.have.property( 'errorMsg' );
      });
      
      it( 'errMsg should have property passwordTooShort', () => {
        expect( errMsg ).to.have.property( 'passwordTooShort' );
      });

      it( 'errMsg should have property roleInvalid', () => {
        expect( errMsg ).to.have.property( 'roleInvalid' );
      });

      it( 'errMsg should have property usernameTooShort', () => {
        expect( errMsg ).to.have.property( 'usernameTooShort' );
      });

      it( 'errMsg should have property updateGenericFail', () => {
        expect( errMsg ).to.have.property( 'updateGenericFail' );
      });

      // Property Type
      it( 'errMsg accountNotFound id should be a string', () => {
        expect( errMsg.accountNotFound ).to.be.a( 'string' );
      });

      it( 'errMsg emailInvalid id should be a string', () => {
        expect( errMsg.emailInvalid ).to.be.a( 'string' );
      });

      it( 'errMsg errorMsg id should be a string', () => {
        expect( errMsg.errorMsg ).to.be.a( 'string' );
      });

      it( 'errMsg passwordTooShort id should be a string', () => {
        expect( errMsg.passwordTooShort ).to.be.a( 'string' );
      });

      it( 'errMsg roleInvalid id should be a string', () => {
        expect( errMsg.roleInvalid ).to.be.a( 'string' );
      });

      it( 'errMsg usernameTooShort id should be a string', () => {
        expect( errMsg.usernameTooShort ).to.be.a( 'string' );
      });

      it( 'errMsg updateGenericFail id should be a string', () => {
        expect( errMsg.updateGenericFail ).to.be.a( 'string' );
      });
      
});

let newAccount,
  newAccount2,
  testAccountUID,
  testAccount2UID,
  readAccountByUsernameResult,
  newBadPasswordAccount,
  newBadUsernameAccount,
  newBadEmailAccount,
  validationToken;

const username = 'testUser';
const password = '1A2b6O!b';
const username2 = 'testUser2';
const password2 = 'A!3k90P2';
const badUID = uuidv4();
const badRole = 'MasterBlasterEatsMitosis';

const testUserObj = {
  "username": username,
  "password": password,
  "email": "bob@somesite.com",
};
const testUser2Obj = {
  "username": username2,
  "password":"8I3a9B!bc",
  "email": "fred@somesite.com",
};

describe( 'Account Model Create a user account', () => {

  function clearAccounts( next ){
      const q = N1qlQuery.fromString( 'DELETE FROM `'+process.env.BUCKET+'`' );
      db.query( q, function( e ) {
          if(e){
              console.log( 'error in deleting test db' );
              console.log( e );
          }else{
              // console.log( 'meta from deleting.' );
              // console.log( m );
              //console.log( 'count from deleting.' );
              //console.log( m.metrics.mutationCount );
              //console.log( 'test db cleared ' );
          }
          //console.log( 'end testing statement.' );
          setTimeout(next, 200);
      });
  }

  function indexAvailable(next){
      //console.log('testing test indexes.');
      const q1 = N1qlQuery.fromString('SELECT * FROM `'+process.env.BUCKET+'` WHERE `username` = "username" ');
      db.query(q1, function( e, r, m) {
          if(e){
              //console.log('index query failed');
              // console.log('query used:');
              // console.log(q1);
              // console.log();
              // console.log('error');
              // console.log(e);
              next( false );
          } else {
              next( true );
          }
      });
  }

  function buildPrimaryIndex( next ) {
      const testPKaccount = N1qlQuery.fromString('CREATE PRIMARY INDEX ON `'+process.env.BUCKET+'`');
      db.query(testPKaccount, function(e) {
          if(e) {
              //console.log('testPKaccount failed.');
              //console.log(e);
          } else {
              //console.log('testPKaccount should be added.');
          }
          next();
      });
  }

  function buildIndexes( next ) {
      const testFKaccount_username =  N1qlQuery.fromString( 'CREATE INDEX testFKaccount_username ON `'+process.env.BUCKET+'`(username) where `_type` == account' );
      db.query(testFKaccount_username, function( e ) {
          //if( e ) {
              //console.log( 'testFKaccount_username failed.' );
              //console.log( e );
          //} else {
              //console.log( 'testFKaccount_username should be added.' );
          //}
          next();
      });
  }

  function runDbCalls( next ){
      initializeAccount( () => {
          initializeBadPasswordAccount( () => {
              initializeBadUsernameAccount( () => {
                  initializeBadEmailAccount( next );
              });
          });
      });
  }

  function initializeAccount( next ) {
      accountModel.Create.account( testUserObj, ( goodResult ) => {
          newAccount = goodResult;
          next();
      });
  }

  function initializeBadPasswordAccount( next ) {
      const testUserObj = {
          "username": "testUser2",
          "password":"1A2b6b",
          "email": "dune44@hotmail.com",
      };
      accountModel.Create.account(testUserObj, (badResult) => {
          newBadPasswordAccount = badResult;
          next();
      });
  }

  function initializeBadUsernameAccount( next ){
      const testUserObj = {
          "username": "te",
          "password":"2M@iP931p",
          "email": "dune44@hotmail.com",
      };
      accountModel.Create.account(testUserObj, (badResult) => {
          newBadUsernameAccount = badResult;
          next();
      });
  }

  function initializeBadEmailAccount( next ){
      const testUserObj = {
          "username": "testUser3",
          "password":"2M@iP931p",
          "email": "hotmail.com",
      };
      accountModel.Create.account(testUserObj, (badResult) => {
          newBadEmailAccount = badResult;
          next();
      });
  }

  before( ( done ) => {
    //console.log( 'Start before statement' );
    clearAccounts( () => {
      indexAvailable( ( result ) => {
        if ( !result ) {
          //console.log( 'build indexes' );
          buildPrimaryIndex( () => {
            buildIndexes( () => {
              runDbCalls( done );
            });
          });
        } else {
          //console.log( 'Indexes built, proceed.' );
          runDbCalls( done );
        }
      });
    });
  });

  after( ( done ) => {
    setTimeout( done, 200);
  });

  describe( 'Proper Account Creation', () => {

    // Property Existence
    it( 'newAccount data should have property email', () => {
      expect( newAccount.data ).to.have.property( 'email' );
    });

    it( 'newAccount should have property password', () => {
      expect( newAccount.data ).to.have.property( 'password' );
    });

    it( 'newAccount should have property result', () => {
      expect( newAccount ).to.have.property( 'result' );
    });

    it( 'newAccount should have property username', () => {
      expect( newAccount.data ).to.have.property( 'username' );
    });

    // Property Type
    it( 'newAccount data should be an Object', () => {
      expect( newAccount.data ).to.be.a( 'Object' );
    });
    
    it( 'newAccount data email should be a string', () => {
      expect( newAccount.data.email ).to.be.a( 'string' );
    });

    it( 'newAccount data password should be a string', () => {
      expect( newAccount.data.password ).to.be.a( 'string' );
    });

    it( 'newAccount username should be a string', () => {
      expect(newAccount.data.username).to.be.a( 'string' );
    });

    // Return Value
    it( 'newAccount should have a password longer than 30', () => {
      expect( newAccount.data.password ).to.have.lengthOf.at.least( 30 );
    });

    it( 'newAccount should have a username longer than 3', () => {
      expect( newAccount.data.username ).to.have.lengthOf.at.least( 3 );
    });

  });

  describe( 'Account Created with Bad Password', () => {

    // Property Existence
    it( 'newBadPasswordAccount should contain an error message', () => {
      expect( newBadPasswordAccount ).to.have.property( 'msg' );
    });

    it( 'newBadPasswordAccount should have property result', () => {
      expect( newBadPasswordAccount ).to.have.property( 'result' );
    });

    // Property Type
    it( 'newBadPasswordAccount result should be a boolean', () => {
      expect( newBadPasswordAccount.result ).to.have.be.a( 'boolean' );
    });

    it( 'newBadPasswordAccount msg should be a string', () => {
      expect( newBadPasswordAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadPasswordAccount should have result of false', () => {
      expect( newBadPasswordAccount.result ).to.equal( false );
    });

  });

  describe( 'Account Creation with Username that is too short.', () => {

    // Property Existence
    it( 'newBadUsernameAccount should contain an error message', () => {
      expect( newBadUsernameAccount ).to.have.property( 'msg' );
    });

    it( 'newBadUsernameAccount  should have property result', () => {
      expect( newBadUsernameAccount ).to.have.property( 'result' );
    });

    // Property Type
    it( 'newBadUsernameAccount result should be a boolean', () => {
      expect( newBadUsernameAccount.result ).to.have.be.a( 'boolean' );
    });

    it( 'newBadUsernameAccount msg should be a string', () => {
      expect( newBadUsernameAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadUsernameAccount should have result of false', () => {
      expect( newBadUsernameAccount.result ).to.equal( false );
    });

  });

  describe( 'Account Created with a Bad Email', () => {

    // Property Existence
    it( 'newBadEmailAccount should contain an error message', () => {
      expect( newBadEmailAccount ).to.have.property( 'msg' );
    });

    it( 'newBadEmailAccount should have property result', () => {
      expect( newBadEmailAccount ).to.have.property( 'result' );
    });

    // Property Type
    it( 'newBadEmailAccount result should be a boolean', () => {
      expect( newBadEmailAccount.result ).to.have.be.a( 'boolean' );
    });

    it( 'newBadEmailAccount msg should be a string', () => {
      expect( newBadEmailAccount.msg ).to.have.be.a( 'string' );
    });

    // Return Value
    it( 'newBadEmailAccount msg should have value of errMsg.emailInvalid', () => {
      expect( newBadEmailAccount.msg ).to.equal( errMsg.emailInvalid );
    });
    
    it( 'newBadEmailAccount should have result of false', () => {
      expect( newBadEmailAccount.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Create a duplicate username in account', () => {

  let newBadDuplicateNameAccount;

  function attemptDuplicateUsername( next ) {
    accountModel.Create.account(testUserObj, ( result ) => {
      newBadDuplicateNameAccount = result;
      next();
    });
  }

  before( ( done ) => {
    attemptDuplicateUsername( done );
  });

  after( ( done ) => {
    done();
  });

  // Property Existence
  it( 'newBadDuplicateNameAccount should have property result', () => {
    expect(newBadDuplicateNameAccount).to.have.property('result');
  });

  it( 'newBadDuplicateNameAccount should have property msg', () => {
    expect(newBadDuplicateNameAccount).to.have.property('msg');
  });

  // Property Type
  it( 'newBadDuplicateNameAccount result should be a boolean', () => {
    expect( newBadDuplicateNameAccount.result ).to.have.be.a( 'boolean' );
  });

  it( 'newBadDuplicateNameAccount msg should be a string', () => {
    expect( newBadDuplicateNameAccount.msg ).to.have.be.a( 'string' );
  });

  // Return Value
  it( 'newBadDuplicateNameAccount should have result of false', () => {
    expect( newBadDuplicateNameAccount.result ).to.equal( false );
  });

});

describe( 'Account Model Create a second user', () => {

  function initializeSecondAccount( next ) {
    const testUserObj2 = {
        "username": username2,
        "password": password2,
        "email": "steve@somesite.com",
    };
    accountModel.Create.account( testUserObj2, ( goodResult ) => {
      newAccount2 = goodResult;
      testAccount2UID = goodResult.data._id;
      next();
    });
  }

  before( ( done ) => {
    initializeSecondAccount( done );
  });

  after( ( done ) => {
    done();
  });

  // Property Existence
  it( 'newAccount2 data should have property email', () => {
    expect( newAccount2.data ).to.have.property( 'email' );
  });

  it( 'newAccount2 should have property password', () => {
    expect( newAccount2.data ).to.have.property( 'password' );
  });

  it( 'newAccount2 should have property result', () => {
   expect( newAccount2 ).to.have.property( 'result' );
  });

  it( 'newAccount2 should have property username', () => {
    expect( newAccount2.data ).to.have.property( 'username' );
  });

  // Property Type
  it( 'newAccount2 data should be an Object', () => {
    expect( newAccount2.data ).to.be.a( 'Object' );
  });

  it( 'newAccount2 data email should be a string', () => {
    expect( newAccount2.data.email ).to.be.a( 'string' );
  });

  it( 'newAccount2 data password should be a string', () => {
    expect( newAccount2.data.password ).to.be.a( 'string' );
  });

  it( 'newAccount2 username should be a string', () => {
    expect(newAccount2.data.username).to.be.a( 'string' );
  });

  // Return Value
  it( 'newAccount2 should have a password longer than 30', () => {
    expect( newAccount2.data.password ).to.have.lengthOf.at.least( 30 );
  });

  it( 'newAccount2 should have a username longer than 3', () => {
    expect( newAccount2.data.username ).to.have.lengthOf.at.least( 3 );
  });

});

describe( 'Account Model Read accountByUsername', () => {

  describe( 'Read Account with Good Username', () => {

    function readTestAccountUsername( next ){
      accountModel.Read.accountByUsername( username, (result) => {
        readAccountByUsernameResult = result;
        testAccountUID = result.data._id;
        // console.log( 'testAccountUID' );
        // console.log( testAccountUID );
        next();
      });
    }

    before( ( done ) => {
      readTestAccountUsername( done );
    });

    after( ( done ) => {
      setTimeout( done, 1);
    });

    // Property Exists
    it( 'readAccountByUsernameResult should contain property data', () => {
      expect( readAccountByUsernameResult ).to.have.property( 'data' );
    });

    it( 'readAccountByUsernameResult should contain property data._id', () => {
      expect( readAccountByUsernameResult.data ).to.have.property( '_id' );
    });

    it( 'readAccountByUsernameResult should contain property data._type', () => {
      expect( readAccountByUsernameResult.data) .to.have.property( '_type' );
    });

    it( 'readAccountByUsernameResult should contain property data.blocked', () => {
      expect( readAccountByUsernameResult.data ).to.have.property( 'blocked' );
    });

    it( 'readAccountByUsernameResult should contain property data.deleted', () => {
      expect(readAccountByUsernameResult.data).to.have.property('deleted');
    });

    it( 'readAccountByUsernameResult should contain property data.email', () => {
      expect(readAccountByUsernameResult.data).to.have.property('email');
    });

    it( 'readAccountByUsernameResult should NOT contain property data.password', () => {
      expect(readAccountByUsernameResult.data).to.not.have.property('password');
    });

    it( 'readAccountByUsernameResult should contain property data.username', () => {
      expect(readAccountByUsernameResult.data).to.have.property('username');
    });

    it( 'readAccountByUsernameResult should NOT contain property msg', () => {
      expect(readAccountByUsernameResult).to.not.have.property('msg');
    });

    it( 'readAccountByUsernameResult should contain property result', () => {
      expect(readAccountByUsernameResult).to.have.property('result');
    });

    // Property Type
    it( 'readAccountByUsernameResult email should be a data._id', () => {
      expect( readAccountByUsernameResult.data._id ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult email should be a data._type', () => {
      expect( readAccountByUsernameResult.data._type ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult email should be a data.blocked', () => {
      expect( readAccountByUsernameResult.data.blocked ).to.be.a( 'boolean' );
    });

    it( 'readAccountByUsernameResult email should be a data.deleted', () => {
      expect( readAccountByUsernameResult.data.deleted ).to.be.a( 'boolean' );
    });

    it( 'readAccountByUsernameResult email should be a data.email', () => {
      expect( readAccountByUsernameResult.data.email ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult data.username should be a string', () => {
      expect( readAccountByUsernameResult.data.username ).to.be.a( 'string' );
    });

    it( 'readAccountByUsernameResult result should be a boolean', () => {
      expect( readAccountByUsernameResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readAccountByUsernameResult result should have result of true', () => {
      expect( readAccountByUsernameResult.result ).to.equal( true );
    });

  });

    describe( 'Read Account with Bad Username', () => {

    let readBadUsernameAccountResult;
    const badUsername_ReadBadUsernameAccount = 'WillowOfWindsDate';
    const msgReadBadUsernameAccountResult = 'Result not found for ' + badUsername_ReadBadUsernameAccount;
    const badMsg_ReadBadUsernameAccount = 'There is a duplicate found for ' + username;

    function readBadUsernameAccount( next ) {
      accountModel.Read.accountByUsername( badUsername_ReadBadUsernameAccount, ( result ) => {
        readBadUsernameAccountResult = result;
        next();
      });
    }

    before( ( done ) => {
      readBadUsernameAccount( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists -- ( readBadUsernameAccountResult )
    it( 'readBadUsernameAccountResult should NOT contain property data', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUsernameAccountResult should NOT contain property error', () => {
      expect( readBadUsernameAccountResult ).to.not.have.property( 'error' );
    });

    it( 'readBadUsernameAccountResult should contain property msg', () => {
      expect(readBadUsernameAccountResult).to.have.property('msg');
    });

    it( 'readBadUsernameAccountResult should contain property result', () => {
      expect(readBadUsernameAccountResult).to.have.property('result');
    });

    // Property Type
    it( 'readBadUsernameAccountResult msg should be a string', () => {
        expect( readBadUsernameAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUsernameAccountResult result should be a boolean', () => {
        expect( readBadUsernameAccountResult.result ).to.be.a( 'boolean' );
    });

    // Return Value

    it( 'readBadUsernameAccountResult msg should NOT have result of badMsg_ReadBadUsernameAccount: ' + badMsg_ReadBadUsernameAccount, () => {
        expect( readBadUsernameAccountResult.msg ).to.not.equal( badMsg_ReadBadUsernameAccount );
    });

    it( 'readBadUsernameAccountResult msg should have result of msgReadBadUsernameAccountResult: ' + msgReadBadUsernameAccountResult, () => {
        expect( readBadUsernameAccountResult.msg ).to.equal( msgReadBadUsernameAccountResult );
    });

    it( 'readBadUsernameAccountResult result should have result of false', () => {
        expect( readBadUsernameAccountResult.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Read accountById', () => {

  describe( 'Read Account with Good UID.', () => {

    let readAccountByIDResult;

    function readTestAccountByUID( next ){
      accountModel.Read.accountById( testAccountUID, ( result ) => {
        readAccountByIDResult = result;
        next();
      });
    }

      before( ( done ) => {
          readTestAccountByUID( done );
      });

      after( ( done ) => {
          done();
      });

      // Property Exists
      it('readAccountByIDResult should return property data', () => {
          expect(readAccountByIDResult).to.have.property('data');
      });

      it('readAccountByIDResult should return property data._id', () => {
          expect(readAccountByIDResult.data).to.have.property('_id');
      });

      it('readAccountByIDResult should return property data._type', () => {
          expect(readAccountByIDResult.data).to.have.property('_type');
      });

      it('readAccountByIDResult should return property data.blocked', () => {
          expect(readAccountByIDResult.data).to.have.property('blocked');
      });

      it('readAccountByIDResult should return property data.deleted', () => {
          expect(readAccountByIDResult.data).to.have.property('deleted');
      });

      it('readAccountByIDResult should return property data.email', () => {
          expect(readAccountByIDResult.data).to.have.property('email');
      });

      it('readAccountByIDResult should NOT return property data.password', () => {
          expect(readAccountByIDResult.data).to.not.have.property('password');
      });

      it('readAccountByIDResult should return property data.username', () => {
          expect(readAccountByIDResult.data).to.have.property('username');
      });

      it('readAccountByIDResult should NOT return property msg', () => {
          expect(readAccountByIDResult).to.not.have.property('msg');
      });

      it('readAccountByIDResult should return property result', () => {
          expect(readAccountByIDResult).to.have.property('result');
      });

      // Property Type
      it( 'readAccountByIDResult data id should be a string', () => {
          expect( readAccountByIDResult.data._id ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data _type should be a string', () => {
          expect( readAccountByIDResult.data._type ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data blocked should be a boolean', () => {
          expect( readAccountByIDResult.data.blocked ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data deleted should be a boolean', () => {
          expect( readAccountByIDResult.data.deleted ).to.be.a( 'boolean' );
      });

      it( 'readAccountByIDResult data email should be a string', () => {
          expect( readAccountByIDResult.data.email ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult data username should be a string', () => {
          expect( readAccountByIDResult.data.username ).to.be.a( 'string' );
      });

      it( 'readAccountByIDResult result should be a boolean', () => {
          expect( readAccountByIDResult.result ).to.be.a( 'boolean' );
      });

      // Return Value
      it( 'readAccountByIDResult result should have result of true', () => {
          expect( readAccountByIDResult.result ).to.equal( true );
      });

  });

  describe( 'Read Account with Bad UID', () => {

    let readBadUIDAccountResult;

    function badUID_readAccountByID( next ) {
      accountModel.Read.accountById( badUID, ( result ) => {
        readBadUIDAccountResult = result;
        next();
      });
    }

    before( ( done ) => {
      badUID_readAccountByID( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'readBadUIDAccountResult should NOT contain property data', () => {
      expect( readBadUIDAccountResult ).to.not.have.property( 'data' );
    });

    it( 'readBadUIDAccountResult should contain property msg', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'msg' );
    });

    it( 'readBadUIDAccountResult should contain property result', () => {
      expect( readBadUIDAccountResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'readBadUIDAccountResult msg id should be a string', () => {
        expect( readBadUIDAccountResult.msg ).to.be.a( 'string' );
    });

    it( 'readBadUIDAccountResult result id should be a boolean', () => {
        expect( readBadUIDAccountResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'readBadUIDAccountResult msg should have value of var errMsg.accountNotFound', () => {
        expect( readBadUIDAccountResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'readBadUIDAccountResult result should have value of false', () => {
        expect( readBadUIDAccountResult.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Read All', () => {

  let readAllResult;

  function readAllAccounts( next ) {
      accountModel.Read.all( ( result ) => {
        readAllResult = result;
        next();
      });
  }

  before( ( done ) => {
    readAllAccounts( done );
  });

  after( ( done ) => {
    done();
  });

  // Property Exists
  it( 'readAllResult should NOT have property msg', () => {
    expect(readAllResult).to.have.not.property('msg');
  });

  it('readAllResult should have property data', () => {
      expect(readAllResult).to.have.property('data');
  });

  it('readAllResult should have property result', () => {
      expect(readAllResult).to.have.property('result');
  });

  // Property Type
  it( 'readAllResult data should be an Array', () => {
      expect( readAllResult.data ).to.be.a( 'array' );
  });

});

describe( 'Account Model Read Validate Credentials', () => {

  let badUsernameLoginResult, badPasswordLoginResult, goodLoggingResult;
  const validationErrMsg = 'Account validation failed.';
  const fauxIPS = { "ip": "10.0.0.0", "fwdIP": "5.0.0.0" };

  function attemptBadUidLogin( next ) {
    const validationObj = {
        "uid": badUID,
        "password": "85Ie!ki49p",
        "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( validationObj, ( result ) => {
      badUsernameLoginResult = result;
      next();
    });
  }

  function attemptBadPasswordLogin( next ) {
    const testUserObj = {
        "uid": testAccountUID,
        "password": "2M@55iP931p",
        "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( testUserObj, ( result ) => {
      badPasswordLoginResult = result;
      next();
    });
  }

  function attemptGoodLogin( next ) {
    const testUserObj = {
      "uid": testAccountUID,
      "password": password,
      "ips": fauxIPS,
    };
    accountModel.Read.validateAccount( testUserObj, ( result ) => {
      validationToken = result.token;
      goodLoggingResult = result;
      next();
    });
  }

  before( ( done ) => {
    attemptBadUidLogin( () => {
      attemptBadPasswordLogin( () => {
        attemptGoodLogin( done );
      });
    });
  });

  after( ( done ) => {
    done();
  });

  describe( 'Test Bad uid', () => {
    // Property Existence -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult should NOT have property data', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badUsernameLoginResult should NOT have property token', () => {
      expect( badUsernameLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badUsernameLoginResult should have property result', () => {
      expect( badUsernameLoginResult ).to.have.property( 'result' );
    });

    it( 'badUsernameLoginResult should have property msg', () => {
      expect( badUsernameLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult result should be a boolean', () => {
      expect( badUsernameLoginResult.result ).to.be.a( 'boolean' );
    });

    it( 'badUsernameLoginResult msg should be a string', () => {
      expect( badUsernameLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badUsernameLoginResult )
    it( 'badUsernameLoginResult result should have value of false', () => {
      expect( badUsernameLoginResult.result ).to.equal( false );
    });

    it( 'badUsernameLoginResult msg should have value of errMsg.accountNotFound', () => {
      expect( badUsernameLoginResult.msg ).to.equal( errMsg.accountNotFound );
    });

  });

  describe( 'Test Bad Password', () => {
    // Property Existence -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult should NOT have property data', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'data' );
    });

    it( 'badPasswordLoginResult should NOT have property token', () => {
      expect( badPasswordLoginResult ).to.not.have.property( 'token' );
    });

    it( 'badPasswordLoginResult should have property result', () => {
      expect( badPasswordLoginResult ).to.have.property( 'result' );
    });

    it( 'badPasswordLoginResult should have property msg', () => {
      expect( badPasswordLoginResult ).to.have.property( 'msg' );
    });

    // Property Type -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult result should be a boolean', () => {
      expect( badPasswordLoginResult.result ).to.be.a( 'boolean' );
    });

    it( 'badPasswordLoginResult msg should be a string', () => {
      expect( badPasswordLoginResult.msg ).to.be.a( 'string' );
    });

    // Return Value -- ( badPasswordLoginResult )
    it( 'badPasswordLoginResult result should have value of false', () => {
      expect( badPasswordLoginResult.result ).to.equal( false );
    });

    it( 'badPasswordLoginResult msg should have value of var validationErrMsg: ' + validationErrMsg, () => {
      expect( badPasswordLoginResult.msg ).to.equal( validationErrMsg );
    });

  });

  describe( 'Test good login', () => {
    // Property Existence -- ( goodLoggingResult )
    it( 'goodLoggingResult should NOT have property data', () => {
      expect( goodLoggingResult ).to.not.have.property( 'data' );
    });

    it( 'goodLoggingResult should NOT have property msg', () => {
      expect( goodLoggingResult ).to.not.have.property( 'msg' );
    });

    it( 'goodLoggingResult should have property result', () => {
      expect( goodLoggingResult ).to.have.property( 'result' );
    });

    it( 'goodLoggingResult should have property token', () => {
      expect( goodLoggingResult ).to.have.property( 'token' );
    });

    // Property Type -- ( goodLoggingResult )
    it( 'goodLoggingResult result should be a boolean', () => {
      expect( goodLoggingResult.result ).to.be.a( 'boolean' );
    });

    it( 'goodLoggingResult token should be a string', () => {
      expect( goodLoggingResult.token ).to.be.a( 'string' );
    });

    // Return Value -- ( goodLoggingResult )
    it( 'goodLoggingResult result should have value of true', () => {
      expect( goodLoggingResult.result ).to.equal( true );
    });

  });

});

describe( 'Account Model Read Token Operations', () => {

  let decodedToken;
  const expiresInDefault = 'in 7 days';

  function getTokenDecode( next ) {
    accountModel.Read.verifyToken( validationToken, ( token ) => {
      decodedToken = token;
      //console.log( token );
      next();
    });
  }

  describe( ' Validating a good token. ', () => {

    before( ( done ) => {
      getTokenDecode( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Existence -- ( decodedToken )
    it( 'decodedToken should NOT have property error', () => {
        expect( decodedToken ).to.not.have.property( 'error' );
    });

    it( 'decodedToken should NOT have property msg', () => {
        expect( decodedToken ).to.not.have.property( 'msg' );
    });

    it( 'decodedToken should have property result', () => {
        expect( decodedToken ).to.have.property( 'result' );
    });

    it( 'decodedToken should have property expiresIn', () => {
        expect( decodedToken ).to.have.property( 'expiresIn' );
    });


    // Property Type -- ( decodedToken )
    it( 'decodedToken should be an Object', () => {
      expect( decodedToken ).to.be.a( 'Object' );
    });

    it( 'decodedToken expiresIn should be a String', () => {
      expect( decodedToken.expiresIn ).to.be.a( 'string' );
    });

    // Return Value -- ( decodedToken )
    it( 'decodedToken result should have value of true', () => {
        expect( decodedToken.result ).to.equal( true );
    });

    it( 'decodedToken expiresIn should have value equal to var expiresInDefault: '+ expiresInDefault, () => {
        expect( decodedToken.expiresIn ).to.equal( expiresInDefault );
    });

  });


});

describe('Account Model Update role', () => {

  describe( 'Add Good Role to Good Account', () => {
    let update_GoodRole_GoodUser_Result;

    function updateRole( next ) {
      accountModel.Update.role( testAccountUID, roles[0], ( result ) => {
        update_GoodRole_GoodUser_Result = result;
        next();
      });
    }
  
    before( ( done ) => {
      updateRole( done );
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_GoodRole_GoodUser_Result should NOT have property error', () => {
      expect( update_GoodRole_GoodUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_GoodRole_GoodUser_Result should NOT have property msg', () => {
      expect( update_GoodRole_GoodUser_Result ).to.not.have.property( 'msg' );
    });

    it( 'update_GoodRole_GoodUser_Result should have property result', () => {
      expect( update_GoodRole_GoodUser_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_GoodRole_GoodUser_Result should be an Object', () => {
      expect( update_GoodRole_GoodUser_Result ).to.be.a( 'Object' );
    });

    it( 'update_GoodRole_GoodUser_Result result should be a boolean', () => {
      expect( update_GoodRole_GoodUser_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_GoodRole_GoodUser_Result result should have value of true', () => {
      expect( update_GoodRole_GoodUser_Result.result ).to.equal( true );
    });

  });

  describe( 'Add Bad Role to Good Account', () => {
    let update_BadRole_GoodUser_Result;
    const badRoleMSG = 'No such role.';

    function updateRole( next ) {
      accountModel.Update.role( testAccountUID, badRole, ( result ) => {
        update_BadRole_GoodUser_Result = result;
        next();
      });
  
    }
  
    before( ( done ) => {
      updateRole( done );
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_BadRole_GoodUser_Result should NOT have property error', () => {
      expect( update_BadRole_GoodUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_BadRole_GoodUser_Result should have property msg', () => {
      expect( update_BadRole_GoodUser_Result ).to.have.property( 'msg' );
    });

    it( 'update_BadRole_GoodUser_Result should have property result', () => {
      expect( update_BadRole_GoodUser_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_BadRole_GoodUser_Result should be an Object', () => {
      expect( update_BadRole_GoodUser_Result ).to.be.a( 'Object' );
    });
    
    it( 'update_BadRole_GoodUser_Result msg should be a string', () => {
      expect( update_BadRole_GoodUser_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_BadRole_GoodUser_Result result should be a boolean', () => {
      expect( update_BadRole_GoodUser_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_BadRole_GoodUser_Result msg should have value of var badRoleMSG', () => {
      expect( update_BadRole_GoodUser_Result.msg ).to.equal( badRoleMSG );
    });

    it( 'update_BadRole_GoodUser_Result result should have value of false', () => {
      expect( update_BadRole_GoodUser_Result.result ).to.equal( false );
    });
  
  });

  describe( 'Add Good Role to Bad Account', () => {
    let update_GoodRole_BadUser_Result;

    function updateRole( next ) {
      accountModel.Update.role( badUID, roles[0], ( result ) => {
        update_GoodRole_BadUser_Result = result;
        next();
      });
    }
  
    before( ( done ) => {
      updateRole( done );
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_GoodRole_BadUser_Result should NOT have property error', () => {
      expect( update_GoodRole_BadUser_Result ).to.not.have.property( 'error' );
    });

    it( 'update_GoodRole_BadUser_Result should have property msg', () => {
      expect( update_GoodRole_BadUser_Result ).to.have.property( 'msg' );
    });

    it( 'update_GoodRole_BadUser_Result should have property result', () => {
      expect( update_GoodRole_BadUser_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_GoodRole_BadUser_Result should be an Object', () => {
      expect( update_GoodRole_BadUser_Result ).to.be.a( 'Object' );
    });
    
    it( 'update_GoodRole_BadUser_Result msg should be a string', () => {
      expect( update_GoodRole_BadUser_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_GoodRole_BadUser_Result result should be a boolean', () => {
      expect( update_GoodRole_BadUser_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_GoodRole_BadUser_Result result should have value of false', () => {
      expect( update_GoodRole_BadUser_Result.result ).to.equal( false );
    });
  });

});

describe( 'Account Model Read rolesById', () => {

  describe( 'Read populated Roles with Good UID', () => {
    let read_pop_RolesResult;

    function read_pop_RolesByID( next ) {
      accountModel.Read.rolesById( testAccountUID, ( result ) => {
        read_pop_RolesResult = result;
        next();
      });
    }

    before( ( done ) => {
      read_pop_RolesByID( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'read_pop_RolesResult should NOT have property error', () => {
      expect( read_pop_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_pop_RolesResult should NOT have property msg', () => {
      expect( read_pop_RolesResult ).to.not.have.property( 'msg' );
    });

    it( 'read_pop_RolesResult should have property result', () => {
      expect( read_pop_RolesResult ).to.have.property( 'result' );
    });

    it( 'read_pop_RolesResult should have property data', () => {
      expect( read_pop_RolesResult ).to.have.property( 'data' );
    });

    // Property Type
    it( 'read_pop_RolesResult should be an Object', () => {
      expect( read_pop_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_pop_RolesResult data should be an array', () => {
      expect( read_pop_RolesResult.data ).to.be.a( 'array' );
    });

    it( 'read_pop_RolesResult result should be a boolean', () => {
      expect( read_pop_RolesResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_pop_RolesResult result should have of true', () => {
      expect( read_pop_RolesResult.result ).to.equal( true );
    });

  });

  describe( 'Read empty Roles with Good UID', () => {
    let read_empty_RolesResult;

    function read_empty_RolesByID( next ) {
      accountModel.Read.rolesById( testAccount2UID, ( result ) => {
        read_empty_RolesResult = result;
        next();
      });
    }

    before( ( done ) => {
      read_empty_RolesByID( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'read_empty_RolesResult should NOT have property error', () => {
        expect( read_empty_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_empty_RolesResult should NOT have property msg', () => {
        expect( read_empty_RolesResult ).to.not.have.property( 'msg' );
    });

    it( 'read_empty_RolesResult should have property result', () => {
        expect( read_empty_RolesResult ).to.have.property( 'result' );
    });

    it( 'read_empty_RolesResult should have property data', () => {
        expect( read_empty_RolesResult ).to.have.property( 'data' );
    });

    // Property Type
    it( 'read_empty_RolesResult should be an Object', () => {
      expect( read_empty_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_empty_RolesResult data should be a array', () => {
        expect( read_empty_RolesResult.data ).to.be.a( 'array' );
    });

    it( 'read_empty_RolesResult result should be a boolean', () => {
      expect( read_empty_RolesResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_empty_RolesResult result should have of true', () => {
        expect( read_empty_RolesResult.result ).to.equal( true );
    });

  });

  describe( 'Read Roles with Bad UID', () => {
    let read_bad_RolesResult;

    function readRolesByID( next ) {
      accountModel.Read.rolesById( badUID, ( result ) => {
        read_bad_RolesResult = result;
        next();
      });
    }

    before( ( done ) => {
      readRolesByID( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'read_bad_RolesResult should NOT have property data', () => {
      expect( read_bad_RolesResult ).to.not.have.property( 'data' );
    });

    it( 'read_bad_RolesResult should NOT have property error', () => {
        expect( read_bad_RolesResult ).to.not.have.property( 'error' );
    });

    it( 'read_bad_RolesResult should have property msg', () => {
        expect( read_bad_RolesResult ).to.have.property( 'msg' );
    });

    it( 'read_bad_RolesResult should have property result', () => {
        expect( read_bad_RolesResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'read_bad_RolesResult should be an Object', () => {
      expect( read_bad_RolesResult ).to.be.a( 'Object' );
    });

    it( 'read_bad_RolesResult msg should be a string', () => {
      expect( read_bad_RolesResult.msg ).to.be.a( 'string' );
    });

    it( 'read_bad_RolesResult result should be a boolean', () => {
      expect( read_bad_RolesResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'read_bad_RolesResult result should have value of false', () => {
        expect( read_bad_RolesResult.result ).to.equal( false );
    });

  });

});

describe( 'Account Model Read isInRole', () => {

  describe( 'Read empty isInRole with Good UID and Wrong Role', () => {

    let empty_isInRoleResult;

    function get_empty_IsInRole( next ) {
      accountModel.Read.isInRole( testAccount2UID, roles[0], ( result ) => {
        empty_isInRoleResult = result;
        next();
      });
    }

    before( ( done ) => {
      get_empty_IsInRole( done );
    });

    after( ( done ) => done() );

    // Property Exists
    it( 'empty_isInRoleResult should NOT have property error', () => {
      expect( empty_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'empty_isInRoleResult should NOT have property msg', () => {
      expect( empty_isInRoleResult ).to.not.have.property( 'msg' );
    });

    it( 'empty_isInRoleResult should have property result', () => {
      expect( empty_isInRoleResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'empty_isInRoleResult should be an Object', () => {
      expect( empty_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'empty_isInRoleResult result should be a boolean', () => {
      expect( empty_isInRoleResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'empty_isInRoleResult result should have value of false', () => {
      expect( empty_isInRoleResult.result ).to.equal( false );
    });

  });

  describe( 'Read populated isInRole with Good UID and Good Role', () => {
    let populated_isInRoleResult;

    function get_populated_IsInRole( next ) {
      accountModel.Read.isInRole( testAccountUID, roles[0], ( result ) => {
        populated_isInRoleResult = result;
        next();
      });
    }

    before( ( done ) => {
      get_populated_IsInRole( done );
    });

    after( ( done ) => done() );

    // Property Exists
    it( 'populated_isInRoleResult should NOT have property error', () => {
      expect( populated_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'populated_isInRoleResult should NOT have property msg', () => {
      expect( populated_isInRoleResult ).to.not.have.property( 'msg' );
    });

    it( 'populated_isInRoleResult should have property result', () => {
      expect( populated_isInRoleResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'populated_isInRoleResult should be an Object', () => {
      expect( populated_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'populated_isInRoleResult result should be a boolean', () => {
      expect( populated_isInRoleResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'populated_isInRoleResult result should have value of true', () => {
      expect( populated_isInRoleResult.result ).to.equal( true );
    });

  });

  describe( 'Read isInRole with Bad UID', () => {

    let bad_isInRoleResult;
    const bad_isInRoleMSG = 'Account not found.';
    function get_bad_IsInRole( next ) {
      accountModel.Read.isInRole( badUID, roles[0], ( result ) => {
        bad_isInRoleResult = result;
        next();
      });
    }

    before( ( done ) => {
      get_bad_IsInRole( done );
    });

    after( ( done ) => {
      done();
    });

    // Property Exists
    it( 'bad_isInRoleResult should NOT have property error', () => {
      expect( bad_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'bad_isInRoleResult should have property msg', () => {
      expect( bad_isInRoleResult ).to.have.property( 'msg' );
    });

    it( 'bad_isInRoleResult should have property result', () => {
      expect( bad_isInRoleResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'bad_isInRoleResult should be an Object', () => {
      expect( bad_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'bad_isInRoleResult msg should be a string', () => {
      expect( bad_isInRoleResult.msg ).to.be.a( 'string' );
    });

    it( 'bad_isInRoleResult result should be a string', () => {
      expect( bad_isInRoleResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'bad_isInRoleResult msg should have value var errMsg.accountNotFound', () => {
      expect( bad_isInRoleResult.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'bad_isInRoleResult result should have value of false', () => {
        expect( bad_isInRoleResult.result ).to.equal( false );
    });

  });

  describe( 'Read empty isInRole with Good UID and Bad Role', () => {

    let empty_badRole_isInRoleResult;

    function get_empty_IsInRole( next ) {
      accountModel.Read.isInRole( testAccount2UID, badRole, ( result ) => {
        empty_badRole_isInRoleResult = result;
        next();
      });
    }

    before( ( done ) => {
      get_empty_IsInRole( done );
    });

    after( ( done ) => done() );

    // Property Exists
    it( 'empty_badRole_isInRoleResult should NOT have property error', () => {
      expect( empty_badRole_isInRoleResult ).to.not.have.property( 'error' );
    });

    it( 'empty_badRole_isInRoleResult should have property msg', () => {
      expect( empty_badRole_isInRoleResult ).to.have.property( 'msg' );
    });

    it( 'empty_badRole_isInRoleResult should have property result', () => {
      expect( empty_badRole_isInRoleResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'empty_badRole_isInRoleResult should be an Object', () => {
      expect( empty_badRole_isInRoleResult ).to.be.a( 'Object' );
    });

    it( 'empty_badRole_isInRoleResult msg should be a string', () => {
      expect( empty_badRole_isInRoleResult.msg ).to.be.a( 'string' );
    });

    it( 'empty_badRole_isInRoleResult result should be a boolean', () => {
      expect( empty_badRole_isInRoleResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'empty_badRole_isInRoleResult msg should have value of errMsg.roleInvalid', () => {
      expect( empty_badRole_isInRoleResult.msg ).to.equal( errMsg.roleInvalid );
    });

    it( 'empty_badRole_isInRoleResult result should have value of false', () => {
      expect( empty_badRole_isInRoleResult.result ).to.equal( false );
    });

  });

});

describe( 'Update email', () => {

  describe( 'Update with a good email', () => {
    let update_email_Result;
    const email = "harvey@someothersite.com";

    function updateAccount( next ) {
      accountModel.Update.email( testAccountUID, email, ( result ) => {
        update_email_Result = result;
        if(result.msg){
          console.log( 'msg' );
          console.log( result.msg);
        } 
        next();
      });
  
    }
  
    before( ( done ) => {
  
      updateAccount( done );
  
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_email_Result should NOT have property error', () => {
      expect( update_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_email_Result should NOT have property msg', () => {
      expect( update_email_Result ).to.not.have.property( 'msg' );
    });

    it( 'update_email_Result should have property result', () => {
      expect( update_email_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_email_Result should be an Object', () => {
      expect( update_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_email_Result result should be a boolean', () => {
      expect( update_email_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_email_Result result should have value of true', () => {
      expect( update_email_Result.result ).to.equal( true );
    });

  });

  describe( 'Update with a bad email', () => {
    let update_bad_email_Result;
    const email = "bob@somesitecom";

    function updateAccount( next ) {
      accountModel.Update.email( testAccountUID, email, ( result ) => {
        update_bad_email_Result = result;
        next();
      });
  
    }
  
    before( ( done ) => {
  
      updateAccount( done );
  
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_bad_email_Result should NOT have property error', () => {
      expect( update_bad_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_bad_email_Result should have property msg', () => {
      expect( update_bad_email_Result ).to.have.property( 'msg' );
    });

    it( 'update_bad_email_Result should have property result', () => {
      expect( update_bad_email_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_bad_email_Result should be an Object', () => {
      expect( update_bad_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_bad_email_Result msg should be a string', () => {
      expect( update_bad_email_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_bad_email_Result result should be a boolean', () => {
      expect( update_bad_email_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_bad_email_Result msg should have value of errMsg.emailInvalid', () => {
      expect( update_bad_email_Result.msg ).to.equal( errMsg.emailInvalid );
    });

    it( 'update_bad_email_Result result should have value of false', () => {
      expect( update_bad_email_Result.result ).to.equal( false );
    });

  });

  describe( 'update using bad uid', () => {
    let update_badUid_email_Result;
    const email = "b.smith@somesite.com";

    function updateAccount( next ) {
      accountModel.Update.email( badUID, email, ( result ) => {
        update_badUid_email_Result = result;
        next();
      });
  
    }
  
    before( ( done ) => {
  
      updateAccount( done );
  
    });
  
    after( done => done() );

    // Property Exists
    it( 'update_badUid_email_Result should NOT have property error', () => {
      expect( update_badUid_email_Result ).to.not.have.property( 'error' );
    });

    it( 'update_badUid_email_Result should have property msg', () => {
      expect( update_badUid_email_Result ).to.have.property( 'msg' );
    });

    it( 'update_badUid_email_Result should have property result', () => {
      expect( update_badUid_email_Result ).to.have.property( 'result' );
    });

    // Property Type
    it( 'update_badUid_email_Result should be an Object', () => {
      expect( update_badUid_email_Result ).to.be.a( 'Object' );
    });

    it( 'update_badUid_email_Result msg should be a string', () => {
      expect( update_badUid_email_Result.msg ).to.be.a( 'string' );
    });

    it( 'update_badUid_email_Result result should be a boolean', () => {
      expect( update_badUid_email_Result.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'update_badUid_email_Result msg should have value of errMsg.accountNotFound', () => {
      expect( update_badUid_email_Result.msg ).to.equal( errMsg.accountNotFound );
    });

    it( 'update_badUid_email_Result result should have value of false', () => {
      expect( update_badUid_email_Result.result ).to.equal( false );
    });

  });

});

describe( 'Update password', () => {

  describe( 'Update using a new password that is good', () => {

    let goodPasswordResult;

    const goodPassword = 'nm%o&z8Afy*m';

    function updateAccountPassword( next ) {
      accountModel.Update.password( testAccountUID, password, goodPassword, ( result ) => {
        goodPasswordResult = result;
        if( result.msg ) console.log( result.msg );
        next();
      });
    }

    before( ( done ) => {
      updateAccountPassword( done );
    });

    after( done => done() );

    // Property Exists
    it( 'goodPasswordResult should NOT have property error', () => {
      expect( goodPasswordResult ).to.not.have.property( 'error' );
    });

    it( 'goodPasswordResult should NOT have property msg', () => {
      expect( goodPasswordResult ).to.not.have.property( 'msg' );
    });

    it( 'goodPasswordResult should have property result', () => {
      expect( goodPasswordResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'goodPasswordResult should be an Object', () => {
      expect( goodPasswordResult ).to.be.a( 'Object' );
    });

    it( 'goodPasswordResult result should be a boolean', () => {
      expect( goodPasswordResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
     it( 'goodPasswordResult result should have value of true', () => {
      expect( goodPasswordResult.result ).to.equal( true );
    });
    
  
  });

  describe( 'Update using a new password that is too short', () => {

    let badPasswordResult;

    const badPassword = 'nm%o&z';

    function updateAccount( next ) {
      accountModel.Update.password( testAccount2UID, password2, badPassword, ( result ) => {
        badPasswordResult = result;
        next();
      });
    }

    before( ( done ) => {
      updateAccount( done );
    });

    after( done => done() );

    // Property Exists
    it( 'badPasswordResult should NOT have property error', () => {
      expect( badPasswordResult ).to.not.have.property( 'error' );
    });

    it( 'badPasswordResult should have property msg', () => {
      expect( badPasswordResult ).to.have.property( 'msg' );
    });

    it( 'badPasswordResult should have property result', () => {
      expect( badPasswordResult ).to.have.property( 'result' );
    });

    // Property Type
    it( 'badPasswordResult should be an Object', () => {
      expect( badPasswordResult ).to.be.a( 'Object' );
    });

    it( 'badPasswordResult msg should be a string', () => {
      expect( badPasswordResult.msg ).to.be.a( 'string' );
    });

    it( 'badPasswordResult result should be a boolean', () => {
      expect( badPasswordResult.result ).to.be.a( 'boolean' );
    });

    // Return Value
    it( 'badPasswordResult msg should have value of errMsg.passwordTooShort', () => {
      expect( badPasswordResult.msg ).to.equal( errMsg.passwordTooShort );
    });

    it( 'badPasswordResult result should have value of false', () => {
      expect( badPasswordResult.result ).to.equal( false );
    });
    
  });

});

describe( 'generate a secret for 2a', () => {

  let generatedSecret;

  function getSecret( next ) {
    generatedSecret = accountModel.Read.generateSecret();
    next();
  }

  before( ( done ) => getSecret( done ) );

  after( done => done() );

  // Property Exists
  it( 'generatedSecret should have property ascii', () => {
    expect( generatedSecret ).to.have.property( 'ascii' );
  });

  it( 'generatedSecret should have property hex', () => {
    expect( generatedSecret ).to.have.property( 'hex' );
  });

  it( 'generatedSecret should have property base32', () => {
    expect( generatedSecret ).to.have.property( 'base32' );
  });

  it( 'generatedSecret should have property otpauth_url', () => {
    expect( generatedSecret ).to.have.property( 'otpauth_url' );
  });

  // Property Type
  it( 'generatedSecret ascii should be an string', () => {
    expect( generatedSecret.ascii ).to.be.a( 'string' );
  });

  it( 'generatedSecret hex should be an string', () => {
    expect( generatedSecret.hex ).to.be.a( 'string' );
  });

  it( 'generatedSecret base32 should be an string', () => {
    expect( generatedSecret.base32 ).to.be.a( 'string' );
  });

  it( 'generatedSecret otpauth_url should be an string', () => {
    expect( generatedSecret.otpauth_url ).to.be.a( 'string' );
  });
    
});

describe( 'Get the recovery phrase.', () => {

  let recoveryPhrase;

  function getRecoveryPhrase( testAccountUID, next ) {

      next();

  }

  before( ( done ) => {
    done();
  });

  after( done => done() );

  // Property Type
  it( 'secretResult6Word should be a string', () => {
    expect( secretResult6Word ).to.be.a( 'string' );
  });

  // Return Value
  it( 'secretResult6Word should have 6 words.', () => {
    const wordCount = secretResult6Word.split(' ');
    expect( wordCount.length ).to.equal( 6 );
  });

});

describe('Update twoStep', () => {

  describe( 'Set twoA on with good id', () => {

    let twoAGoodIdResult;

    function updateTwoA( next ) {

      next();
    }

    before( ( done ) => {
      updateTwoA( done );
    });

    after( done => done() );

    // Property Exists
    it( 'twoAGoodIdResult should NOT have property error', () => {
      expect( twoAGoodIdResult ).to.not.have.property( 'error' );
    });

    it( 'twoAGoodIdResult should have property result', () => {
      expect( twoAGoodIdResult ).to.have.property( 'result' );
    });

    it( 'twoAGoodIdResult should have property recoveryPhrase', () => {
      expect( twoAGoodIdResult ).to.have.property( 'recoveryPhrase' );
    });

    // Property Type
  
    // Return Value
  
  });

});

describe('Delete account', () => {

  describe( '', () => {

    // Property Exists
  
    // Property Type
  
    // Return Value
  
  });

});
