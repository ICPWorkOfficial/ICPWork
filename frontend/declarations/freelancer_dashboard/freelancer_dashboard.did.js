export const idlFactory = ({ IDL }) => {
  const ChargeDetails = IDL.Record({
    'description' : IDL.Text,
    'isEnabled' : IDL.Bool,
    'price' : IDL.Text,
  });
  const AdditionalCharges = IDL.Record({
    'additionalChanges' : IDL.Opt(ChargeDetails),
    'fastDelivery' : IDL.Opt(ChargeDetails),
    'perExtraChange' : IDL.Opt(ChargeDetails),
  });
  const PlanDetails = IDL.Record({
    'features' : IDL.Vec(IDL.Text),
    'description' : IDL.Text,
    'deliveryTime' : IDL.Text,
    'price' : IDL.Text,
  });
  const RequirementPlans = IDL.Record({
    'premium' : PlanDetails,
    'advanced' : PlanDetails,
    'basic' : PlanDetails,
  });
  const FreelancerProfile = IDL.Record({
    'subCategory' : IDL.Text,
    'additionalQuestions' : IDL.Vec(IDL.Text),
    'additionalCharges' : AdditionalCharges,
    'createdAt' : IDL.Int,
    'description' : IDL.Text,
    'isActive' : IDL.Bool,
    'email' : IDL.Text,
    'requirementPlans' : RequirementPlans,
    'updatedAt' : IDL.Int,
    'serviceTitle' : IDL.Text,
    'portfolioImages' : IDL.Vec(IDL.Text),
    'mainCategory' : IDL.Text,
  });
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'TooManyImages' : IDL.Null,
    'InvalidPlanData' : IDL.Null,
    'InvalidData' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidEmail' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : FreelancerProfile, 'err' : Error });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, FreelancerProfile)),
    'err' : Error,
  });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : Error });
  return IDL.Service({
    'activateProfile' : IDL.Func([IDL.Text], [Result], []),
    'createProfile' : IDL.Func([IDL.Text, FreelancerProfile], [Result], []),
    'deactivateProfile' : IDL.Func([IDL.Text], [Result], []),
    'deleteProfile' : IDL.Func([IDL.Text], [Result_4], []),
    'getActiveProfiles' : IDL.Func([], [Result_1], []),
    'getActiveProfilesCount' : IDL.Func([], [Result_3], []),
    'getAllProfiles' : IDL.Func([], [Result_1], []),
    'getProfile' : IDL.Func([IDL.Text], [Result], []),
    'getProfilesByCategory' : IDL.Func([IDL.Text], [Result_1], []),
    'getProfilesBySubCategory' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'getTotalProfiles' : IDL.Func([], [Result_3], []),
    'profileExists' : IDL.Func([IDL.Text], [Result_2], []),
    'searchProfilesByTitle' : IDL.Func([IDL.Text], [Result_1], []),
    'setMainCanister' : IDL.Func([], [], []),
    'updateProfile' : IDL.Func([IDL.Text, FreelancerProfile], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
