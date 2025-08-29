export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'supersecretkeyforjwt',
  expiresIn: '1h',
};
