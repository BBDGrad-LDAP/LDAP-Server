import { Client } from 'ldapts';

const client = new Client({
  url: process.env.URL,
  timeout: 0,
  connectTimeout: 0
});

const bindDN = 'cn=admin,dc=example,dc=org';

export default async callback => {
  try {
    await client.bind(bindDN, process.env.ADMIN_PASSWORD);
    await callback(client);
  } catch (ex) {
    throw ex;
  } finally {
    await client.unbind()
  }
}