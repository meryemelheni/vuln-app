// ⚠️ TP10 : secrets FACTICES codés en dur, à détecter avec Gitleaks puis à retirer.
// Ces valeurs n'ouvrent aucun accès réel.
module.exports = {
  port: 3000,
  jwt_secret: process.env.JWT_SECRET,
  payment_api_key: process.env.PAYMENT_API_KEY,
  db_password: process.env.DB_PASSWORD,
};
