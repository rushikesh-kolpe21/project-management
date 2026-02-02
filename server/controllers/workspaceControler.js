const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(); 

// get all workspaces for user
const getUserWorkspaces = async (req,res) => {
  try {
    const { userId } = req.params;
    const workspaces = await prisma.workspaces.findMany({
      where: {
        members: { some: { userId: userId } },
      },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: {
                  include: { user: true },
                },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });
    res.json(workspaces);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
};

// add member to workspace
const addMemberToWorkspace = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {email, role, workspaceId, message} = req.body;

        // check if user is owner of workspace
        const user = await prisma.user.findUnique({ where: {email}});

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        if(!workspaceId || !role){
            return res.status(400).json({error: "Workspace ID and role are required"});
        }
        if(role !== 'ADMIN' && role !== 'MEMBER'){
            return res.status(400).json({error: "Invalid role"});
        }

        // fetch workspace details to send invitation
        const workspace = await prisma.workspaces.findUnique({
            where: {id: workspaceId},
            include: {member: true}
        });

        // if workspace not found
        if(!workspace){
            return res.status(404).json({error: "Workspace not found"});
        }

        // check create has admin role
        if(!workspace.members.find(member => member.userId === userId && member.role === 'ADMIN')){
            return res.status(403).json({error: "you do not have permission to add members"});
        }

        //check if user is already a member
        const existingMember = workspace.members.find(member => member.userId === user.id);
        if(existingMember){
            return res.status(400).json({error: "User is already a member of the workspace"});
        }

        const member = await prisma.workspaceMembers.create({
          data:{
            userId: user.id,
            workspaceId,
            role,
            message
          }
        });

        res.json({message: "Member added successfully", member});
    
    } catch (error) {
     console.log(error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }

};

module.exports = { getUserWorkspaces, addMemberToWorkspace ,};
