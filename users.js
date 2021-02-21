let users = [];

let addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  let existingUser = users.find(
    (user) => user.room === room && user.name === name
  );
  if (existingUser) {
    return {
      error: "Username is taken",
    };
  }
  let user = { id, name, room };
  users.push(user);
  return { user };
};
let removeUser = (id) => {
  let userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    return users.splice(userIndex, 1)[0];
  }
};
let getUser = (id) => {
  return users.find((user) => user.id === id);
};
let getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = { addUser, getUser, getUsersInRoom, removeUser };
