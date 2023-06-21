const users=[];

const addUser=({id,username,room})=>{

    //Cleaning the user
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    //Validating user
    if(!username || !room)
    return {
        error:'Username and room are required'
    }

    //Checking uniqueness
    const existingUser=users.find((user)=>{
        return user.username===username && user.room===room
    })

    if(existingUser){
        return {
            error:'User already exists in the room!'
        }
    }

    //add user
    const user={
        id,
        username,
        room
    }
    users.push(user)
    return {
        user
    }

}

const removeUser=(id)=>{
    const index=users.findIndex((user)=> user.id==id)
    
    if(index!=-1){
        return users.splice(index,1)[0];
    }
}



const getUser=(id)=>{
    const user=users.find((user)=>{
        return user.id===id;
    })

    if(!user)
    return {
        error:'User does not exist!'
    }

    return user;
}

const getUsersInRoom=(room)=>{
    const usersInRoom=users.filter((user)=>{
        return user.room===room;
    })
    
    return usersInRoom


}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}