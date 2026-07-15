// Mock profile records, keyed by id, for coders and managers. Real profiles come
// from the persistence layer in a later assignment — these let the profile
// endpoints return realistic data now. Shape mirrors the coders-app profile
// (first_name / last_name / about / rank / avatar_url).

export const coderProfiles = {
  1: {
    id: 1,
    role: "coder",
    first_name: "Omar",
    last_name: "Moukhfi",
    about: "Full-stack learner working through the CLA bootcamp challenges.",
    rank: 12,
    avatar_url: "",
  },
  2: {
    id: 2,
    role: "coder",
    first_name: "Alice",
    last_name: "Smith",
    about: "Enjoys graph problems and clean recursion.",
    rank: 3,
    avatar_url: "",
  },
};

export const managerProfiles = {
  1: {
    id: 1,
    role: "manager",
    first_name: "Grace",
    last_name: "Hopper",
    about: "Curates the challenge catalogue and reviews submissions.",
    rank: null,
    avatar_url: "",
  },
};
