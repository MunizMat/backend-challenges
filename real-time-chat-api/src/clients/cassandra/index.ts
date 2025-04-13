/* -------------- External ----------------- */
import { Client } from 'cassandra-driver';
import { config } from 'dotenv';

config();

export const cassandraClient = new Client({
  contactPoints: ['localhost:9042'],
  localDataCenter: 'datacenter1',
  keyspace: 'chat_api',
});
