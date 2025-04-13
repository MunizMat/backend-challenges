import { cassandraClient } from '@/clients/cassandra';
import { User } from '../..';

export const findByEmail = async (
  email: string,
): Promise<User.Model | null> => {
  const fields = [
    'id',
    'name',
    'email',
    'password',
    'status',
    'createdAt',
    'updatedAt',
  ];

  const { rows } = await cassandraClient.execute(
    `SELECT ${fields.join(', ')} FROM users WHERE email = ?`,
    [email],
  );

  const [row] = rows;

  if (!row) return null;

  const user = row.values().reduce(
    (obj, value, index) => ({
      ...obj,
      [fields[index]]: fields[index] === 'id' ? value.toString() : value,
    }),
    {},
  );

  return user as User.Model;
};
