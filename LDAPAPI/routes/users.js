import { Router } from 'express';
import runLDAPQuery from '../ldapClient.js'

const router = Router();

router.get('/', async (req, res, next) => {
  let results

  await runLDAPQuery(async (client) => {
    results = await client.search(
      'ou=users,dc=example,dc=org',
      {
        scope: 'one',
        filter: '(objectclass=*)'
      }
    );
  });

  res.json(results);
});

export default router;
