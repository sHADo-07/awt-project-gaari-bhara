import { IRequest } from "@/common/interfaces/request.interface";
import { AuthUser } from "@/common/interfaces/auth-user.interface";

export const getCurrentUser = (req: IRequest) => {
  if (!req.user) return "You are not authenticated";

  const { id } = req.user as AuthUser;

  if (!id) return "Invalid token";

  return req.user;
};

/** Reads the token from the header  Authorization: Bearer <token> */
export const getBearerToken = (req: IRequest) => {
  const bearerToken = req.headers.authorization;
  return bearerToken?.split("Bearer ")[1] || bearerToken?.split(" ")[1];
};
