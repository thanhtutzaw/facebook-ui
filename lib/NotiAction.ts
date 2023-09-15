const accept_friend = {
  action: "accept",
  title: "Accept",
};
const delete_friend = {
  action: "delete",
  title: "Delete",
};
const view_profile = {
  action: "viewProfile",
  title: "View Profile",
};
export const NotiAction = {
  reply: {
    action: "reply",
    title: "Reply",
    type: "text",
    placeholder: "Reply Comment",
  },

  friend_request: [accept_friend, view_profile],
};
