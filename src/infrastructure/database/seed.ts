import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../domain/entities/User";
import { Ticket } from "../../domain/entities/Ticket";
import { Sprint } from "../../domain/entities/Sprint";
import { Comment } from "../../domain/entities/Comment";
import { Test } from "../../domain/entities/Test";
import { Image } from "../../domain/entities/Image";
import { TicketStatus } from "../../domain/enums/TicketStatus";
import { TicketType } from "../../domain/enums/TicketType";
import { ImageType } from "../../domain/enums/ImageType";

/**
 * Fichier de seed pour la base de données
 * Placez ce fichier dans: src/infrastructure/database/seed.ts
 * 
 * Puis dans app.ts, ajoutez après l'initialisation de la base de données:
 * 
 * import { seedDatabase } from './database/seed';
 * 
 * // Dans la fonction start(), après AppDataSource.initialize():
 * if (process.env.SEED_DATABASE === 'true') {
 *   await seedDatabase(AppDataSource);
 * }
 */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log("🌱 Starting database seeding...");

  const userRepo = dataSource.getRepository(User);
  const ticketRepo = dataSource.getRepository(Ticket);
  const sprintRepo = dataSource.getRepository(Sprint);
  const commentRepo = dataSource.getRepository(Comment);
  const testRepo = dataSource.getRepository(Test);
  const imageRepo = dataSource.getRepository(Image);

  // Check if data already exists
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log("⚠️  Database already contains data. Skipping seed.");
    return;
  }

  const SALT_ROUNDS = 10;

  try {
    // 1. Create Users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("Password123!", SALT_ROUNDS);

    const users = await userRepo.save([
      {
        firstName: "Alice",
        lastName: "Martin",
        email: "alice.martin@example.com",
        password: hashedPassword,
      },
      {
        firstName: "Bob",
        lastName: "Dupont",
        email: "bob.dupont@example.com",
        password: hashedPassword,
      },
      {
        firstName: "Claire",
        lastName: "Bernard",
        email: "claire.bernard@example.com",
        password: hashedPassword,
      },
      {
        firstName: "David",
        lastName: "Petit",
        email: "david.petit@example.com",
        password: hashedPassword,
      },
      {
        firstName: "Emma",
        lastName: "Robert",
        email: "emma.robert@example.com",
        password: hashedPassword,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // 2. Create Sprints
    console.log("🏃 Creating sprints...");
    const now = new Date();
    
    const sprint1Start = new Date(now);
    sprint1Start.setDate(now.getDate() - 14);
    const sprint1End = new Date(now);
    sprint1End.setDate(now.getDate() + 7);

    const sprint2Start = new Date(now);
    sprint2Start.setDate(now.getDate() + 8);
    const sprint2End = new Date(now);
    sprint2End.setDate(now.getDate() + 21);

    const sprint3Start = new Date(now);
    sprint3Start.setDate(now.getDate() - 28);
    const sprint3End = new Date(now);
    sprint3End.setDate(now.getDate() - 14);

    const sprints = await sprintRepo.save([
      {
        name: "Sprint 1 - Authentication & User Management",
        maxPoints: 50,
        startDate: sprint1Start,
        endDate: sprint1End,
      },
      {
        name: "Sprint 2 - Ticket System Core",
        maxPoints: 60,
        startDate: sprint2Start,
        endDate: sprint2End,
      },
      {
        name: "Sprint 0 - Project Setup (Completed)",
        maxPoints: 40,
        startDate: sprint3Start,
        endDate: sprint3End,
      },
    ]);

    console.log(`✅ Created ${sprints.length} sprints`);

    // 3. Create Tickets
    console.log("🎫 Creating tickets...");
    const tickets = await ticketRepo.save([
      // Sprint 1 tickets
      {
        key: "PROJ-001",
        title: "Implement user authentication",
        description: "Create JWT-based authentication system with login and registration endpoints. Include password hashing with bcrypt and token refresh mechanism.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: users[1],
        sprint: sprints[0],
      },
      {
        key: "PROJ-002",
        title: "Add password reset functionality",
        description: "Implement forgot password and reset password flow with email verification.",
        status: TicketStatus.IN_PROGRESS,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[2],
        sprint: sprints[0],
      },
      {
        key: "PROJ-003",
        title: "User profile management",
        description: "Allow users to view and edit their profile information including avatar upload.",
        status: TicketStatus.REVIEW,
        type: TicketType.FEATURE,
        difficultyPoints: 5,
        creator: users[1],
        assignee: users[3],
        sprint: sprints[0],
      },
      {
        key: "PROJ-004",
        title: "Fix authentication token expiration",
        description: "Token expires too quickly, causing users to be logged out frequently. Adjust expiration time and improve refresh logic.",
        status: TicketStatus.TEST,
        type: TicketType.BUG,
        difficultyPoints: 3,
        creator: users[2],
        assignee: users[1],
        sprint: sprints[0],
      },

      // Sprint 2 tickets
      {
        key: "PROJ-005",
        title: "Create ticket management API",
        description: "Implement CRUD operations for tickets with search and filter capabilities.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: users[4],
        sprint: sprints[1],
      },
      {
        key: "PROJ-006",
        title: "Add comment system for tickets",
        description: "Allow users to add, edit, and delete comments on tickets. Include mentions and notifications.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[1],
        assignee: users[2],
        sprint: sprints[1],
      },
      {
        key: "PROJ-007",
        title: "Implement ticket status workflow",
        description: "Create state machine for ticket status transitions with validation rules.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[3],
        sprint: sprints[1],
      },

      // Sprint 0 (completed)
      {
        key: "PROJ-008",
        title: "Setup project structure",
        description: "Initialize TypeScript project with Fastify, TypeORM, and PostgreSQL. Setup Docker configuration.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 5,
        creator: users[0],
        assignee: users[0],
        sprint: sprints[2],
      },
      {
        key: "PROJ-009",
        title: "Configure database schema",
        description: "Design and implement database entities and relationships.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[1],
        sprint: sprints[2],
      },
      {
        key: "PROJ-010",
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment pipeline.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[1],
        assignee: users[4],
        sprint: sprints[2],
      },

      // Backlog tickets (no sprint)
      {
        key: "PROJ-011",
        title: "Add dark mode support",
        description: "Implement dark mode theme for the application with user preference storage.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 5,
        creator: users[3],
        assignee: null,
        sprint: null,
      },
      {
        key: "PROJ-012",
        title: "Optimize database queries",
        description: "Review and optimize slow database queries. Add indexes where needed.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 8,
        creator: users[1],
        assignee: null,
        sprint: null,
      },
      {
        key: "PROJ-013",
        title: "Add email notifications",
        description: "Send email notifications for important events (ticket assignments, mentions, etc.).",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[2],
        assignee: null,
        sprint: null,
      },
      {
        key: "PROJ-014",
        title: "Fix memory leak in websocket connections",
        description: "WebSocket connections are not being properly closed, causing memory leaks over time.",
        status: TicketStatus.TODO,
        type: TicketType.BUG,
        difficultyPoints: 5,
        creator: users[4],
        assignee: null,
        sprint: null,
      },
      {
        key: "PROJ-015",
        title: "Add sprint burndown charts",
        description: "Implement visual burndown charts to track sprint progress.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: null,
        sprint: null,
      },
    ]);

    console.log(`✅ Created ${tickets.length} tickets`);

    // 4. Create Comments
    console.log("💬 Creating comments...");
    const comments = await commentRepo.save([
      {
        description: "I've started working on this. Should have a first version by tomorrow.",
        user: users[1],
        ticket: tickets[0],
      },
      {
        description: "Great work! The authentication flow looks solid. Just a few minor suggestions on the code review.",
        user: users[0],
        ticket: tickets[0],
      },
      {
        description: "I'm having some issues with the email service integration. @Alice can you help?",
        user: users[2],
        ticket: tickets[1],
      },
      {
        description: "Sure! Let's schedule a quick call this afternoon to debug it together.",
        user: users[0],
        ticket: tickets[1],
      },
      {
        description: "The avatar upload is working but we need to add image size validation.",
        user: users[3],
        ticket: tickets[2],
      },
      {
        description: "Good catch! I'll add validation for max 5MB file size.",
        user: users[3],
        ticket: tickets[2],
      },
      {
        description: "This bug is affecting multiple users in production. High priority!",
        user: users[2],
        ticket: tickets[3],
      },
      {
        description: "On it! I've identified the issue and working on a fix now.",
        user: users[1],
        ticket: tickets[3],
      },
      {
        description: "Should we also add pagination to the ticket list endpoint?",
        user: users[4],
        ticket: tickets[4],
      },
      {
        description: "Yes, definitely! Let's add it with configurable page size.",
        user: users[0],
        ticket: tickets[4],
      },
    ]);

    console.log(`✅ Created ${comments.length} comments`);

    // 5. Create Tests
    console.log("🧪 Creating tests...");
    const tests = await testRepo.save([
      {
        description: "Tested login with valid credentials - works perfectly. Tested with invalid credentials - shows correct error message. Token refresh is working as expected.",
        isValidated: true,
        user: users[2],
        ticket: tickets[0],
      },
      {
        description: "Tested password reset flow end-to-end. Email is received correctly and reset link works. However, the email template could use some styling improvements.",
        isValidated: false,
        user: users[3],
        ticket: tickets[1],
      },
      {
        description: "Profile update is working. Avatar upload tested with various image formats (jpg, png, gif). All working correctly. Need to test edge cases with very large files.",
        isValidated: false,
        user: users[1],
        ticket: tickets[2],
      },
      {
        description: "Token expiration fix verified. Users are no longer being logged out prematurely. Refresh token flow is smooth. Ready for production deployment.",
        isValidated: true,
        user: users[0],
        ticket: tickets[3],
      },
      {
        description: "All project structure is in place. Docker containers running smoothly. Dependencies installed and configured correctly.",
        isValidated: true,
        user: users[1],
        ticket: tickets[7],
      },
      {
        description: "Database schema looks good. All relationships are properly configured. Migrations are working as expected.",
        isValidated: true,
        user: users[0],
        ticket: tickets[8],
      },
    ]);

    console.log(`✅ Created ${tests.length} tests`);

    // 6. Create some example images (metadata only, no actual files)
    console.log("🖼️  Creating image records...");
    const images = await imageRepo.save([
      {
        url: "/uploads/avatar-alice.jpg",
        filename: "avatar-alice.jpg",
        originalName: "profile.jpg",
        mimeType: "image/jpeg",
        size: 153600,
        displayOrder: 0,
        type: ImageType.AVATAR,
        user: users[0],
      },
      {
        url: "/uploads/avatar-bob.jpg",
        filename: "avatar-bob.jpg",
        originalName: "photo.jpg",
        mimeType: "image/jpeg",
        size: 204800,
        displayOrder: 0,
        type: ImageType.AVATAR,
        user: users[1],
      },
      {
        url: "/uploads/ticket-screenshot-1.png",
        filename: "ticket-screenshot-1.png",
        originalName: "bug-screenshot.png",
        mimeType: "image/png",
        size: 512000,
        displayOrder: 0,
        type: ImageType.TICKET_ATTACHMENT,
        ticket: tickets[3],
      },
      {
        url: "/uploads/test-result-1.png",
        filename: "test-result-1.png",
        originalName: "test-results.png",
        mimeType: "image/png",
        size: 384000,
        displayOrder: 0,
        type: ImageType.TEST_ATTACHMENT,
        test: tests[0],
      },
    ]);

    console.log(`✅ Created ${images.length} image records`);

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${users.length} users`);
    console.log(`   - ${sprints.length} sprints`);
    console.log(`   - ${tickets.length} tickets`);
    console.log(`   - ${comments.length} comments`);
    console.log(`   - ${tests.length} tests`);
    console.log(`   - ${images.length} images`);
    console.log("\n🔑 Login credentials for all users:");
    console.log("   Email: <any-user>@example.com");
    console.log("   Password: Password123!");
    console.log("\n   Example: alice.martin@example.com / Password123!\n");

  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}