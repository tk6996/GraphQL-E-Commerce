import OmiseFn, { Charges } from "omise";
import dotenv from "dotenv";
dotenv.config();

const omise = OmiseFn({
  publicKey: process.env.OMISE_PUBLIC_KEY!,
  secretKey: process.env.OMISE_SECRET_KEY!,
});

export const retrieveCustomer = (id: String | null) => {
  if (!id) return null;
  return new Promise<OmiseFn.Customers.ICustomer | null>((resolve, _reject) => {
    omise.customers.retrieve(id.toString(), function (_err, resp) {
      if (resp) resolve(resp);
      else resolve(null);
    });
  });
};

export const createCustomer = (
  card: string,
  email: string,
  description: string
) => {
  return new Promise<OmiseFn.Customers.ICustomer | null>((resolve, _reject) =>
    omise.customers.create({ card, email, description }, function (_err, resp) {
      if (resp) {
        resolve(resp);
      } else {
        resolve(null);
      }
    })
  );
};

export interface IChargesObject extends Charges.ICharge {
  authorize_uri?: string;
}

export const createChargeCredit = (
  amount: number,
  customer: string | undefined
) => {
  return new Promise<IChargesObject | null>((resolve, _reject) =>
    omise.charges.create({ amount, currency: "thb", customer }, function (
      _err,
      resp
    ) {
      if (resp) {
        resolve(resp);
      } else {
        resolve(null);
      }
    })
  );
};

export const createChargeInternetBanking = (
  amount: number,
  source: string | undefined,
  return_uri: string | undefined
) => {
  return new Promise<IChargesObject | null>((resolve, _reject) =>
    omise.charges.create(
      { amount, currency: "thb", source, return_uri },
      function (_err, resp) {
        if (resp) {
          resolve(resp);
        } else {
          resolve(null);
        }
      }
    )
  );
};
