import jwt from "jsonwebtoken";

const getUser = (token: string | undefined) => {
  if (!token) return null;
  const parsedToken = token.split(" ")[1];
  try {
    const decodedToken = jwt.verify(parsedToken, process.env.SECRET!) as {
      userId: string;
    };
    return decodedToken.userId;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getUser;
