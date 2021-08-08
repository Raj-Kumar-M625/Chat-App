const users = []

//addUser, removeUser, getUser, getUsersInRooom 

const addUser = ({ id, username, room }) => {

    //validate data 
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //Clean the data 
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //check for extisting user 

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate user name 

    if (existingUser) {
        return {
            error: 'User name is already in use!'
        }
    }

    //store user 
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index != -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })

    if (index != -1) {
        return users[index]
    }
}

const getUsersInRooom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room == room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRooom
}