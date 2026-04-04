const generateUsername = (name, mobileno) => {
  // Remove spaces and special characters from name, convert to lowercase
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const cleanMobile = mobileno.replace(/\D/g, '');
  return `${cleanName}${cleanMobile}`;
};

module.exports = generateUsername;