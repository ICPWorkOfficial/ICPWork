export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'InvalidData' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'AlreadyExists' : IDL.Null,
    'InvalidUserType' : IDL.Null,
    'InvalidEmail' : IDL.Null,
    'InvalidPassword' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const User = IDL.Record({
    'userType' : IDL.Text,
    'country' : IDL.Opt(IDL.Text),
    'numberOfEmployees' : IDL.Opt(IDL.Nat),
    'city' : IDL.Opt(IDL.Text),
    'userId' : IDL.Text,
    'createdAt' : IDL.Int,
    'businessType' : IDL.Opt(IDL.Text),
    'description' : IDL.Opt(IDL.Text),
    'email' : IDL.Text,
    'zipCode' : IDL.Opt(IDL.Text),
    'updatedAt' : IDL.Int,
    'state' : IDL.Opt(IDL.Text),
    'companyName' : IDL.Opt(IDL.Text),
    'companyWebsite' : IDL.Opt(IDL.Text),
    'passwordHash' : IDL.Vec(IDL.Nat8),
    'photo' : IDL.Opt(IDL.Text),
    'phoneNumber' : IDL.Opt(IDL.Text),
    'lastName' : IDL.Opt(IDL.Text),
    'skills' : IDL.Vec(IDL.Text),
    'streetAddress' : IDL.Opt(IDL.Text),
    'linkedinProfile' : IDL.Opt(IDL.Text),
    'industry' : IDL.Opt(IDL.Text),
    'firstName' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : User, 'err' : Error });
  return IDL.Service({
    'changePassword' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result_1], []),
    'deleteUser' : IDL.Func([IDL.Text], [Result_1], []),
    'getAllUsers' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, User))],
        ['query'],
      ),
    'getUser' : IDL.Func([IDL.Text], [Result], ['query']),
    'getUserById' : IDL.Func([IDL.Text], [Result], ['query']),
    'getUsersByType' : IDL.Func([IDL.Text], [IDL.Vec(User)], ['query']),
    'loginUser' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'registerUser' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [Result], []),
    'updateUserProfile' : IDL.Func(
        [
          IDL.Text,
          IDL.Record({
            'country' : IDL.Opt(IDL.Text),
            'numberOfEmployees' : IDL.Opt(IDL.Nat),
            'city' : IDL.Opt(IDL.Text),
            'businessType' : IDL.Opt(IDL.Text),
            'description' : IDL.Opt(IDL.Text),
            'zipCode' : IDL.Opt(IDL.Text),
            'state' : IDL.Opt(IDL.Text),
            'companyName' : IDL.Opt(IDL.Text),
            'companyWebsite' : IDL.Opt(IDL.Text),
            'photo' : IDL.Opt(IDL.Text),
            'phoneNumber' : IDL.Opt(IDL.Text),
            'lastName' : IDL.Opt(IDL.Text),
            'skills' : IDL.Vec(IDL.Text),
            'streetAddress' : IDL.Opt(IDL.Text),
            'linkedinProfile' : IDL.Opt(IDL.Text),
            'industry' : IDL.Opt(IDL.Text),
            'firstName' : IDL.Opt(IDL.Text),
          }),
        ],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
