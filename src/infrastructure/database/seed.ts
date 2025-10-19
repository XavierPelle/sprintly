import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../../domain/entities/User";
import { Ticket } from "../../domain/entities/Ticket";
import { Sprint } from "../../domain/entities/Sprint";
import { Comment } from "../../domain/entities/Comment";
import { Test } from "../../domain/entities/Test";
import { Tag } from "../../domain/entities/Tag";
import { TicketStatus } from "../../domain/enums/TicketStatus";
import { TicketType } from "../../domain/enums/TicketType";
import { TicketPriority } from "../../domain/enums/TicketPriority";

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
  const tagRepo = dataSource.getRepository(Tag);

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
        firstName: "Xavier",
        lastName: "Pelle",
        email: "xavier.pelle@repairsoft.fr",
        password: hashedPassword,
      },
      {
        firstName: "Maxime",
        lastName: "Dupont",
        email: "maxime.pyram@repairsoft.com",
        password: hashedPassword,
      },
      {
        firstName: "Matthew",
        lastName: "Vergely",
        email: "matthew.vergely.bernard@repairsoft.fr",
        password: hashedPassword,
      },
      {
        firstName: "Nathan",
        lastName: "Olive",
        email: "nathan.olive@repairsoft.fr",
        password: hashedPassword,
      },
      {
        firstName: "Louis",
        lastName: "Viogeat",
        email: "louis.viogeat@repairsoft.fr",
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
      // Sprint 1
      {
        key: "PROJ-001",
        title: "Implémenter l'authentification des utilisateurs",
        description: "Mettre en place un système d'authentification basé sur JWT avec endpoints d'inscription et de connexion. Inclure le hachage des mots de passe (bcrypt) et le mécanisme de rafraîchissement de token.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: users[1],
        priority: TicketPriority.CRITICAL,
        sprint: sprints[0],
        pullRequestLink: "https://github.com/repairsoft/project/pull/42",
        testLink: "https://test.repairsoft.fr/auth-tests",
        isBlocked: false,
      },
      {
        key: "PROJ-002",
        title: "Ajouter la réinitialisation de mot de passe",
        description: "Mettre en place un flux de récupération et réinitialisation du mot de passe avec vérification par email.",
        status: TicketStatus.IN_PROGRESS,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[2],
        priority: TicketPriority.HIGH,
        sprint: sprints[0],
        pullRequestLink: "https://github.com/repairsoft/project/pull/45",
        isBlocked: true,
        blockedReason: "En attente de la configuration du serveur SMTP pour l'envoi d'emails",
      },
      {
        key: "PROJ-003",
        title: "Gestion du profil utilisateur",
        description: "Permettre aux utilisateurs de consulter et modifier leurs informations personnelles, y compris le téléchargement d'avatar.",
        status: TicketStatus.REVIEW,
        type: TicketType.FEATURE,
        difficultyPoints: 5,
        creator: users[1],
        assignee: users[3],
        priority: TicketPriority.MEDIUM,
        sprint: sprints[0],
        pullRequestLink: "https://github.com/repairsoft/project/pull/48",
        isBlocked: false,
      },
      {
        key: "PROJ-004",
        title: "Corriger l'expiration prématurée des tokens",
        description: "Allonger la durée de vie des tokens et améliorer la logique de rafraîchissement afin d'éviter les déconnexions fréquentes.",
        status: TicketStatus.TEST,
        type: TicketType.BUG,
        difficultyPoints: 3,
        creator: users[2],
        assignee: users[1],
        priority: TicketPriority.CRITICAL,
        sprint: sprints[0],
        pullRequestLink: "https://github.com/repairsoft/project/pull/51",
        testLink: "https://test.repairsoft.fr/token-tests",
        isBlocked: false,
      },

      // Sprint 2
      {
        key: "PROJ-005",
        title: "Créer l'API de gestion des tickets",
        description: "Développer les opérations CRUD sur les tickets avec capacités de recherche et filtrage.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: users[4],
        priority: TicketPriority.CRITICAL,
        sprint: sprints[1],
        isBlocked: false,
      },
      {
        key: "PROJ-006",
        title: "Ajouter un système de commentaires aux tickets",
        description: "Permettre l'ajout, l'édition et la suppression de commentaires sur les tickets, avec mentions et notifications.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[1],
        assignee: users[2],
        priority: TicketPriority.HIGH,
        sprint: sprints[1],
        isBlocked: true,
        blockedReason: "Dépend de PROJ-005 - API de gestion des tickets",
      },
      {
        key: "PROJ-007",
        title: "Implémenter le workflow des statuts de tickets",
        description: "Définir une machine à états pour les transitions de statut avec règles de validation.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[3],
        priority: TicketPriority.HIGH,
        sprint: sprints[1],
        isBlocked: false,
      },

      // Sprint 0
      {
        key: "PROJ-008",
        title: "Mettre en place la structure du projet",
        description: "Initialiser le projet TypeScript avec Fastify, TypeORM et PostgreSQL. Ajouter la configuration Docker.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 5,
        creator: users[0],
        assignee: users[0],
        priority: TicketPriority.MEDIUM,
        sprint: sprints[2],
        pullRequestLink: "https://github.com/repairsoft/project/pull/1",
        testLink: "https://test.repairsoft.fr/setup-tests",
        isBlocked: false,
      },
      {
        key: "PROJ-009",
        title: "Configurer le schéma de base de données",
        description: "Concevoir et implémenter les entités et relations dans la base.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[0],
        assignee: users[1],
        priority: TicketPriority.HIGH,
        sprint: sprints[2],
        pullRequestLink: "https://github.com/repairsoft/project/pull/5",
        testLink: "https://test.repairsoft.fr/db-schema-tests",
        isBlocked: false,
      },
      {
        key: "PROJ-010",
        title: "Mettre en place la pipeline CI/CD",
        description: "Configurer les tests automatisés et le pipeline de déploiement.",
        status: TicketStatus.PRODUCTION,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[1],
        assignee: users[4],
        priority: TicketPriority.HIGH,
        sprint: sprints[2],
        pullRequestLink: "https://github.com/repairsoft/project/pull/12",
        isBlocked: false,
      },

      // Backlog
      {
        key: "PROJ-011",
        title: "Ajouter le mode sombre",
        description: "Créer un thème sombre pour l'application avec stockage de la préférence utilisateur.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 5,
        creator: users[3],
        assignee: null,
        priority: TicketPriority.MEDIUM,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-012",
        title: "Optimiser les requêtes SQL",
        description: "Analyser et améliorer les requêtes lentes. Ajouter des index appropriés.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 8,
        creator: users[1],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-013",
        title: "Ajouter les notifications par email",
        description: "Notifier les utilisateurs lors d'événements importants (assignation, mentions, etc.).",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[2],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: true,
        blockedReason: "En attente de la résolution de PROJ-002 pour la configuration email",
      },
      {
        key: "PROJ-014",
        title: "Corriger la fuite mémoire sur les websockets",
        description: "Les connexions WebSocket ne se ferment pas correctement, entraînant des fuites mémoire.",
        status: TicketStatus.TODO,
        type: TicketType.BUG,
        difficultyPoints: 5,
        creator: users[4],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-015",
        title: "Ajouter des graphiques burndown de sprint",
        description: "Afficher l'évolution des points restants dans un sprint sous forme de graphique.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[0],
        assignee: null,
        priority: TicketPriority.MEDIUM,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-016",
        title: "Améliorer l'accessibilité",
        description: "Respecter les normes WCAG pour rendre l'application accessible aux personnes en situation de handicap.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 8,
        creator: users[2],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-017",
        title: "Ajouter la 2FA (double authentification)",
        description: "Sécuriser la connexion avec un second facteur (email, SMS ou application).",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: true,
        blockedReason: "Nécessite l'intégration d'un service SMS (Twilio) - budget en attente",
      },
      {
        key: "PROJ-018",
        title: "Refactoriser le code legacy",
        description: "Réécrire les modules obsolètes pour améliorer la maintenabilité et la lisibilité.",
        status: TicketStatus.TODO,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[1],
        assignee: null,
        priority: TicketPriority.MEDIUM,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-019",
        title: "Mise en cache des requêtes API",
        description: "Ajouter un système de cache pour réduire la charge sur la base de données et accélérer les temps de réponse.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 8,
        creator: users[4],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-020",
        title: "Intégrer un tableau de bord administrateur",
        description: "Créer une interface permettant aux administrateurs de gérer les utilisateurs, tickets et sprints.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: true,
        blockedReason: "Dépend de PROJ-030 - système de rôles et permissions",
      },
      {
        key: "PROJ-021",
        title: "Exporter les données en CSV et PDF",
        description: "Permettre l'export des tickets, commentaires et rapports de tests en fichiers CSV ou PDF.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 5,
        creator: users[1],
        assignee: null,
        priority: TicketPriority.MEDIUM,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-022",
        title: "Configurer la surveillance applicative",
        description: "Mettre en place des outils de monitoring (logs, métriques, alertes) pour suivre la santé du système.",
        status: TicketStatus.TODO,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[3],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-023",
        title: "Optimiser le front-end pour mobile",
        description: "Adapter l'interface utilisateur pour une meilleure compatibilité mobile (responsive design).",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 8,
        creator: users[2],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-024",
        title: "Ajouter la recherche plein texte",
        description: "Permettre aux utilisateurs de rechercher des tickets par mots-clés avec un moteur de recherche performant.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[4],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-025",
        title: "Mise en place de tests unitaires",
        description: "Écrire une couverture de tests unitaires pour les services principaux afin de réduire les régressions.",
        status: TicketStatus.TODO,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[0],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-026",
        title: "Ajouter un système de notifications en temps réel",
        description: "Notifier en direct les utilisateurs via WebSocket lorsqu'un ticket ou un commentaire les concerne.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[1],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: true,
        blockedReason: "Bloqué par PROJ-014 - fuite mémoire websockets doit être corrigée d'abord",
      },
      {
        key: "PROJ-027",
        title: "Améliorer la sécurité des mots de passe",
        description: "Renforcer les règles de complexité des mots de passe et ajouter un indicateur de robustesse.",
        status: TicketStatus.TODO,
        type: TicketType.IMPROVEMENT,
        difficultyPoints: 5,
        creator: users[2],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-028",
        title: "Automatiser la sauvegarde de la base de données",
        description: "Planifier et stocker des sauvegardes régulières de la base avec restauration possible.",
        status: TicketStatus.TODO,
        type: TicketType.TASK,
        difficultyPoints: 8,
        creator: users[3],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-029",
        title: "Ajouter un tableau Kanban",
        description: "Permettre de visualiser l'avancement des tickets sous forme de tableau Kanban interactif.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 8,
        creator: users[4],
        assignee: null,
        priority: TicketPriority.HIGH,
        sprint: null,
        isBlocked: false,
      },
      {
        key: "PROJ-030",
        title: "Mettre en place un système de rôles et permissions",
        description: "Gérer des rôles utilisateurs (admin, membre, invité) avec permissions spécifiques.",
        status: TicketStatus.TODO,
        type: TicketType.FEATURE,
        difficultyPoints: 13,
        creator: users[0],
        assignee: null,
        priority: TicketPriority.CRITICAL,
        sprint: null,
        isBlocked: false,
      },
    ]);

    console.log(`✅ Created ${tickets.length} tickets`);

    // 4. Create Tags
    console.log("🏷️  Creating tags...");
    const tags = await tagRepo.save([
      // Tags for PROJ-001
      { content: "authentication", color: "#3B82F6", ticket: tickets[0] },
      { content: "security", color: "#EF4444", ticket: tickets[0] },
      { content: "backend", color: "#10B981", ticket: tickets[0] },
      
      // Tags for PROJ-002
      { content: "email", color: "#F59E0B", ticket: tickets[1] },
      { content: "security", color: "#EF4444", ticket: tickets[1] },
      { content: "blocked", color: "#DC2626", ticket: tickets[1] },
      
      // Tags for PROJ-003
      { content: "frontend", color: "#8B5CF6", ticket: tickets[2] },
      { content: "profile", color: "#06B6D4", ticket: tickets[2] },
      
      // Tags for PROJ-004
      { content: "bug", color: "#DC2626", ticket: tickets[3] },
      { content: "critical", color: "#991B1B", ticket: tickets[3] },
      { content: "authentication", color: "#3B82F6", ticket: tickets[3] },
      
      // Tags for PROJ-005
      { content: "api", color: "#10B981", ticket: tickets[4] },
      { content: "crud", color: "#059669", ticket: tickets[4] },
      { content: "backend", color: "#10B981", ticket: tickets[4] },
      
      // Tags for PROJ-006
      { content: "feature", color: "#8B5CF6", ticket: tickets[5] },
      { content: "comments", color: "#06B6D4", ticket: tickets[5] },
      { content: "blocked", color: "#DC2626", ticket: tickets[5] },
      
      // Tags for PROJ-008
      { content: "setup", color: "#6B7280", ticket: tickets[7] },
      { content: "infrastructure", color: "#4B5563", ticket: tickets[7] },
      { content: "docker", color: "#2563EB", ticket: tickets[7] },
      
      // Tags for PROJ-009
      { content: "database", color: "#059669", ticket: tickets[8] },
      { content: "typeorm", color: "#10B981", ticket: tickets[8] },
      
      // Tags for PROJ-013
      { content: "notifications", color: "#06B6D4", ticket: tickets[12] },
      { content: "email", color: "#F59E0B", ticket: tickets[12] },
      { content: "blocked", color: "#DC2626", ticket: tickets[12] },
      
      // Tags for PROJ-014
      { content: "memory-leak", color: "#DC2626", ticket: tickets[13] },
      { content: "websocket", color: "#F59E0B", ticket: tickets[13] },
      { content: "performance", color: "#EF4444", ticket: tickets[13] },
      
      // Tags for PROJ-017
      { content: "2fa", color: "#991B1B", ticket: tickets[16] },
      { content: "security", color: "#EF4444", ticket: tickets[16] },
      { content: "blocked", color: "#DC2626", ticket: tickets[16] },
      
      // Tags for PROJ-020
      { content: "admin", color: "#7C3AED", ticket: tickets[19] },
      { content: "dashboard", color: "#8B5CF6", ticket: tickets[19] },
      { content: "blocked", color: "#DC2626", ticket: tickets[19] },
      
      // Tags for PROJ-026
      { content: "real-time", color: "#F59E0B", ticket: tickets[25] },
      { content: "websocket", color: "#F59E0B", ticket: tickets[25] },
      { content: "notifications", color: "#06B6D4", ticket: tickets[25] },
      { content: "blocked", color: "#DC2626", ticket: tickets[25] },
    ]);

    console.log(`✅ Created ${tags.length} tags`);

    // 5. Create Comments
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
        description: "UPDATE: This is now blocked - we need the SMTP server credentials from IT before we can proceed.",
        user: users[2],
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
      {
        description: "This ticket is blocked until PROJ-005 is completed. Marking as blocked.",
        user: users[2],
        ticket: tickets[5],
      },
    ]);

    console.log(`✅ Created ${comments.length} comments`);

    // 6. Create Tests
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

    console.log("\n✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${users.length} users`);
    console.log(`   - ${sprints.length} sprints`);
    console.log(`   - ${tags.length} tags`);
    console.log(`   - ${comments.length} comments`);
    console.log(`   - ${tests.length} tests`);
    console.log("\n🔑 Login credentials for all users:");
    console.log("   Email: <any-user>@repairsoft.fr");
    console.log("   Password: Password123!");
    console.log("\n   Example: xavier.pelle@repairsoft.fr / Password123!\n");

  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}