import OmiseFn from "omise";
import dotenv from "dotenv";
dotenv.config();

const omise = OmiseFn({
  publicKey: String(process.env.OMISE_PUBLIC_KEY),
  secretKey: String(process.env.OMISE_SECRET_KEY),
});

export const retrieveCustomer = (id: String | null) => {
  if (!id) return null;
  return new Promise<OmiseFn.Customers.ICustomer | null>((resolve, reject) => {
    omise.customers.retrieve(id.toString(), function (err, resp) {
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
  return new Promise<OmiseFn.Customers.ICustomer | null>((resolve, reject) =>
    omise.customers.create({ card, email, description }, function (err, resp) {
      if (resp) {
        resolve(resp);
      } else {
        resolve(null);
      }
    })
  );
};

export const createChargeCredit = (
  amount: number,
  customer: string | undefined
) => {
  return new Promise<any>((resolve, reject) =>
    omise.charges.create({ amount, currency: "thb", customer }, function (
      err,
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
  return new Promise<any>((resolve, reject) =>
    omise.charges.create(
      { amount, currency: "thb", source, return_uri },
      function (err, resp) {
        if (resp) {
          resolve(resp);
        } else {
          resolve(null);
        }
      }
    )
  );
};
