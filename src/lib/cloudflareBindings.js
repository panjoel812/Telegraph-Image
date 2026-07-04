export function getImageDatabase(env = {}) {
  const database = env.DB || env.IMG;

  if (!database) {
    throw new Error('D1 database binding is not configured. Bind your database as DB or IMG.');
  }

  return database;
}

export function hasImageDatabase(env = {}) {
  return Boolean(env.DB || env.IMG);
}
