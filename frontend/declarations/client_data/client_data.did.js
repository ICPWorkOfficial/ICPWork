export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'InvalidData' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Client = IDL.Record({
    'numberOfEmployees' : IDL.Nat,
    'businessType' : IDL.Text,
    'description' : IDL.Text,
    'companyName' : IDL.Text,
    'companyWebsite' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Text,
    'lastName' : IDL.Text,
    'industry' : IDL.Text,
    'firstName' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'ok' : Client, 'err' : Error });
  return IDL.Service({
    'deleteClient' : IDL.Func([], [Result], []),
    'getAllClients' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, Client))],
        ['query'],
      ),
    'getClient' : IDL.Func([IDL.Principal], [Result_1], ['query']),
    'getMyProfile' : IDL.Func([], [Result_1], []),
    'storeClient' : IDL.Func([Client], [Result], []),
    'updateClient' : IDL.Func([Client], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
