const accountSchema = require('./../schema/account.schema');
const bcrypt = require('bcryptjs');
const couchbase = require('couchbase');
const db = require('./db');
const moment = require('moment');
const N1qlQuery = couchbase.N1qlQuery;
const speakeasy = require('speakeasy');
const uuidv4 = require('uuid/v4');
const QRCode = require('qrcode');
//const collection = db.collection(process.env.BUCKET);
// console.log(N1qlQuery);
const accountModel = {
    Create: {
        account: (account, next) => {
            if(!accountMethod.disallowedName(account.username)){
                accountMethod.duplicateName(account.username, (duplicate) => {
                    if(!duplicate){
                        account._id = uuidv4();
                        const validatedAccount = accountSchema.account(account);
                        db.insert('account|'+validatedAccount._id,validatedAccount, (e,r,m) => {
                            if(e){
                                console.log('Error insert account.');
                                console.log(e);
                                next({ "msg": "An error occured. Account not created."});
                            } else {
                                console.log('result');
                                console.log(r);
                                next( validatedAccount );
                            }
                        });
                    }else{
                        next({ "msg": "Username already in use."});
                    }
                });
            }else{
                next({ "msg": "Username is not allowed."});
            }
        }
    },
    Read: {
        accountById: (uid) => {

        },
        accountByUsername: (username) => {

        },
        all: () => {

        },
        rolesById: (uid) => {

        },
        isInRole: (uid,role) => {

        },
        validateAccount: async (account) => {
            if (account.isModified('password')){
                account.password = await bcrypt.hash(account.password, 8);
            }
            next();
        }
    },
    Update: {
        account: () => {

        },
        password: () => {

        },
        role: () => {

        },
        token: async (account, ips) => {
            const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, '7 days' );
        
            // add token to account with their current ip.
            // add a forwarded IP to check if user has a proxy.
            account.tokens = account.tokens.concat({
                token: token,
                ips: {
                    ip:ips.ip,
                    fwdIP: ips.fwdIP
                }
            });
        
            await collection.Update({_id: account._id},account);
        
            return token;
        },
        twoStep: () => {

        }
    },
    Delete: {
        account: () => {

        }
    }
};
const accountMethod = {
    duplicateName: (username, next) => {
        const q = N1qlQuery.fromString('SELECT * FROM '+process.env.BUCKET+' WHERE username=$1');
        db.query(q, [username], (e, r) => {
            if(e){
                console.log('error in accountMethod.duplicateName')
                console.log(e);
                next(true);
            }else{
                next( (r.length > 0) );
            }
        });
    },
    disallowedName: (username) => {
        const nameList =[
            "admin",
            "administrater",
            "username"
        ];
        return (nameList.indexOf(username) > -1);
    }
}
module.exports = accountModel;