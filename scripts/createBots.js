const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const bots = [
    {
      name: "fanbetz-alpha",
      email: "alpha@fanbetz.com",
      isCreator: true,
      isBot: true,
      isOfficialModel: true,
      botType: "alpha",
      bio: "Official FanBetz system focused on value-based picks.",
    },
    {
      name: "fanbetz-fade",
      email: "fade@fanbetz.com",
      isCreator: true,
      isBot: true,
      isOfficialModel: true,
      botType: "fade",
      bio: "Official FanBetz system focused on fading public bets.",
    },
    {
      name: "fanbetz-momentum",
      email: "momentum@fanbetz.com",
      isCreator: true,
      isBot: true,
      isOfficialModel: true,
      botType: "momentum",
      bio: "Official FanBetz system focused on momentum and trends.",
    },
    {
      name: "fanbetz-underdog",
      email: "underdog@fanbetz.com",
      isCreator: true,
      isBot: true,
      isOfficialModel: true,
      botType: "underdog",
      bio: "Official FanBetz system focused on underdog plays.",
    },
    {
      name: "fanbetz-ai-core",
      email: "aicore@fanbetz.com",
      isCreator: true,
      isBot: true,
      isOfficialModel: true,
      botType: "ai-core",
      bio: "Official FanBetz AI model-driven picks.",
    },
  ];

  for (const bot of bots) {
    await prisma.user.upsert({
      where: { email: bot.email },
      update: bot,
      create: bot,
    });
  }

  console.log("✅ Bot users created!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });