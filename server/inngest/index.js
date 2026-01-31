
const { Prisma } = require("@prisma/client");
const { Inngest } = require("inngest");

// Create a client to send and receive events
const inngest = new Inngest({ id: "project-management" });

// Inngest functions to SAVE USER DATA to a database, send notifications, etc.
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async ({event})=>{
        const {data} = event
        await Prisma.user.create({
            data:{
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Inngest functions to DELTE USER DATA to a database,
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-from-clerk'},
    {event: 'clerk/user.deleted'},
    async ({event})=>{
        const {data} = event
        await Prisma.user.delete({
            where:{
                id: data.id,
                
            }
        })
    }
)

// Inngest functions to UPDATE USER DATA to a database, send notifications, etc.
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async ({event})=>{
        const {data} = event
        await Prisma.user.update({
            where:{
                id:data.id,
            },
            data:{
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,
            }
        })
    }
)

// Create an empty array where we'll export future Inngest functions
const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation, 
];

module.exports = { inngest, functions };   