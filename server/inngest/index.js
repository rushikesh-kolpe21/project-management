const { Inngest } = require("inngest");
const { PrismaClient } = require("@prisma/client");

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

module.exports = {
  inngest,
  functions: [syncUserCreation, syncUserDeletion, syncUserUpdation],
};
