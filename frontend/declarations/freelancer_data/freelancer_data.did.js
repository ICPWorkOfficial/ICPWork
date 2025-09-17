export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'InvalidSkillsCount' : IDL.Null,
    'NotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidEmail' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : Error });
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
  const Result_3 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Freelancer)),
    'err' : Error,
  });
  const Result_2 = IDL.Variant({ 'ok' : Freelancer, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  return IDL.Service({
    'deleteFreelancer' : IDL.Func([IDL.Text], [Result], []),
    'freelancerExists' : IDL.Func([IDL.Text], [Result_4], []),
    'getAllFreelancers' : IDL.Func([], [Result_3], []),
    'getFreelancer' : IDL.Func([IDL.Text], [Result_2], []),
    'getTotalFreelancers' : IDL.Func([], [Result_1], []),
    'storeFreelancer' : IDL.Func([IDL.Text, Freelancer], [Result], []),
    'updateFreelancer' : IDL.Func([IDL.Text, Freelancer], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
