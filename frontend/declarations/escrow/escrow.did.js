export const idlFactory = ({ IDL }) => {
  const EscrowId = IDL.Nat;
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : IDL.Text });
  const ICP = IDL.Nat64;
  const EscrowCondition = IDL.Variant({
    'TimeDelay' : IDL.Int,
    'ManualApproval' : IDL.Principal,
    'MultiSig' : IDL.Vec(IDL.Principal),
    'External' : IDL.Text,
  });
  const CreateEscrowArgs = IDL.Record({
    'beneficiary' : IDL.Principal,
    'amount' : ICP,
    'expires_at' : IDL.Opt(IDL.Int),
    'condition' : EscrowCondition,
  });
  const Result_1 = IDL.Variant({ 'ok' : EscrowId, 'err' : IDL.Text });
  const EscrowStatus = IDL.Variant({
    'Active' : IDL.Null,
    'Cancelled' : IDL.Null,
    'Completed' : IDL.Null,
    'Expired' : IDL.Null,
  });
  const EscrowDetails = IDL.Record({
    'id' : EscrowId,
    'status' : EscrowStatus,
    'depositor' : IDL.Principal,
    'beneficiary' : IDL.Principal,
    'created_at' : IDL.Int,
    'amount' : ICP,
    'expires_at' : IDL.Opt(IDL.Int),
    'approvals' : IDL.Vec(IDL.Principal),
    'condition' : EscrowCondition,
  });
  return IDL.Service({
    'approveRelease' : IDL.Func([EscrowId], [Result], []),
    'cancelEscrow' : IDL.Func([EscrowId], [Result], []),
    'cleanupExpiredEscrows' : IDL.Func([], [IDL.Nat], []),
    'createEscrow' : IDL.Func([CreateEscrowArgs], [Result_1], []),
    'getActiveEscrows' : IDL.Func([], [IDL.Vec(EscrowDetails)], ['query']),
    'getEscrow' : IDL.Func([EscrowId], [IDL.Opt(EscrowDetails)], ['query']),
    'getEscrowsForPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(EscrowDetails)],
        ['query'],
      ),
    'getTotalHeld' : IDL.Func([], [ICP], ['query']),
    'releaseTimedEscrow' : IDL.Func([EscrowId], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
