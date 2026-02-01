const { Inngest } = require("inngest");
const { PrismaClient } = require("@prisma/client");

// Initialize Prisma Client
const prisma = new PrismaClient(); 

// Create a client to send and receive events
const inngest = new Inngest({ id: "project-management" });

// CREATE user
const syncUserCreation = inngest.createFunction( 
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
        image: data?.image_url,
      },
    });
  }
);

// DELETE user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: {
        id: data.id,
      },
    });
  }
);

// UPDATE user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: {
        id: data.id,
      },
      data: {
        email: data?.email_addresses?.[0]?.email_address,
        name: `${data?.first_name ?? ""} ${data?.last_name ?? ""}`,
        image: data?.image_url,
      },
    });
  }
);

// ingest functions to save workshop data to a database
const syncWorkshopCreation = inngest.createFunction(
  
  {id: "sync-workshop-from-clerk"}, // function id
  {event: "clerk/workshop.created"}, // event to listen to
  async({event})=>{  // function to run when event is received
    const {data} = event; // for getting event data
    await prisma.workspace.create({  // create workspace in database
      data: {                        // data to save
        id: data.id,                  
        name: data?.name,
        slug: data?.slug,
        ownerId : data.created_by,
        image_url: data?.image_url,
      }
  });

      // add creator as admin member of workspace
      await prisma.workspaceMember.create({  // create workspace member in database
        data: {
          userId: data.created_by,
          workspaceId: data.id,
          role: 'ADMIN',
        }
      })
});

//inngest function to update workspace data in database
const syncWorkshopUpdation = inngest.createFunction(  // function to update workspace
  {id: 'update-workspace-from-clerk'}, // function id
  {event: 'clerk/organization.update'}, // event to listen to
  async({event}) =>{           // function to run when event is received
    const {data} = event;
    await prisma.workspace.update({ //  update workspace in database
      where:{          // condition to find workspace
        id:data.id
      },
      data:{            // data to update
        name: data?.name,
        slug: data?.slug,
        image_url: data?.image_url,
      }
    })
  }
)

//inngest function to delete workspace data from database
const syncWorkshopDeletion = inngest.createFunction(
  {id:'delete-workspace-from-clerk'},
  {event: 'clerk/organization.deleted'},
  async({ event }) => {
    await prisma.workspace.delete({
      where:{
        id:data.id,
      }
    })
  }
)

// inngest fuction to save workspace member data to a database

const syncWorkspaceMemberCreation = inngest.createFunction(
  {id:'create-workspace-member-from-clerk'},
  {event: 'clerk/orginzationInvitation.accepted'},
  async({event}) => {
    const {data} = event;
    await prisma.workspaceMember.create({
      data:{
        userId: data.user_id,
        workspaceId: data.organization_id,
        role:String(data.role_name).toLocaleUpperCase() ,

      }
    })
  }
)

module.exports = {
  inngest,
  functions: [
      syncUserCreation,
      syncUserDeletion,
      syncUserUpdation,

      syncWorkshopCreation,
      syncWorkshopUpdation,
      syncWorkshopDeletion,
      
      syncWorkspaceMemberCreation
    ],
};
