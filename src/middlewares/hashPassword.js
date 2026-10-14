import bcrypt from "bcrypt";

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
  } catch (error) {}
  return password;
};

export default hashPassword;
