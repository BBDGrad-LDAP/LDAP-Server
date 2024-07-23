const express = require("express");
const authRouter = express.Router();
const { OAuth2Client } = require('google-auth-library');
import runLDAPQuery from '../ldapClient.js'
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);

authRouter.get('/', (req, res) => {
    const redirectUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      redirect_uri: process.env.GOOGLE_REDIRECT_URI
    });
    res.redirect(redirectUrl);
});
  
authRouter.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
      const { tokens } = await client.getToken({
        code,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI
      });
      const idToken = tokens.id_token;
  
      // Verify the ID token we get
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      
      res.status(200).send(`Hello ${payload.email} id token: ${idToken}`);
    } catch (error) {
      res.status(400).send('Error while verifying ID token');
    }
});
  
//middleware to protect endpoints
const verifyTokenMiddleware =  (requiredRole) => {
    return async (req, res, next, role) => {
        const authHeader = req.headers.authorization;
      
        if (!authHeader) {
            return res.status(401).send('Authorization header missing');
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).send('Token missing');
        }
        
        try {
            const ticket = await client.verifyIdToken({
              idToken: token,
              audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            req.user = payload;
      
            const hasAccess = await checkUserRole(payload.email, requiredRole);
    
            if(!hasAccess){
                return res.status(403).send('Forbidden: insufficient role');
            }
    
            next();
        } catch (error) {
            res.status(401).send('Unauthorized');
        }
    }
    
};


async function checkUserRole(email, requiredRole){
    let results

    await runLDAPQuery(async (client) => {
        results = await client.search(
        'ou=users,dc=example,dc=org',
        {
            scope: 'one',
            filter: `(mail=${email})`, // Filter by email attribute
            attributes: ['role']
        }
        );
    });

    if (results > 0) {
        const userEntry = results[0];
        const role = userEntry.role; 
        
        if(role == requiredRole){
            return true;
        }else{
            //does not have the required role to access endpoint
            return false;
        }

    } else {
        return false; // if no user is found we just return false as they don't have access cause they don't exist 
    }
}

  module.exports = { authRouter, verifyTokenMiddleware };
