export const idlFactory = ({ IDL }) => {
  const ProjectApplication = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Variant({
      'Rejected' : IDL.Null,
      'Accepted' : IDL.Null,
      'Pending' : IDL.Null,
    }),
    'createdAt' : IDL.Int,
    'bidAmount' : IDL.Text,
    'freelancerEmail' : IDL.Text,
    'projectId' : IDL.Text,
    'proposal' : IDL.Text,
    'whyFit' : IDL.Text,
    'estimatedTime' : IDL.Text,
  });
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'InvalidData' : IDL.Null,
    'ApplicationNotFound' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'InvalidEmail' : IDL.Null,
    'ProjectNotFound' : IDL.Null,
  });
  const Result_1 = IDL.Variant({ 'ok' : ProjectApplication, 'err' : Error });
  const ProjectStatus = IDL.Variant({
    'Open' : IDL.Null,
    'Cancelled' : IDL.Null,
    'InProgress' : IDL.Null,
    'Completed' : IDL.Null,
  });
  const Project = IDL.Record({
    'id' : IDL.Text,
    'status' : ProjectStatus,
    'title' : IDL.Text,
    'createdAt' : IDL.Int,
    'clientEmail' : IDL.Text,
    'description' : IDL.Text,
    'updatedAt' : IDL.Int,
    'category' : IDL.Text,
    'requirements' : IDL.Text,
    'applications' : IDL.Vec(IDL.Text),
    'budget' : IDL.Text,
    'skills' : IDL.Vec(IDL.Text),
    'timeline' : IDL.Text,
  });
  const Result = IDL.Variant({ 'ok' : Project, 'err' : Error });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result_2 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Text, Project)),
    'err' : Error,
  });
  const Result_4 = IDL.Variant({
    'ok' : IDL.Vec(ProjectApplication),
    'err' : Error,
  });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Record({
      'inProgressProjects' : IDL.Nat,
      'totalProjects' : IDL.Nat,
      'openProjects' : IDL.Nat,
      'completedProjects' : IDL.Nat,
      'totalApplications' : IDL.Nat,
    }),
    'err' : Error,
  });
  return IDL.Service({
    'applyToProject' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text],
        [Result_1],
        [],
      ),
    'createProject' : IDL.Func(
        [
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Text,
          IDL.Vec(IDL.Text),
          IDL.Text,
        ],
        [Result],
        [],
      ),
    'deleteProject' : IDL.Func([IDL.Text], [Result_5], []),
    'getAllProjects' : IDL.Func([], [Result_2], []),
    'getFreelancerApplications' : IDL.Func([IDL.Text], [Result_4], []),
    'getOpenProjects' : IDL.Func([], [Result_2], []),
    'getProject' : IDL.Func([IDL.Text], [Result], []),
    'getProjectApplications' : IDL.Func([IDL.Text], [Result_4], []),
    'getProjectStats' : IDL.Func([], [Result_3], []),
    'getProjectsByClient' : IDL.Func([IDL.Text], [Result_2], []),
    'updateApplicationStatus' : IDL.Func(
        [
          IDL.Text,
          IDL.Variant({ 'Rejected' : IDL.Null, 'Accepted' : IDL.Null }),
        ],
        [Result_1],
        [],
      ),
    'updateProjectStatus' : IDL.Func([IDL.Text, ProjectStatus], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
