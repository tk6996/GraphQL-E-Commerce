import jwt from "jsonwebtoken";

const getUser = (token: string | undefined) => {
  if (!token) return null;
  const parsedToken = token.split(" ")[1];
  try {
    const decodedToken: any = jwt.verify(
      parsedToken,
      process.env.SECRET!
    );
    return decodedToken.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getUser;
