export const idlFactory = ({ IDL }) => {
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
  const Error = IDL.Variant({
    'EmailRequired' : IDL.Null,
    'RegistrationFailed' : IDL.Null,
    'InvalidUserType' : IDL.Null,
    'StorageError' : IDL.Text,
    'AuthenticationFailed' : IDL.Null,
    'InvalidSession' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Freelancer = IDL.Record({
    'country' : IDL.Text,
    'city' : IDL.Text,
    'name' : IDL.Text,
    'zipCode' : IDL.Text,
    'state' : IDL.Text,
    'photo' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Text,
    'skills' : IDL.Vec(IDL.Text),
    'streetAddress' : IDL.Text,
    'linkedinProfile' : IDL.Opt(IDL.Text),
  });
  const Result_5 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Client)),
    'err' : Error,
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Freelancer)),
    'err' : Error,
  });
  const Result_3 = IDL.Variant({ 'ok' : Client, 'err' : Error });
  const Result_2 = IDL.Variant({ 'ok' : Freelancer, 'err' : Error });
  const SessionInfo = IDL.Record({
    'userType' : IDL.Text,
    'expiresAt' : IDL.Int,
    'sessionId' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : SessionInfo, 'err' : Error });
  return IDL.Service({
    'createClientProfile' : IDL.Func([IDL.Text, Client], [Result_1], []),
    'createFreelancerProfile' : IDL.Func(
        [IDL.Text, Freelancer],
        [Result_1],
        [],
      ),
    'getActiveSessionCount' : IDL.Func([], [IDL.Nat], []),
    'getAllClients' : IDL.Func([IDL.Text], [Result_5], []),
    'getAllFreelancers' : IDL.Func([IDL.Text], [Result_4], []),
    'getClientProfile' : IDL.Func([IDL.Text], [Result_3], []),
    'getFreelancerProfile' : IDL.Func([IDL.Text], [Result_2], []),
    'getUserRole' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], []),
    'login' : IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
    'loginUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'logoutUser' : IDL.Func([IDL.Text], [Result_1], []),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'setUserRole' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'updateClientProfile' : IDL.Func([IDL.Text, Client], [Result_1], []),
    'updateFreelancerProfile' : IDL.Func(
        [IDL.Text, Freelancer],
        [Result_1],
        [],
      ),
    'validateUserSession' : IDL.Func([IDL.Text], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
